import { and, desc, eq, lte } from "drizzle-orm";
import {
  activitiesTable,
  aiAgentSettingsTable,
  conversationsTable,
  db,
  leadsTable,
  messagesTable,
  sequenceRunsTable,
  sequenceStepsTable,
  sequencesTable,
} from "@workspace/db";
import { nextAllowedTime } from "./automation-schedule";
import { composeAiOutboundMessage } from "./ai-runtime";
import { enqueueSequenceRun } from "./automation-enrollment";
export { enqueueSequenceRun, enrollMatchingSequences } from "./automation-enrollment";
export { isQuietTime, isValidTimeZone, localMinutesAt, nextAllowedTime, validateTriggerConfig } from "./automation-schedule";

async function shouldExitRun(workspaceId: string, leadId: string | null, runCreatedAt: Date, exitOnReply: boolean, exitOnUnsubscribe: boolean) {
  if (!leadId) return "Lead no longer exists.";
  const [lead] = await db.select().from(leadsTable).where(and(
    eq(leadsTable.id, leadId),
    eq(leadsTable.workspaceId, workspaceId),
  )).limit(1);
  if (!lead) return "Lead no longer exists.";
  const normalizedTags = lead.tags.map((tag) => tag.toLowerCase());
  if (exitOnUnsubscribe && normalizedTags.some((tag) => ["opt-out", "optout", "unsubscribed", "do-not-contact", "dnc"].includes(tag))) {
    return "Lead opted out.";
  }
  const [settings] = await db.select().from(aiAgentSettingsTable)
    .where(eq(aiAgentSettingsTable.workspaceId, workspaceId)).limit(1);
  if (settings?.stopOnHuman && lead.assignee !== "Unassigned") return "Human agent owns this lead.";
  if (exitOnReply) {
    const [reply] = await db.select({ sentAt: messagesTable.sentAt })
      .from(messagesTable)
      .innerJoin(conversationsTable, and(
        eq(conversationsTable.id, messagesTable.conversationId),
        eq(conversationsTable.workspaceId, messagesTable.workspaceId),
      ))
      .where(and(
        eq(messagesTable.workspaceId, workspaceId),
        eq(messagesTable.direction, "inbound"),
        eq(conversationsTable.leadId, leadId),
      ))
      .orderBy(desc(messagesTable.sentAt))
      .limit(1);
    if (reply && reply.sentAt > runCreatedAt) return "Lead replied.";
  }
  return null;
}

export async function processRun(run: typeof sequenceRunsTable.$inferSelect): Promise<void> {
  const [claimed] = await db.update(sequenceRunsTable).set({ status: "running" }).where(and(
    eq(sequenceRunsTable.id, run.id),
    eq(sequenceRunsTable.status, "scheduled"),
  )).returning();
  if (!claimed) return;
  const [sequence] = await db.select().from(sequencesTable).where(and(
    eq(sequencesTable.id, run.sequenceId),
    eq(sequencesTable.workspaceId, run.workspaceId),
  )).limit(1);
  if (!sequence || sequence.status !== "active") {
    await db.update(sequenceRunsTable).set({ status: "paused", lastError: "Sequence is not active.", nextRunAt: null }).where(eq(sequenceRunsTable.id, run.id));
    return;
  }
  const steps = await db.select().from(sequenceStepsTable).where(and(
    eq(sequenceStepsTable.sequenceId, sequence.id),
    eq(sequenceStepsTable.workspaceId, run.workspaceId),
  )).orderBy(sequenceStepsTable.position);
  const step = steps[run.currentStep];
  if (!step) {
    await db.update(sequenceRunsTable).set({ status: "completed", nextRunAt: null, lastError: null }).where(eq(sequenceRunsTable.id, run.id));
    return;
  }
  const now = new Date();
  const allowedAt = nextAllowedTime(now, sequence.timezone, sequence.quietHoursStart, sequence.quietHoursEnd);
  if (allowedAt > now) {
    await db.update(sequenceRunsTable).set({ status: "scheduled", nextRunAt: allowedAt, lastError: null }).where(eq(sequenceRunsTable.id, run.id));
    return;
  }
  const exitReason = await shouldExitRun(run.workspaceId, run.leadId, run.createdAt, step.exitOnReply, step.exitOnUnsubscribe);
  if (exitReason) {
    await db.update(sequenceRunsTable).set({ status: "canceled", nextRunAt: null, lastError: exitReason }).where(eq(sequenceRunsTable.id, run.id));
    return;
  }
  const invalidStep = ["message", "ai"].includes(step.type) && !step.message.trim();
  if (invalidStep) {
    const attempts = run.attemptCount + 1;
    if (step.fallbackAction === "pause" || (step.fallbackAction === "retry" && attempts >= 3)) {
      await db.update(sequenceRunsTable).set({ status: "paused", attemptCount: attempts, nextRunAt: null, lastError: "Step has no message content." }).where(eq(sequenceRunsTable.id, run.id));
      return;
    }
    if (step.fallbackAction === "retry") {
      await db.update(sequenceRunsTable).set({ status: "scheduled", attemptCount: attempts, nextRunAt: new Date(now.getTime() + 5 * 60_000), lastError: "Step has no message content." }).where(eq(sequenceRunsTable.id, run.id));
      return;
    }
  }
  await db.insert(activitiesTable).values({
    workspaceId: run.workspaceId,
    title: "Sequence step processed",
    detail: `${sequence.name}: ${step.title} (${step.channel}, provider-disabled dry run).`,
  });
  if ((step.type === "ai" || step.type === "message") && run.leadId) {
    const [lead] = await db.select().from(leadsTable).where(and(
      eq(leadsTable.id, run.leadId),
      eq(leadsTable.workspaceId, run.workspaceId),
    )).limit(1);
    if (!lead) throw new Error("Sequence lead no longer exists.");
    let [conversation] = await db.select().from(conversationsTable).where(and(
      eq(conversationsTable.workspaceId, run.workspaceId),
      eq(conversationsTable.leadId, lead.id),
      eq(conversationsTable.channel, step.channel),
    )).limit(1);
    const outbound = step.type === "ai"
      ? await composeAiOutboundMessage(run.workspaceId, step.message)
      : { body: step.message, senderName: "Sequence automation", provider: "static", model: "template" };
    if (!conversation) {
      [conversation] = await db.insert(conversationsTable).values({
        workspaceId: run.workspaceId,
        leadId: lead.id,
        contactName: lead.name,
        channel: step.channel,
        lastMessage: outbound.body,
      }).returning();
    } else {
      [conversation] = await db.update(conversationsTable).set({
        lastMessage: outbound.body,
      }).where(and(
        eq(conversationsTable.id, conversation.id),
        eq(conversationsTable.workspaceId, run.workspaceId),
      )).returning();
    }
    await db.insert(messagesTable).values({
      workspaceId: run.workspaceId,
      conversationId: conversation!.id,
      body: outbound.body,
      direction: "outbound",
      senderName: outbound.senderName,
      sequenceRunId: run.id,
      sequenceStepId: step.id,
      deliveryStatus: "delivery_disabled",
    });
  }
  const nextIndex = run.currentStep + 1;
  const nextStep = steps[nextIndex];
  await db.update(sequenceRunsTable).set(nextStep ? {
    status: "scheduled",
    currentStep: nextIndex,
    attemptCount: 0,
    lastError: null,
    nextRunAt: new Date(now.getTime() + nextStep.delayMinutes * 60_000),
  } : {
    status: "completed",
    currentStep: nextIndex,
    attemptCount: 0,
    lastError: null,
    nextRunAt: null,
  }).where(eq(sequenceRunsTable.id, run.id));
}

