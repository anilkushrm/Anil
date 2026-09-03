import { and, eq, lte, sql } from "drizzle-orm";
import { channelsTable, conversationsTable, db, leadsTable, messagesTable } from "@workspace/db";
import { isMetaTransientError, sendMetaText } from "./meta";

const DELIVERY_LEASE_MS = 2 * 60_000;
let outboundWorkerRunning = false;

async function failMessage(messageId: string, error: string, attemptCount?: number) {
  await db.update(messagesTable).set({
    deliveryStatus: "failed",
    deliveryError: error,
    deliveryLeaseUntil: null,
    ...(attemptCount === undefined ? {} : { deliveryAttemptCount: attemptCount }),
  }).where(eq(messagesTable.id, messageId));
}

export async function deliverOutboundMessage(
  workspaceId: string,
  messageId: string,
): Promise<typeof messagesTable.$inferSelect> {
  const now = new Date();
  const [claimed] = await db.update(messagesTable).set({
    deliveryStatus: "sending",
    deliveryAttemptCount: sql`${messagesTable.deliveryAttemptCount} + 1`,
    deliveryLeaseUntil: new Date(now.getTime() + DELIVERY_LEASE_MS),
  }).where(and(
    eq(messagesTable.id, messageId),
    eq(messagesTable.workspaceId, workspaceId),
    eq(messagesTable.direction, "outbound"),
    eq(messagesTable.deliveryStatus, "pending"),
    lte(messagesTable.deliveryNextAttemptAt, now),
  )).returning();

  if (!claimed) {
    const [existing] = await db.select().from(messagesTable).where(and(
      eq(messagesTable.id, messageId),
      eq(messagesTable.workspaceId, workspaceId),
    )).limit(1);
    if (!existing) throw new Error("Outbound message not found.");
    return existing;
  }

  const attempt = claimed.deliveryAttemptCount;

  const [joined] = await db.select({
    conversation: conversationsTable,
  }).from(conversationsTable).where(and(
    eq(conversationsTable.id, claimed.conversationId),
    eq(conversationsTable.workspaceId, workspaceId),
  )).limit(1);
  if (!joined) {
    await failMessage(claimed.id, "Outbound conversation not found.", attempt);
    throw new Error("Outbound conversation not found.");
  }

  const [channel] = await db.select().from(channelsTable).where(and(
    eq(channelsTable.workspaceId, workspaceId),
    eq(channelsTable.type, joined.conversation.channel),
    eq(channelsTable.status, "connected"),
  )).limit(1);
  const [lead] = joined.conversation.leadId
    ? await db.select({ messagingConsent: leadsTable.messagingConsent }).from(leadsTable).where(and(
        eq(leadsTable.id, joined.conversation.leadId),
        eq(leadsTable.workspaceId, workspaceId),
      )).limit(1)
    : [];
  if (lead?.messagingConsent !== "opted_in") {
    const error = lead?.messagingConsent === "opted_out"
      ? "Recipient has opted out of messaging."
      : "Recipient messaging consent has not been confirmed.";
    await failMessage(claimed.id, error, attempt);
    throw new Error(error);
  }
  if (!channel || !joined.conversation.externalParticipantId) {
    const error = "This conversation is not connected to a live Meta recipient.";
    await failMessage(claimed.id, error, attempt);
    throw new Error(error);
  }

  try {
    const result = await sendMetaText(channel, joined.conversation.externalParticipantId, claimed.body);
    const [updated] = await db.update(messagesTable).set({
      deliveryStatus: "sent",
      deliveryAttemptCount: attempt,
      deliveryError: null,
      deliveryLeaseUntil: null,
      providerMessageId: result.providerMessageId,
      deliveredAt: null,
    }).where(eq(messagesTable.id, claimed.id)).returning();
    return updated!;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Message delivery failed.";
    const retry = isMetaTransientError(error) && attempt < 3;
    const [updated] = await db.update(messagesTable).set({
      deliveryStatus: retry ? "pending" : "failed",
      deliveryAttemptCount: attempt,
      deliveryError: message,
      deliveryLeaseUntil: null,
      deliveryNextAttemptAt: new Date(Date.now() + 250 * (2 ** (attempt - 1))),
    }).where(eq(messagesTable.id, claimed.id)).returning();
    if (retry) return updated!;
    throw new Error(message);
  }
}

export async function recoverExpiredOutboundDeliveries(now = new Date()): Promise<number> {
  const recovered = await db.update(messagesTable).set({
    deliveryStatus: "failed",
    deliveryError: "Delivery outcome is unknown after an interrupted provider request; not resent to prevent duplicates.",
    deliveryLeaseUntil: null,
  }).where(and(
    eq(messagesTable.direction, "outbound"),
    eq(messagesTable.deliveryStatus, "sending"),
    lte(messagesTable.deliveryLeaseUntil, now),
  )).returning({ id: messagesTable.id });
  return recovered.length;
}

export async function processPendingOutboundMessages(): Promise<void> {
  if (outboundWorkerRunning) return;
  outboundWorkerRunning = true;
  try {
    await recoverExpiredOutboundDeliveries();
    const pending = await db.select({
      id: messagesTable.id,
      workspaceId: messagesTable.workspaceId,
    }).from(messagesTable).where(and(
      eq(messagesTable.direction, "outbound"),
      eq(messagesTable.deliveryStatus, "pending"),
      lte(messagesTable.deliveryNextAttemptAt, new Date()),
    )).limit(50);
    for (const message of pending) {
      try {
        await deliverOutboundMessage(message.workspaceId, message.id);
      } catch {
        // Delivery state and error are persisted by deliverOutboundMessage.
      }
    }
  } finally {
    outboundWorkerRunning = false;
  }
}

export function startOutboundDeliveryWorker(): () => void {
  void processPendingOutboundMessages();
  const timer = setInterval(() => void processPendingOutboundMessages(), 1_000);
  timer.unref();
  return () => clearInterval(timer);
}

export async function persistLiveOutboundMessage(
  workspaceId: string,
  conversationId: string,
  body: string,
  senderName: string,
  sourceEventId?: string,
) {
  let [message] = await db.insert(messagesTable).values({
    workspaceId,
    conversationId,
    body,
    direction: "outbound",
    senderName,
    sourceEventId,
    deliveryStatus: "pending",
    deliveryAttemptCount: 0,
    deliveryNextAttemptAt: new Date(),
  }).onConflictDoNothing({ target: messagesTable.sourceEventId }).returning();
  if (!message && sourceEventId) {
    [message] = await db.select().from(messagesTable).where(and(
      eq(messagesTable.workspaceId, workspaceId),
      eq(messagesTable.sourceEventId, sourceEventId),
    )).limit(1);
  }
  if (!message) throw new Error("Unable to create outbound message.");

  await db.update(conversationsTable).set({
    lastMessage: body,
    unread: 0,
    updatedAt: new Date(),
  }).where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.workspaceId, workspaceId)));

  if (message.deliveryStatus !== "pending") return message;
  return deliverOutboundMessage(workspaceId, message.id);
}