import {
  activitiesTable,
  channelsTable,
  pipelineStagesTable,
  db,
} from "@workspace/db";

export async function seedWorkspace(workspaceId: string, _ownerName: string): Promise<void> {
  await db.insert(pipelineStagesTable).values([
    { workspaceId, name: "New", position: 1, color: "blue" },
    { workspaceId, name: "Contacted", position: 2, color: "violet" },
    { workspaceId, name: "Qualified", position: 3, color: "amber" },
    { workspaceId, name: "Proposal", position: 4, color: "orange" },
    { workspaceId, name: "Won", position: 5, color: "emerald" },
  ]);

  await Promise.all([
    db.insert(channelsTable).values([
      { workspaceId, type: "whatsapp", name: "WhatsApp Business", status: "not_configured", mode: "embedded_signup" },
      { workspaceId, type: "instagram", name: "Instagram DMs", status: "not_configured", mode: "oauth" },
      { workspaceId, type: "facebook", name: "Facebook Messenger", status: "not_configured", mode: "oauth" },
    ]),
    db.insert(activitiesTable).values({
      workspaceId,
      title: "Workspace created",
      detail: "Your CRM workspace is ready for setup.",
    }),
  ]);
}