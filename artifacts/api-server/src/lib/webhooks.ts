import { and, eq } from "drizzle-orm";
import { db, webhookDeliveriesTable, webhooksTable } from "@workspace/db";
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