export async function scanNoReplyTriggers(): Promise<void> {
  const sequences = await db.select().from(sequencesTable).where(and(
    eq(sequencesTable.status, "active"),
    eq(sequencesTable.triggerType, "no_reply"),
  ));
  for (const sequence of sequences) {
    const threshold = Number(sequence.triggerConfig);
    if (!Number.isFinite(threshold) || threshold < 1) continue;
    const conversations = await db.select().from(conversationsTable).where(eq(conversationsTable.workspaceId, sequence.workspaceId));
    for (const conversation of conversations) {
      if (!conversation.leadId) continue;
      const [message] = await db.select().from(messagesTable)
        .where(eq(messagesTable.conversationId, conversation.id))
        .orderBy(desc(messagesTable.sentAt)).limit(1);
      if (!message || message.direction !== "outbound" || Date.now() - message.sentAt.getTime() < threshold * 60_000) continue;
      if (message.sequenceRunId) {
        const [origin] = await db.select({ triggerType: sequencesTable.triggerType })
          .from(sequenceRunsTable)
          .innerJoin(sequencesTable, and(
            eq(sequencesTable.id, sequenceRunsTable.sequenceId),
            eq(sequencesTable.workspaceId, sequenceRunsTable.workspaceId),
          ))
          .where(and(
            eq(sequenceRunsTable.id, message.sequenceRunId),
            eq(sequenceRunsTable.workspaceId, sequence.workspaceId),
          )).limit(1);
        if (origin?.triggerType === "no_reply") continue;
      }
      await enqueueSequenceRun(sequence, conversation.leadId, `trigger:${sequence.id}:no-reply:${conversation.id}:${message.id}`);
    }
  }
}

let processing = false;
export async function processAutomationTick(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    await scanNoReplyTriggers();
    const dueRuns = await db.select().from(sequenceRunsTable).where(and(
      eq(sequenceRunsTable.status, "scheduled"),
      lte(sequenceRunsTable.nextRunAt, new Date()),
    )).orderBy(sequenceRunsTable.nextRunAt).limit(50);
    for (const run of dueRuns) {
      try {
        await processRun(run);
      } catch (error) {
        console.error(`Automation run ${run.id} failed`, error);
        await db.update(sequenceRunsTable).set({
          status: "failed",
          nextRunAt: null,
          lastError: error instanceof Error ? error.message.slice(0, 500) : "Unexpected automation error.",
        }).where(eq(sequenceRunsTable.id, run.id));
      }
    }
  } catch (error) {
    console.error("Automation scheduler tick failed", error);
  } finally {
    processing = false;
  }
}

export function startAutomationScheduler(): () => void {
  void processAutomationTick();
  const timer = setInterval(() => void processAutomationTick(), 15_000);
  timer.unref();
  return () => clearInterval(timer);
}