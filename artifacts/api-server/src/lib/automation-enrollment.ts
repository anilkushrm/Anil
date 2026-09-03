import { and, eq } from "drizzle-orm";
import {
  db,
  sequenceRunsTable,
  sequenceStepsTable,
  sequencesTable,
} from "@workspace/db";
import { nextAllowedTime } from "./automation-schedule";

type TriggerType = "new_lead" | "no_reply" | "stage_changed";
type SequenceRecord = typeof sequencesTable.$inferSelect;

function triggerMatches(triggerType: TriggerType, config: string, context: { source?: string; stage?: string }): boolean {
  const normalized = config.trim().toLowerCase();
  if (triggerType === "new_lead") return normalized === "any" || normalized === (context.source ?? "").toLowerCase();
  if (triggerType === "stage_changed") return normalized === (context.stage ?? "").toLowerCase();
  return true;
}

export async function enqueueSequenceRun(sequence: SequenceRecord, leadId: string, idempotencyKey: string) {
  const [firstStep] = await db.select().from(sequenceStepsTable).where(and(
    eq(sequenceStepsTable.sequenceId, sequence.id),
    eq(sequenceStepsTable.workspaceId, sequence.workspaceId),
  )).orderBy(sequenceStepsTable.position).limit(1);
  const delayed = new Date(Date.now() + (firstStep?.delayMinutes ?? 0) * 60_000);
  const nextRunAt = nextAllowedTime(delayed, sequence.timezone, sequence.quietHoursStart, sequence.quietHoursEnd);
  return db.insert(sequenceRunsTable).values({
    workspaceId: sequence.workspaceId,
    sequenceId: sequence.id,
    leadId,
    idempotencyKey,
    nextRunAt,
  }).onConflictDoNothing().returning();
}

export async function enrollMatchingSequences(
  workspaceId: string,
  leadId: string,
  triggerType: TriggerType,
  context: { source?: string; stage?: string; eventKey: string },
): Promise<void> {
  const sequences = await db.select().from(sequencesTable).where(and(
    eq(sequencesTable.workspaceId, workspaceId),
    eq(sequencesTable.status, "active"),
    eq(sequencesTable.triggerType, triggerType),
  ));
  for (const sequence of sequences) {
    if (!triggerMatches(triggerType, sequence.triggerConfig, context)) continue;
    await enqueueSequenceRun(sequence, leadId, `trigger:${sequence.id}:${context.eventKey}`);
  }
}