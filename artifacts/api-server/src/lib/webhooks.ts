import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, lte, or } from "drizzle-orm";
import {
  activitiesTable,
  channelsTable,
  contactsTable,
  conversationsTable,
  db,
  leadsTable,
  metaWebhookEventsTable,
  messagesTable,
  webhookDeliveriesTable,
  webhooksTable,
} from "@workspace/db";
import { executeAiRuntime, persistAiLiveReply } from "./ai-runtime";
import { postPinnedWebhook, validateWebhookUrl } from "./webhook-transport";
export { validateWebhookUrl } from "./webhook-transport";

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function deliver(
  workspaceId: string,
  webhook: typeof webhooksTable.$inferSelect,
  event: "lead.created",
  data: unknown,
): Promise<void> {
  const [delivery] = await db.insert(webhookDeliveriesTable).values({
    workspaceId,
    webhookId: webhook.id,
    event,
  }).returning();
  if (!delivery) return;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const target = await validateWebhookUrl(webhook.url);
      const httpStatus = await postPinnedWebhook(target, event, data);
      await db.update(webhookDeliveriesTable).set({
        status: "delivered",
        attemptCount: attempt,
        httpStatus,
        lastError: null,
        deliveredAt: new Date(),
      }).where(eq(webhookDeliveriesTable.id, delivery.id));
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : "Webhook delivery failed";
      await db.update(webhookDeliveriesTable).set({
        status: attempt === 3 ? "failed" : "pending",
        attemptCount: attempt,
        lastError: message,
      }).where(and(eq(webhookDeliveriesTable.id, delivery.id), eq(webhookDeliveriesTable.workspaceId, workspaceId)));
      if (attempt < 3) await sleep(250 * (2 ** (attempt - 1)));
    }
  }
}

export async function dispatchWorkspaceEvent(workspaceId: string, event: "lead.created", data: unknown): Promise<void> {
  const webhooks = await db.select().from(webhooksTable)
    .where(and(eq(webhooksTable.workspaceId, workspaceId), eq(webhooksTable.status, "active")));
  await Promise.allSettled(webhooks.map((webhook) => deliver(workspaceId, webhook, event, data)));
}

type MetaInbound = {
  channel: "whatsapp" | "instagram" | "facebook";
  accountId: string;
  participantId: string;
  participantName: string;
  providerMessageId: string;
  text: string;
  threadId: string;
};

type MetaReceipt = {
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  error?: string;
};

function normalizedPhone(value: string): string {
  return value.replace(/\D/g, "");
}

function optOutRequested(text: string): boolean {
  return /^(stop|unsubscribe|cancel|end|quit|opt[\s-]?out)$/i.test(text.trim());
}

export function parseMetaPayload(payload: unknown): { inbound: MetaInbound[]; receipts: MetaReceipt[] } {
  const body = payload as {
    object?: string;
    entry?: Array<{
      id?: string;
      messaging?: Array<{
        sender?: { id?: string };
        recipient?: { id?: string };
        message?: { mid?: string; text?: string; is_echo?: boolean };
        delivery?: { mids?: string[] };
      }>;
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
          messages?: Array<{ id?: string; from?: string; text?: { body?: string } }>;
          statuses?: Array<{ id?: string; status?: string; errors?: Array<{ title?: string; message?: string }> }>;
        };
      }>;
    }>;
  };
  const inbound: MetaInbound[] = [];
  const receipts: MetaReceipt[] = [];
  for (const entry of body.entry ?? []) {
    if (body.object === "whatsapp_business_account") {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const accountId = value?.metadata?.phone_number_id ?? "";
        for (const message of value?.messages ?? []) {
          const participantId = message.from ?? value?.contacts?.[0]?.wa_id ?? "";
          const text = message.text?.body ?? "";
          if (!accountId || !participantId || !message.id || !text) continue;
          inbound.push({
            channel: "whatsapp",
            accountId,
            participantId,
            participantName: value?.contacts?.[0]?.profile?.name ?? participantId,
            providerMessageId: message.id,
            text,
            threadId: participantId,
          });
        }
        for (const status of value?.statuses ?? []) {
          if (!status.id || !["sent", "delivered", "read", "failed"].includes(status.status ?? "")) continue;
          receipts.push({
            providerMessageId: status.id,
            status: status.status as MetaReceipt["status"],
            error: status.errors?.[0]?.message ?? status.errors?.[0]?.title,
          });
        }
      }
      continue;
    }
    const channel = body.object === "instagram"
      ? "instagram"
      : body.object === "page" ? "facebook" : null;
    if (!channel) continue;
    for (const event of entry.messaging ?? []) {
      const accountId = entry.id ?? event.recipient?.id ?? "";
      const participantId = event.sender?.id ?? "";
      const text = event.message?.text ?? "";
      for (const providerMessageId of event.delivery?.mids ?? []) {
        receipts.push({ providerMessageId, status: "delivered" });
      }
      if (event.message?.is_echo === true) continue;
      if (!accountId || !participantId || !event.message?.mid || !text) continue;
      inbound.push({
        channel,
        accountId,
        participantId,
        participantName: participantId,
        providerMessageId: event.message.mid,
        text,
        threadId: participantId,
      });
    }
  }
  return { inbound, receipts };
}

