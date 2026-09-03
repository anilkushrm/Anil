import assert from "node:assert/strict";
import test from "node:test";
import { and, eq } from "drizzle-orm";
import {
  aiMappingsTable,
  aiMemoryItemsTable,
  aiRulesTable,
  aiAgentSettingsTable,
  contactsTable,
  conversationsTable,
  db,
  leadsTable,
  messagesTable,
  sequenceRunsTable,
  sequenceStepsTable,
  sequencesTable,
  workspacesTable,
} from "@workspace/db";
import { enqueueSequenceRun, processRun, scanNoReplyTriggers } from "./automation";
import { executeAiRuntime, persistAiDryRunReply } from "./ai-runtime";

test("sequence runs are workspace-scoped, idempotent, and advance to completion", async () => {
  const workspaceNames = [`Automation Test ${crypto.randomUUID()}`, `Automation Test ${crypto.randomUUID()}`];
  const createdWorkspaces: string[] = [];
  try {
    const workspaces = await db.insert(workspacesTable).values(workspaceNames.map((name) => ({
      name,
      slug: `automation-test-${crypto.randomUUID()}`,
    }))).returning();
    createdWorkspaces.push(...workspaces.map((workspace) => workspace.id));

    const contacts = await db.insert(contactsTable).values(workspaces.map((workspace, index) => ({
      workspaceId: workspace.id,
      name: `Test Contact ${index}`,
      email: "original@example.com",
    }))).returning();
    const leads = await db.insert(leadsTable).values(workspaces.map((workspace, index) => ({
      workspaceId: workspace.id,
      contactId: contacts[index]!.id,
      name: `Test Lead ${index}`,
      assignee: "Unassigned",
      tags: [],
    }))).returning();
    const sequences = await db.insert(sequencesTable).values(workspaces.map((workspace, index) => ({
      workspaceId: workspace.id,
      name: `Test Sequence ${index}`,
      status: "active",
      triggerType: "manual",
      timezone: "UTC",
      quietHoursStart: "00:00",
      quietHoursEnd: "00:00",
    }))).returning();
    await db.insert(sequenceStepsTable).values(sequences.map((sequence) => ({
      workspaceId: sequence.workspaceId,
      sequenceId: sequence.id,
      position: 0,
      type: "message",
      title: "Lifecycle check",
      delayMinutes: 0,
      message: "Budget: outbound-only\nEmail: outbound@example.com\nThe lead wants demo options",
    })));
    await db.insert(sequenceStepsTable).values({
      workspaceId: workspaces[0]!.id,
      sequenceId: sequences[0]!.id,
      position: 1,
      type: "message",
      title: "Second follow-up",
      delayMinutes: 0,
      channel: "whatsapp",
      message: "This must not send after a reply on another channel.",
    });
    await db.insert(aiAgentSettingsTable).values({
      workspaceId: workspaces[0]!.id,
      provider: "gemini",
      model: "gemini-2.5-flash",
      botName: "Test Assistant",
      companyName: "Test Company",
      autoUpdateContact: false,
      rememberContext: true,
      useConversationHistory: true,
      retentionDays: 30,
    });
    await db.insert(aiMemoryItemsTable).values({
      workspaceId: workspaces[0]!.id,
      kind: "faq",
      title: "Demo options",
      content: "Premium plans include a guided demo.",
      tags: ["demo"],
    });
    await db.insert(aiMappingsTable).values({
      workspaceId: workspaces[0]!.id,
      fieldName: "Budget",
      crmField: "leads.tags",
      instruction: "Store the captured budget as a lead tag.",
    });
    await db.insert(aiMappingsTable).values({
      workspaceId: workspaces[0]!.id,
      fieldName: "Email",
      crmField: "leads.email",
      instruction: "Update the lead email only.",
    });
    await db.insert(aiRulesTable).values({
      workspaceId: workspaces[0]!.id,
      trigger: "wants demo",
      actionText: "Set lead stage to qualified",
    });
    await db.update(sequencesTable).set({
      status: "active",
      triggerType: "stage_changed",
      triggerConfig: "qualified",
    }).where(eq(sequencesTable.id, sequences[0]!.id));

    const sharedKey = `integration:${crypto.randomUUID()}`;
    const [conversation] = await db.insert(conversationsTable).values({
      workspaceId: workspaces[0]!.id,
      leadId: leads[0]!.id,
      contactName: leads[0]!.name,
      channel: "whatsapp",
      lastMessage: "Earlier context",
    }).returning();
    const [earlierInbound] = await db.insert(messagesTable).values({
      workspaceId: workspaces[0]!.id,
      conversationId: conversation!.id,
      body: "Earlier inbound context",
      direction: "inbound",
      senderName: leads[0]!.name,
    }).returning();
    const runtime = await executeAiRuntime(
      workspaces[0]!.id,
      leads[0]!.id,
      "Budget: premium\nEmail: changed@example.com\nThe lead wants demo options",
      { conversationId: conversation!.id, eventKey: `inbound-message:${conversation!.id}` },
    );
    assert.equal(runtime.status, "replied");
    assert.equal(runtime.provider, "gemini");
    assert.equal(runtime.model, "gemini-2.5-flash");
    assert.deepEqual(runtime.memoryUsed, ["Demo options"]);
    assert.equal(runtime.historyMessages, 1);
    assert.equal(runtime.contactUpdated, false);
    assert.equal(runtime.mappingsApplied.length, 2);
    assert.equal(runtime.rulesExecuted.length, 1);
    const aiReply = await persistAiDryRunReply(
      workspaces[0]!.id,
      conversation!.id,
      runtime.replyPreview,
      runtime.senderName,
    );
    assert.equal(aiReply.direction, "outbound");
    assert.equal(aiReply.deliveryStatus, "delivery_disabled");
    const [conversationAfterReply] = await db.select().from(conversationsTable)
      .where(eq(conversationsTable.id, conversation!.id)).limit(1);
    assert.equal(conversationAfterReply?.lastMessage, runtime.replyPreview);
    await executeAiRuntime(
      workspaces[0]!.id,
      leads[0]!.id,
      "Budget: premium\nEmail: changed@example.com\nThe lead wants demo options",
      { conversationId: conversation!.id, eventKey: `inbound-message:${conversation!.id}` },
    );
    const automaticRuns = await db.select().from(sequenceRunsTable).where(and(
      eq(sequenceRunsTable.workspaceId, workspaces[0]!.id),
      eq(sequenceRunsTable.sequenceId, sequences[0]!.id),
      eq(sequenceRunsTable.leadId, leads[0]!.id),
    ));
    assert.equal(automaticRuns.length, 1);
    assert.equal(automaticRuns[0]?.idempotencyKey, `trigger:${sequences[0]!.id}:inbound-message:${conversation!.id}`);
    const [first] = await enqueueSequenceRun(sequences[0]!, leads[0]!.id, sharedKey);
    const duplicate = await enqueueSequenceRun(sequences[0]!, leads[0]!.id, sharedKey);
    const [otherTenant] = await enqueueSequenceRun(sequences[1]!, leads[1]!.id, sharedKey);

    assert.ok(first);
    assert.equal(duplicate.length, 0);
    assert.ok(otherTenant);
    assert.notEqual(first!.workspaceId, otherTenant!.workspaceId);

    await processRun(first!);
    const [advanced] = await db.select().from(sequenceRunsTable).where(eq(sequenceRunsTable.id, first!.id)).limit(1);
    assert.equal(advanced?.status, "scheduled");
    assert.equal(advanced?.currentStep, 1);
    const [updatedLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, leads[0]!.id)).limit(1);
    assert.equal(updatedLead?.stage, "qualified");
    assert.ok(updatedLead?.tags.includes("premium"));
    assert.equal(updatedLead?.email, "changed@example.com");
    const [outbound] = await db.select().from(messagesTable).where(and(
      eq(messagesTable.workspaceId, workspaces[0]!.id),
      eq(messagesTable.sequenceRunId, first!.id),
    )).limit(1);
    assert.equal(outbound?.direction, "outbound");
    assert.equal(outbound?.deliveryStatus, "delivery_disabled");
    assert.equal(outbound?.body.includes("outbound@example.com"), true);
    assert.equal(updatedLead?.tags.includes("outbound-only"), false);
    const [otherChannel] = await db.insert(conversationsTable).values({
      workspaceId: workspaces[0]!.id,
      leadId: leads[0]!.id,
      contactName: leads[0]!.name,
      channel: "instagram",
      lastMessage: "Customer replied on Instagram",
    }).returning();
    await db.insert(messagesTable).values({
      workspaceId: workspaces[0]!.id,
      conversationId: otherChannel!.id,
      body: "Customer replied on Instagram",
      direction: "inbound",
      senderName: leads[0]!.name,
    });
    await processRun(advanced!);
    const [canceledAfterReply] = await db.select().from(sequenceRunsTable)
      .where(eq(sequenceRunsTable.id, first!.id)).limit(1);
    assert.equal(canceledAfterReply?.status, "canceled");
    assert.equal(canceledAfterReply?.lastError, "Lead replied.");
    const secondStepMessages = await db.select().from(messagesTable).where(and(
      eq(messagesTable.workspaceId, workspaces[0]!.id),
      eq(messagesTable.sequenceRunId, first!.id),
    ));
    assert.equal(secondStepMessages.length, 1);
    const [unchangedContact] = await db.select().from(contactsTable).where(eq(contactsTable.id, contacts[0]!.id)).limit(1);
    assert.equal(unchangedContact?.email, "original@example.com");

    const [noReplySequence] = await db.insert(sequencesTable).values({
      workspaceId: workspaces[0]!.id,
      name: "No reply follow-up",
      status: "active",
      triggerType: "no_reply",
      triggerConfig: "1",
      timezone: "UTC",
      quietHoursStart: "00:00",
      quietHoursEnd: "00:00",
    }).returning();
    await db.insert(sequenceStepsTable).values({
      workspaceId: workspaces[0]!.id,
      sequenceId: noReplySequence!.id,
      position: 0,
      type: "message",
      title: "Follow up",
      message: "Checking in after no reply.",
    });
    await db.update(messagesTable).set({
      sentAt: new Date(Date.now() - 10 * 60_000),
    }).where(eq(messagesTable.id, outbound!.id));
    await db.update(messagesTable).set({
      sentAt: new Date(Date.now() - 5 * 60_000),
    }).where(eq(messagesTable.id, earlierInbound!.id));
    await db.update(messagesTable).set({
      sentAt: new Date(Date.now() - 2 * 60_000),
    }).where(eq(messagesTable.id, aiReply.id));
    await scanNoReplyTriggers();
    await scanNoReplyTriggers();
    const noReplyRuns = await db.select().from(sequenceRunsTable).where(and(
      eq(sequenceRunsTable.workspaceId, workspaces[0]!.id),
      eq(sequenceRunsTable.sequenceId, noReplySequence!.id),
      eq(sequenceRunsTable.leadId, leads[0]!.id),
    ));
    assert.equal(noReplyRuns.length, 1);
    assert.equal(noReplyRuns[0]?.idempotencyKey, `trigger:${noReplySequence!.id}:no-reply:${conversation!.id}:${aiReply.id}`);
    await processRun(noReplyRuns[0]!);
    const [noReplyOutbound] = await db.select().from(messagesTable).where(and(
      eq(messagesTable.workspaceId, workspaces[0]!.id),
      eq(messagesTable.sequenceRunId, noReplyRuns[0]!.id),
    )).limit(1);
    assert.equal(noReplyOutbound?.direction, "outbound");
    await db.update(messagesTable).set({
      sentAt: new Date(Date.now() - 2 * 60_000),
    }).where(eq(messagesTable.id, noReplyOutbound!.id));
    await scanNoReplyTriggers();
    const runsAfterFollowUp = await db.select().from(sequenceRunsTable).where(and(
      eq(sequenceRunsTable.workspaceId, workspaces[0]!.id),
      eq(sequenceRunsTable.sequenceId, noReplySequence!.id),
      eq(sequenceRunsTable.leadId, leads[0]!.id),
    ));
    assert.equal(runsAfterFollowUp.length, 1);
  } finally {
    for (const workspaceId of createdWorkspaces) {
      await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));
    }
  }
});