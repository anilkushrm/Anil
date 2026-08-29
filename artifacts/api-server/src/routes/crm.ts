import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  activitiesTable,
  apiKeysTable,
  billingTransactionsTable,
  campaignsTable,
  channelsTable,
  contactsTable,
  conversationsTable,
  db,
  flowsTable,
  invitationsTable,
  knowledgeSourcesTable,
  leadsTable,
  membershipsTable,
  messagesTable,
  templatesTable,
  usersTable,
  webhookDeliveriesTable,
  webhooksTable,
  workspacesTable,
} from "@workspace/db";
import {
  CreateApiKeyBody,
  CreateApiKeyResponse,
  CreateCampaignBody,
  CreateCampaignResponse,
  CreateFlowBody,
  CreateFlowResponse,
  CreateKnowledgeSourceBody,
  CreateKnowledgeSourceResponse,
  CreateLeadBody,
  CreateLeadResponse,
  CreateTemplateBody,
  CreateTemplateResponse,
  CreateWebhookBody,
  CreateWebhookResponse,
  DeleteKnowledgeSourceParams,
  DeleteWebhookParams,
  GetBillingResponse,
  GetDashboardResponse,
  GetWorkspaceResponse,
  InviteTeamMemberBody,
  InviteTeamMemberResponse,
  ListChannelsResponse,
  ListCampaignsResponse,
  ListConversationsQueryParams,
  ListConversationsResponse,
  ListFlowsResponse,
  ListKnowledgeSourcesResponse,
  ListLeadsQueryParams,
  ListLeadsResponse,
  ListMessagesParams,
  ListMessagesResponse,
  ListApiKeysResponse,
  ListTemplatesResponse,
  ListTeamMembersResponse,
  ListWebhookDeliveriesResponse,
  ListWebhooksResponse,
  RevokeApiKeyParams,
  SendMessageBody,
  SendMessageParams,
  SendMessageResponse,
  UpdateChannelBody,
  UpdateChannelParams,
  UpdateChannelResponse,
  UpdateCampaignBody,
  UpdateCampaignParams,
  UpdateCampaignResponse,
  UpdateFlowBody,
  UpdateFlowParams,
  UpdateFlowResponse,
  UpdateLeadBody,
  UpdateLeadParams,
  UpdateLeadResponse,
  UpdateTemplateBody,
  UpdateTemplateParams,
  UpdateTemplateResponse,
  UpdateWorkspaceBody,
  UpdateWorkspaceResponse,
} from "@workspace/api-zod";
import { canManageTeam, getAuth, requireAuth } from "../lib/auth";
import { createSessionToken, hashPassword, hashSessionToken } from "../lib/security";
import { dispatchWorkspaceEvent, validateWebhookUrl } from "../lib/webhooks";

const router: IRouter = Router();

function iso(date: Date): string {
  return date.toISOString();
}

function leadPayload(lead: typeof leadsTable.$inferSelect) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    stage: lead.stage,
    value: lead.value,
    assignee: lead.assignee,
    tags: lead.tags,
    createdAt: iso(lead.createdAt),
    updatedAt: iso(lead.updatedAt),
  };
}

function conversationPayload(conversation: typeof conversationsTable.$inferSelect) {
  return {
    id: conversation.id,
    contactName: conversation.contactName,
    channel: conversation.channel,
    lastMessage: conversation.lastMessage,
    unread: conversation.unread,
    updatedAt: iso(conversation.updatedAt),
    leadId: conversation.leadId,
  };
}

function messagePayload(message: typeof messagesTable.$inferSelect) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    direction: message.direction,
    sentAt: iso(message.sentAt),
    senderName: message.senderName,
  };
}

function channelPayload(channel: typeof channelsTable.$inferSelect) {
  return {
    id: channel.id,
    type: channel.type,
    name: channel.name,
    status: channel.status,
    mode: channel.mode,
    accountName: channel.accountName,
    lastSyncedAt: channel.lastSyncedAt ? iso(channel.lastSyncedAt) : null,
  };
}

function flowPayload(flow: typeof flowsTable.$inferSelect) {
  return { ...flow, createdAt: iso(flow.createdAt), updatedAt: iso(flow.updatedAt), workspaceId: undefined };
}

function templatePayload(template: typeof templatesTable.$inferSelect) {
  return { ...template, createdAt: iso(template.createdAt), workspaceId: undefined };
}

function campaignPayload(campaign: typeof campaignsTable.$inferSelect) {
  return { ...campaign, createdAt: iso(campaign.createdAt), workspaceId: undefined };
}