export function verifyMetaWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const appSecret = process.env["META_APP_SECRET"];
  if (!appSecret || !signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  const actual = Buffer.from(signature.slice(7), "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function applyMetaReceipt(receipt: MetaReceipt): Promise<void> {
  const status = receipt.status === "failed"
    ? "failed"
    : receipt.status === "sent" ? "sent" : "delivered";
  await db.update(messagesTable).set({
    deliveryStatus: status,
    deliveryError: receipt.status === "failed" ? receipt.error ?? "Meta reported delivery failure." : null,
    deliveredAt: receipt.status === "delivered" || receipt.status === "read" ? new Date() : undefined,
  }).where(eq(messagesTable.providerMessageId, receipt.providerMessageId));
}

async function findOrCreateLead(event: MetaInbound, workspaceId: string) {
  if (event.channel === "whatsapp") {
    const leads = await db.select().from(leadsTable).where(eq(leadsTable.workspaceId, workspaceId));
    const existing = leads.find((lead) => normalizedPhone(lead.phone) === normalizedPhone(event.participantId));
    if (existing) return existing;
  }
  const [contact] = await db.insert(contactsTable).values({
    workspaceId,
    name: event.participantName,
    phone: event.channel === "whatsapp" ? event.participantId : "",
  }).returning();
  const [lead] = await db.insert(leadsTable).values({
    workspaceId,
    contactId: contact?.id,
    name: event.participantName,
    phone: event.channel === "whatsapp" ? event.participantId : "",
    source: event.channel,
    stage: "new",
    assignee: "Unassigned",
  }).returning();
  if (!lead) throw new Error("Unable to create a lead for the Meta message.");
  return lead;
}

async function processMetaInbound(event: MetaInbound): Promise<void> {
  const [channel] = await db.select().from(channelsTable).where(and(
    eq(channelsTable.type, event.channel),
    eq(channelsTable.externalAccountId, event.accountId),
    eq(channelsTable.status, "connected"),
  )).limit(1);
  if (!channel) return;

  let [conversation] = await db.select().from(conversationsTable).where(and(
    eq(conversationsTable.workspaceId, channel.workspaceId),
    eq(conversationsTable.channel, event.channel),
    eq(conversationsTable.channelAccountId, event.accountId),
    eq(conversationsTable.externalParticipantId, event.participantId),
  )).limit(1);
  const lead = conversation?.leadId
    ? (await db.select().from(leadsTable).where(and(
        eq(leadsTable.id, conversation.leadId),
        eq(leadsTable.workspaceId, channel.workspaceId),
      )).limit(1))[0] ?? await findOrCreateLead(event, channel.workspaceId)
    : await findOrCreateLead(event, channel.workspaceId);

  if (!conversation) {
    [conversation] = await db.insert(conversationsTable).values({
      workspaceId: channel.workspaceId,
      leadId: lead.id,
      contactName: event.participantName,
      channel: event.channel,
      channelAccountId: event.accountId,
      externalParticipantId: event.participantId,
      externalThreadId: event.threadId,
      lastMessage: event.text,
      unread: 1,
    }).returning();
  } else {
    [conversation] = await db.update(conversationsTable).set({
      leadId: lead.id,
      contactName: event.participantName,
      lastMessage: event.text,
      unread: conversation.unread + 1,
      updatedAt: new Date(),
    }).where(and(
      eq(conversationsTable.id, conversation.id),
      eq(conversationsTable.workspaceId, channel.workspaceId),
    )).returning();
  }
  if (!conversation) throw new Error("Unable to create a conversation for the Meta message.");
  let [message] = await db.insert(messagesTable).values({
    workspaceId: channel.workspaceId,
    conversationId: conversation.id,
    body: event.text,
    direction: "inbound",
    senderName: event.participantName,
    providerMessageId: event.providerMessageId,
    deliveryStatus: "delivered",
    deliveredAt: new Date(),
  }).onConflictDoNothing({ target: messagesTable.providerMessageId }).returning();
  if (!message) {
    [message] = await db.select().from(messagesTable)
      .where(eq(messagesTable.providerMessageId, event.providerMessageId)).limit(1);
  }
  if (!message) throw new Error("Unable to persist the inbound Meta message.");

  if (optOutRequested(event.text)) {
    await db.update(leadsTable).set({ messagingConsent: "opted_out", optedOutAt: new Date() })
      .where(and(eq(leadsTable.id, lead.id), eq(leadsTable.workspaceId, channel.workspaceId)));
    if (lead.messagingConsent !== "opted_out") {
      await db.insert(activitiesTable).values({
        workspaceId: channel.workspaceId,
        title: "Messaging opt-out recorded",
        detail: `${lead.name} opted out on ${event.channel}.`,
      });
    }
    return;
  }

  if (lead.messagingConsent === "unknown" || /^(start|unstop|subscribe)$/i.test(event.text.trim())) {
    await db.update(leadsTable).set({ messagingConsent: "opted_in", optedOutAt: null })
      .where(and(eq(leadsTable.id, lead.id), eq(leadsTable.workspaceId, channel.workspaceId)));
    lead.messagingConsent = "opted_in";
  }

  const result = await executeAiRuntime(channel.workspaceId, lead.id, event.text, {
    conversationId: conversation.id,
    eventKey: `meta:${event.providerMessageId}`,
  });
  if (result.status === "replied" && result.replyPreview) {
    try {
      await persistAiLiveReply(
        channel.workspaceId,
        conversation.id,
        result.replyPreview,
        result.senderName,
        `meta-reply:${event.providerMessageId}`,
      );
    } catch (error) {
      await db.insert(activitiesTable).values({
        workspaceId: channel.workspaceId,
        title: "Meta reply delivery failed",
        detail: error instanceof Error ? error.message.slice(0, 500) : "Meta reply delivery failed.",
      });
    }
  }
}

export async function enqueueMetaWebhook(payload: unknown): Promise<number> {
  const parsed = parseMetaPayload(payload);
  const queued = [
    ...parsed.inbound.map((event) => ({
      providerEventId: event.providerMessageId,
      kind: "inbound",
      payload: event,
    })),
    ...parsed.receipts.map((receipt) => ({
      providerEventId: `receipt:${receipt.providerMessageId}:${receipt.status}`,
      kind: "receipt",
      payload: receipt,
    })),
  ];
  if (!queued.length) return 0;
  const inserted = await db.insert(metaWebhookEventsTable).values(queued)
    .onConflictDoNothing({ target: metaWebhookEventsTable.providerEventId })
    .returning({ id: metaWebhookEventsTable.id });
  return inserted.length;
}

let metaWorkerRunning = false;
export async function processPendingMetaWebhookEvents(): Promise<void> {
  if (metaWorkerRunning) return;
  metaWorkerRunning = true;
  try {
    const now = new Date();
    const events = await db.select().from(metaWebhookEventsTable).where(or(
      and(eq(metaWebhookEventsTable.status, "pending"), lte(metaWebhookEventsTable.nextAttemptAt, now)),
      and(eq(metaWebhookEventsTable.status, "processing"), lte(metaWebhookEventsTable.nextAttemptAt, now)),
    )).limit(50);
    for (const event of events) {
      const [claimed] = await db.update(metaWebhookEventsTable).set({
        status: "processing",
        attemptCount: event.attemptCount + 1,
        nextAttemptAt: new Date(Date.now() + 60_000),
      }).where(and(
        eq(metaWebhookEventsTable.id, event.id),
        or(
          and(eq(metaWebhookEventsTable.status, "pending"), lte(metaWebhookEventsTable.nextAttemptAt, now)),
          and(eq(metaWebhookEventsTable.status, "processing"), lte(metaWebhookEventsTable.nextAttemptAt, now)),
        ),
      )).returning();
      if (!claimed) continue;
      try {
        if (claimed.kind === "receipt") await applyMetaReceipt(claimed.payload as MetaReceipt);
        else await processMetaInbound(claimed.payload as MetaInbound);
        await db.update(metaWebhookEventsTable).set({
          status: "processed",
          lastError: null,
          processedAt: new Date(),
        }).where(eq(metaWebhookEventsTable.id, claimed.id));
      } catch (error) {
        const exhausted = claimed.attemptCount >= 5;
        await db.update(metaWebhookEventsTable).set({
          status: exhausted ? "failed" : "pending",
          lastError: error instanceof Error ? error.message.slice(0, 500) : "Meta webhook processing failed.",
          nextAttemptAt: new Date(Date.now() + Math.min(60_000, 1_000 * (2 ** claimed.attemptCount))),
        }).where(eq(metaWebhookEventsTable.id, claimed.id));
      }
    }
  } finally {
    metaWorkerRunning = false;
  }
}

export function startMetaWebhookWorker(): () => void {
  void processPendingMetaWebhookEvents();
  const timer = setInterval(() => void processPendingMetaWebhookEvents(), 5_000);
  timer.unref();
  return () => clearInterval(timer);
}