function knowledgePayload(source: typeof knowledgeSourcesTable.$inferSelect) {
  return { ...source, createdAt: iso(source.createdAt), updatedAt: iso(source.updatedAt), workspaceId: undefined };
}

function apiKeyPayload(apiKey: typeof apiKeysTable.$inferSelect) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    lastUsedAt: apiKey.lastUsedAt ? iso(apiKey.lastUsedAt) : null,
    createdAt: iso(apiKey.createdAt),
  };
}

function webhookPayload(webhook: typeof webhooksTable.$inferSelect) {
  return {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    status: webhook.status,
    createdAt: iso(webhook.createdAt),
  };
}

router.use(requireAuth);

router.get("/workspace", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  res.json(GetWorkspaceResponse.parse(auth.workspace));
});

router.patch("/workspace", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can update settings." });
    return;
  }
  const parsed = UpdateWorkspaceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [slugOwner] = await db.select({ id: workspacesTable.id }).from(workspacesTable)
    .where(eq(workspacesTable.slug, parsed.data.slug)).limit(1);
  if (slugOwner && slugOwner.id !== auth.workspace.id) {
    res.status(409).json({ error: "That workspace slug is already in use." });
    return;
  }
  const [workspace] = await db.update(workspacesTable).set({
    name: parsed.data.name.trim(),
    slug: parsed.data.slug,
  }).where(eq(workspacesTable.id, auth.workspace.id)).returning();
  res.json(UpdateWorkspaceResponse.parse(workspace));
});

router.get("/dashboard", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const [leads, contacts, conversations, campaigns, activities] = await Promise.all([
    db.select().from(leadsTable).where(eq(leadsTable.workspaceId, auth.workspace.id)),
    db.select().from(contactsTable).where(eq(contactsTable.workspaceId, auth.workspace.id)),
    db.select().from(conversationsTable).where(eq(conversationsTable.workspaceId, auth.workspace.id)),
    db.select().from(campaignsTable).where(eq(campaignsTable.workspaceId, auth.workspace.id)),
    db.select().from(activitiesTable).where(eq(activitiesTable.workspaceId, auth.workspace.id)).orderBy(desc(activitiesTable.createdAt)).limit(6),
  ]);

  const stages = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const pipeline = stages.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.stage === stage);
    return {
      stage: stage[0]?.toUpperCase() + stage.slice(1),
      count: stageLeads.length,
      value: stageLeads.reduce((total, lead) => total + lead.value, 0),
    };
  });
  res.json(GetDashboardResponse.parse({
    metrics: {
      leads: leads.length,
      messages: conversations.reduce((total, conversation) => total + conversation.unread, 0),
      contacts: contacts.length,
      campaigns: campaigns.length,
    },
    pipeline,
    recentActivity: activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      detail: activity.detail,
      createdAt: iso(activity.createdAt),
    })),
  }));
});

router.get("/leads", async (req: Request, res: Response): Promise<void> => {
  const parsed = ListLeadsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const filters = [eq(leadsTable.workspaceId, auth.workspace.id)];
  if (parsed.data.stage) filters.push(eq(leadsTable.stage, parsed.data.stage));
  if (parsed.data.search) {
    const search = `%${parsed.data.search}%`;
    filters.push(or(ilike(leadsTable.name, search), ilike(leadsTable.company, search), ilike(leadsTable.email, search))!);
  }
  const leads = await db
    .select()
    .from(leadsTable)
    .where(and(...filters))
    .orderBy(desc(leadsTable.updatedAt))
    .limit(parsed.data.limit ?? 50);
  res.json(ListLeadsResponse.parse(leads.map(leadPayload)));
});

router.post("/leads", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [contact] = await db.insert(contactsTable).values({
    workspaceId: auth.workspace.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company ?? "",
  }).returning();
  const [lead] = await db.insert(leadsTable).values({
    workspaceId: auth.workspace.id,
    contactId: contact?.id,
    name: parsed.data.name,
    company: parsed.data.company ?? "",
    email: parsed.data.email,
    phone: parsed.data.phone,
    source: parsed.data.source ?? "manual",
    stage: parsed.data.stage ?? "new",
    value: parsed.data.value ?? 0,
    assignee: parsed.data.assignee || auth.user.name,
    tags: parsed.data.tags ?? [],
  }).returning();
  if (!lead) {
    res.status(400).json({ error: "Unable to create lead." });
    return;
  }
  void dispatchWorkspaceEvent(auth.workspace.id, "lead.created", leadPayload(lead));
  res.status(201).json(CreateLeadResponse.parse(leadPayload(lead)));
});

router.patch("/leads/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateLeadParams.safeParse(req.params);
  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [lead] = await db.update(leadsTable).set(parsed.data).where(and(eq(leadsTable.id, params.data.id), eq(leadsTable.workspaceId, auth.workspace.id))).returning();
  if (!lead) {
    res.status(404).json({ error: "Lead not found." });
    return;
  }
  res.json(UpdateLeadResponse.parse(leadPayload(lead)));
});

router.get("/inbox/conversations", async (req: Request, res: Response): Promise<void> => {
  const parsed = ListConversationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const filters = [eq(conversationsTable.workspaceId, auth.workspace.id)];
  if (parsed.data.channel) filters.push(eq(conversationsTable.channel, parsed.data.channel));
  if (parsed.data.search) filters.push(ilike(conversationsTable.contactName, `%${parsed.data.search}%`));
  const conversations = await db.select().from(conversationsTable).where(and(...filters)).orderBy(desc(conversationsTable.updatedAt));
  res.json(ListConversationsResponse.parse(conversations.map(conversationPayload)));
});

router.get("/inbox/conversations/:id/messages", async (req: Request, res: Response): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const auth = getAuth(res);
  const [conversation] = await db.select({ id: conversationsTable.id }).from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.workspaceId, auth.workspace.id))).limit(1);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found." });
    return;
  }
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversation.id)).orderBy(messagesTable.sentAt);
  res.json(ListMessagesResponse.parse(messages.map(messagePayload)));
});

router.post("/inbox/conversations/:id/messages", async (req: Request, res: Response): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  const parsed = SendMessageBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [conversation] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.workspaceId, auth.workspace.id))).limit(1);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found." });
    return;
  }
  const [message] = await db.insert(messagesTable).values({
    workspaceId: auth.workspace.id,
    conversationId: conversation.id,
    body: parsed.data.body,
    direction: "outbound",
    senderName: auth.user.name,
  }).returning();
  await db.update(conversationsTable).set({ lastMessage: parsed.data.body, unread: 0, updatedAt: new Date() }).where(eq(conversationsTable.id, conversation.id));
  if (!message) {
    res.status(400).json({ error: "Unable to send message." });
    return;
  }
  res.status(201).json(SendMessageResponse.parse(messagePayload(message)));
});

router.get("/team", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const members = await db.select({ user: usersTable, membership: membershipsTable })
    .from(membershipsTable)
    .innerJoin(usersTable, eq(usersTable.id, membershipsTable.userId))
    .where(eq(membershipsTable.workspaceId, auth.workspace.id))
    .orderBy(usersTable.name);
  res.json(ListTeamMembersResponse.parse(members.map(({ user, membership }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: membership.role,
    status: membership.status,
  }))));
});

router.post("/team", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can invite teammates." });
    return;
  }
  const parsed = InviteTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    [user] = await db.insert(usersTable).values({
      name: email.split("@")[0] || "New teammate",
      email,
      passwordHash: hashPassword(`invite:${randomUUID()}`),
      passwordSetupRequired: true,
    }).returning();
  }
  if (!user) {
    res.status(400).json({ error: "Unable to create teammate." });
    return;
  }
  const [existing] = await db.select().from(membershipsTable)
    .where(and(eq(membershipsTable.workspaceId, auth.workspace.id), eq(membershipsTable.userId, user.id))).limit(1);
  if (existing?.status === "active") {
    res.status(400).json({ error: "This teammate is already in your workspace." });
    return;
  }
  const [membership] = existing
    ? await db.update(membershipsTable).set({ role: parsed.data.role, status: "invited" }).where(eq(membershipsTable.id, existing.id)).returning()
    : await db.insert(membershipsTable).values({
        workspaceId: auth.workspace.id,
        userId: user.id,
        role: parsed.data.role,
        status: "invited",
      }).returning();
  if (!membership) {
    res.status(400).json({ error: "Unable to invite teammate." });
    return;
  }
  const inviteToken = createSessionToken();
  await db.insert(invitationsTable).values({
    tokenHash: hashSessionToken(inviteToken),
    workspaceId: auth.workspace.id,
    userId: user.id,
    createdByUserId: auth.user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });
  res.status(201).json(InviteTeamMemberResponse.parse({
    member: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      status: membership.status,
    },
    inviteToken,
  }));
});

router.get("/channels", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const channels = await db.select().from(channelsTable).where(eq(channelsTable.workspaceId, auth.workspace.id)).orderBy(channelsTable.type);
  res.json(ListChannelsResponse.parse(channels.map(channelPayload)));
});

router.patch("/channels/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateChannelParams.safeParse(req.params);
  const parsed = UpdateChannelBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [channel] = await db.update(channelsTable).set({
    ...parsed.data,
    lastSyncedAt: parsed.data.status === "connected" ? new Date() : undefined,
  }).where(and(eq(channelsTable.id, params.data.id), eq(channelsTable.workspaceId, auth.workspace.id))).returning();
  if (!channel) {
    res.status(404).json({ error: "Channel not found." });
    return;
  }
  res.json(UpdateChannelResponse.parse(channelPayload(channel)));
});

router.get("/flows", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const flows = await db.select().from(flowsTable).where(eq(flowsTable.workspaceId, auth.workspace.id)).orderBy(desc(flowsTable.updatedAt));
  res.json(ListFlowsResponse.parse(flows.map(flowPayload)));
});

router.post("/flows", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateFlowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [flow] = await db.insert(flowsTable).values({ workspaceId: auth.workspace.id, ...parsed.data }).returning();
  res.status(201).json(CreateFlowResponse.parse(flowPayload(flow!)));
});

router.patch("/flows/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateFlowParams.safeParse(req.params);
  const parsed = UpdateFlowBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid flow update." });
    return;
  }
  const auth = getAuth(res);
  const [flow] = await db.update(flowsTable).set(parsed.data)
    .where(and(eq(flowsTable.id, params.data.id), eq(flowsTable.workspaceId, auth.workspace.id))).returning();
  if (!flow) {
    res.status(404).json({ error: "Flow not found." });
    return;
  }
  res.json(UpdateFlowResponse.parse(flowPayload(flow)));
});

router.get("/templates", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const templates = await db.select().from(templatesTable).where(eq(templatesTable.workspaceId, auth.workspace.id)).orderBy(desc(templatesTable.createdAt));
  res.json(ListTemplatesResponse.parse(templates.map(templatePayload)));
});

router.post("/templates", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [template] = await db.insert(templatesTable).values({ workspaceId: auth.workspace.id, ...parsed.data }).returning();
  res.status(201).json(CreateTemplateResponse.parse(templatePayload(template!)));
});

router.patch("/templates/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateTemplateParams.safeParse(req.params);
  const parsed = UpdateTemplateBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid template update." });
    return;
  }
  const auth = getAuth(res);
  const [template] = await db.update(templatesTable).set(parsed.data)
    .where(and(eq(templatesTable.id, params.data.id), eq(templatesTable.workspaceId, auth.workspace.id))).returning();
  if (!template) {
    res.status(404).json({ error: "Template not found." });
    return;
  }
  res.json(UpdateTemplateResponse.parse(templatePayload(template)));
});

router.get("/campaigns", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.workspaceId, auth.workspace.id)).orderBy(desc(campaignsTable.createdAt));
  res.json(ListCampaignsResponse.parse(campaigns.map(campaignPayload)));
});

router.post("/campaigns", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [campaign] = await db.insert(campaignsTable).values({ workspaceId: auth.workspace.id, ...parsed.data, status: "draft" }).returning();
  res.status(201).json(CreateCampaignResponse.parse(campaignPayload(campaign!)));
});

router.patch("/campaigns/:id", async (req: Request, res: Response): Promise<void> => {
  const params = UpdateCampaignParams.safeParse(req.params);
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid campaign update." });
    return;
  }
  const auth = getAuth(res);
  const [campaign] = await db.update(campaignsTable).set(parsed.data)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.workspaceId, auth.workspace.id))).returning();
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found." });
    return;
  }
  res.json(UpdateCampaignResponse.parse(campaignPayload(campaign)));
});

router.get("/knowledge", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const sources = await db.select().from(knowledgeSourcesTable)
    .where(eq(knowledgeSourcesTable.workspaceId, auth.workspace.id)).orderBy(desc(knowledgeSourcesTable.updatedAt));
  res.json(ListKnowledgeSourcesResponse.parse(sources.map(knowledgePayload)));
});

router.post("/knowledge", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateKnowledgeSourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [source] = await db.insert(knowledgeSourcesTable).values({ workspaceId: auth.workspace.id, ...parsed.data }).returning();
  res.status(201).json(CreateKnowledgeSourceResponse.parse(knowledgePayload(source!)));
});

router.delete("/knowledge/:id", async (req: Request, res: Response): Promise<void> => {
  const params = DeleteKnowledgeSourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Knowledge source not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(knowledgeSourcesTable)
    .where(and(eq(knowledgeSourcesTable.id, params.data.id), eq(knowledgeSourcesTable.workspaceId, auth.workspace.id))).returning({ id: knowledgeSourcesTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Knowledge source not found." });
    return;
  }
  res.status(204).send();
});

router.get("/billing", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const transactions = await db.select().from(billingTransactionsTable)
    .where(eq(billingTransactionsTable.workspaceId, auth.workspace.id)).orderBy(desc(billingTransactionsTable.createdAt));
  res.json(GetBillingResponse.parse({
    plan: auth.workspace.plan,
    walletBalance: auth.workspace.walletBalance,
    currency: "INR",
    pricing: { marketing: 0.92, utilityAuthentication: 0.12, social: 0 },
    transactions: transactions.map((transaction) => ({ ...transaction, createdAt: iso(transaction.createdAt), workspaceId: undefined })),
  }));
});

router.get("/api-keys", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const keys = await db.select().from(apiKeysTable).where(eq(apiKeysTable.workspaceId, auth.workspace.id)).orderBy(desc(apiKeysTable.createdAt));
  res.json(ListApiKeysResponse.parse(keys.map(apiKeyPayload)));
});

router.post("/api-keys", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can create API keys." });
    return;
  }
  const parsed = CreateApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const secret = `abf_${createSessionToken()}`;
  const [apiKey] = await db.insert(apiKeysTable).values({
    workspaceId: auth.workspace.id,
    createdByUserId: auth.user.id,
    name: parsed.data.name.trim(),
    keyPrefix: secret.slice(0, 12),
    keyHash: hashSessionToken(secret),
  }).returning();
  res.status(201).json(CreateApiKeyResponse.parse({ apiKey: apiKeyPayload(apiKey!), secret }));
});

router.delete("/api-keys/:id", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can revoke API keys." });
    return;
  }
  const params = RevokeApiKeyParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "API key not found." });
    return;
  }
  const deleted = await db.delete(apiKeysTable)
    .where(and(eq(apiKeysTable.id, params.data.id), eq(apiKeysTable.workspaceId, auth.workspace.id))).returning({ id: apiKeysTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "API key not found." });
    return;
  }
  res.status(204).send();
});

router.get("/webhooks", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const webhooks = await db.select().from(webhooksTable).where(eq(webhooksTable.workspaceId, auth.workspace.id)).orderBy(desc(webhooksTable.createdAt));
  res.json(ListWebhooksResponse.parse(webhooks.map(webhookPayload)));
});

router.post("/webhooks", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can create webhooks." });
    return;
  }
  const parsed = CreateWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    await validateWebhookUrl(parsed.data.url);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Enter a valid public HTTPS webhook URL." });
    return;
  }
  const [webhook] = await db.insert(webhooksTable).values({ workspaceId: auth.workspace.id, ...parsed.data }).returning();
  res.status(201).json(CreateWebhookResponse.parse(webhookPayload(webhook!)));
});

router.delete("/webhooks/:id", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  if (!canManageTeam(auth)) {
    res.status(403).json({ error: "Only workspace owners and admins can delete webhooks." });
    return;
  }
  const params = DeleteWebhookParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Webhook not found." });
    return;
  }
  const deleted = await db.delete(webhooksTable)
    .where(and(eq(webhooksTable.id, params.data.id), eq(webhooksTable.workspaceId, auth.workspace.id))).returning({ id: webhooksTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Webhook not found." });
    return;
  }
  res.status(204).send();
});

router.get("/webhook-deliveries", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const deliveries = await db.select().from(webhookDeliveriesTable)
    .where(eq(webhookDeliveriesTable.workspaceId, auth.workspace.id))
    .orderBy(desc(webhookDeliveriesTable.createdAt))
    .limit(50);
  res.json(ListWebhookDeliveriesResponse.parse(deliveries.map((delivery) => ({
    id: delivery.id,
    webhookId: delivery.webhookId,
    event: delivery.event,
    status: delivery.status,
    attemptCount: delivery.attemptCount,
    httpStatus: delivery.httpStatus,
    lastError: delivery.lastError,
    deliveredAt: delivery.deliveredAt ? iso(delivery.deliveredAt) : null,
    createdAt: iso(delivery.createdAt),
  }))));
});

export default router;