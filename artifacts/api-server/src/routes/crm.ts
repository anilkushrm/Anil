import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  activitiesTable,
  aiAgentSettingsTable,
  aiMappingsTable,
  aiMemoryItemsTable,
  aiRulesTable,
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
  sequenceRunsTable,
  sequenceStepsTable,
  sequencesTable,
  templatesTable,
  usersTable,
  webhookDeliveriesTable,
  webhooksTable,
  workspacesTable,
} from "@workspace/db";
import {
  CreateAiMappingBody,
  CreateAiMappingResponse,
  CreateAiMemoryItemBody,
  CreateAiMemoryItemResponse,
  CreateAiRuleBody,
  CreateAiRuleResponse,
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
  CreateSequenceBody,
  CreateSequenceResponse,
  CreateSequenceStepBody,
  CreateSequenceStepParams,
  CreateSequenceStepResponse,
  CreateTemplateBody,
  CreateTemplateResponse,
  CreateWebhookBody,
  CreateWebhookResponse,
  CompleteMetaChannelConnectionQueryParams,
  CompleteMetaChannelConnectionResponse,
  CompleteEmbeddedChannelConnectionBody,
  CompleteEmbeddedChannelConnectionParams,
  CompleteEmbeddedChannelConnectionResponse,
  ConnectChannelParams,
  ConnectChannelResponse,
  DeleteAiMappingParams,
  DeleteAiMemoryItemParams,
  DeleteAiRuleParams,
  DeleteKnowledgeSourceParams,
  DeleteSequenceParams,
  DeleteSequenceStepParams,
  DuplicateSequenceParams,
  DuplicateSequenceResponse,
  EnrollSequenceBody,
  EnrollSequenceParams,
  EnrollSequenceResponse,
  DeleteWebhookParams,
  GetAiSettingsResponse,
  GetBillingResponse,
  GetSequenceParams,
  GetSequenceResponse,
  ListAiMappingsResponse,
  ListAiMemoryItemsQueryParams,
  ListAiMemoryItemsResponse,
  ListAiRulesResponse,
  ListSequenceRunsResponse,
  ListSequencesResponse,
  ProcessAiInboundEventBody,
  ProcessAiInboundEventResponse,
  ReceiveMetaChannelWebhookBody,
  ReceiveMetaChannelWebhookResponse,
  UpdateAiMappingBody,
  UpdateAiMappingParams,
  UpdateAiMappingResponse,
  UpdateAiMemoryItemBody,
  UpdateAiMemoryItemParams,
  UpdateAiMemoryItemResponse,
  UpdateAiRuleBody,
  UpdateAiRuleParams,
  UpdateAiRuleResponse,
  UpdateAiSettingsBody,
  UpdateAiSettingsResponse,
  UpdateSequenceBody,
  UpdateSequenceParams,
  UpdateSequenceResponse,
  UpdateSequenceRunBody,
  UpdateSequenceRunParams,
  UpdateSequenceRunResponse,
  UpdateSequenceStepBody,
  UpdateSequenceStepParams,
  UpdateSequenceStepResponse,
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
  SelectMetaPageBody,
  SelectMetaPageResponse,
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
  VerifyMetaChannelWebhookQueryParams,
} from "@workspace/api-zod";
import { canManageTeam, getAuth, requireAuth } from "../lib/auth";
import { createSessionToken, hashPassword, hashSessionToken } from "../lib/security";
import { enqueueSequenceRun, enrollMatchingSequences, isValidTimeZone, validateTriggerConfig } from "../lib/automation";
import { executeAiRuntime, persistAiDryRunReply, persistAiLiveReply } from "../lib/ai-runtime";
import { persistLiveOutboundMessage } from "../lib/meta-delivery";
import {
  finishMetaAuthorization,
  consumeMetaPageSelection,
  consumeMetaOAuthState,
  exchangeMetaAuthorizationCode,
  listMetaPageCandidates,
  metaAuthorizationUrl,
  metaClientConfiguration,
  metaVerifyToken,
  prepareMetaPageSelection,
} from "../lib/meta";
import {
  dispatchWorkspaceEvent,
  enqueueMetaWebhook,
  processPendingMetaWebhookEvents,
  validateWebhookUrl,
  verifyMetaWebhookSignature,
} from "../lib/webhooks";

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
    messagingConsent: lead.messagingConsent,
    optedOutAt: lead.optedOutAt ? iso(lead.optedOutAt) : null,
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
    deliveryStatus: message.deliveryStatus,
    deliveryAttemptCount: message.deliveryAttemptCount,
    deliveryError: message.deliveryError,
    providerMessageId: message.providerMessageId,
    deliveredAt: message.deliveredAt ? iso(message.deliveredAt) : null,
  };
}

function metaConfigurationReady(channel: typeof channelsTable.$inferSelect): boolean {
  const common = Boolean(
    process.env["META_APP_ID"]
    && process.env["META_APP_SECRET"]
    && process.env["META_REDIRECT_URI"]
    && process.env["META_VERIFY_TOKEN"],
  );
  return common && (channel.mode !== "embedded_signup" || Boolean(process.env["META_WHATSAPP_CONFIG_ID"]));
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
    externalAccountId: channel.externalAccountId,
    configurationReady: metaConfigurationReady(channel),
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

function aiSettingsPayload(settings: typeof aiAgentSettingsTable.$inferSelect) {
  return { ...settings, workspaceId: undefined, updatedAt: iso(settings.updatedAt) };
}

function aiMemoryPayload(item: typeof aiMemoryItemsTable.$inferSelect) {
  return { ...item, workspaceId: undefined, createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt) };
}

function aiMappingPayload(item: typeof aiMappingsTable.$inferSelect) {
  return { ...item, workspaceId: undefined, createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt) };
}

function aiRulePayload(item: typeof aiRulesTable.$inferSelect) {
  return { ...item, workspaceId: undefined, createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt) };
}

function sequenceStepPayload(step: typeof sequenceStepsTable.$inferSelect) {
  return {
    id: step.id,
    position: step.position,
    type: step.type,
    title: step.title,
    delayMinutes: step.delayMinutes,
    channel: step.channel,
    message: step.message,
    quickReplies: step.quickReplies,
    fallbackAction: step.fallbackAction,
    exitOnReply: step.exitOnReply,
    exitOnUnsubscribe: step.exitOnUnsubscribe,
    createdAt: iso(step.createdAt),
    updatedAt: iso(step.updatedAt),
  };
}

function sequencePayload(sequence: typeof sequencesTable.$inferSelect, steps: (typeof sequenceStepsTable.$inferSelect)[]) {
  return {
    id: sequence.id,
    name: sequence.name,
    status: sequence.status,
    triggerType: sequence.triggerType,
    triggerConfig: sequence.triggerConfig,
    timezone: sequence.timezone,
    quietHoursStart: sequence.quietHoursStart,
    quietHoursEnd: sequence.quietHoursEnd,
    steps: steps.sort((a, b) => a.position - b.position).map(sequenceStepPayload),
    createdAt: iso(sequence.createdAt),
    updatedAt: iso(sequence.updatedAt),
  };
}

function sequenceRunPayload(run: typeof sequenceRunsTable.$inferSelect) {
  return {
    id: run.id,
    sequenceId: run.sequenceId,
    leadId: run.leadId,
    status: run.status,
    currentStep: run.currentStep,
    nextRunAt: run.nextRunAt ? iso(run.nextRunAt) : null,
    attemptCount: run.attemptCount,
    lastError: run.lastError,
    idempotencyKey: run.idempotencyKey,
    createdAt: iso(run.createdAt),
    updatedAt: iso(run.updatedAt),
  };
}

function requireAutomationManager(res: Response): boolean {
  if (canManageTeam(getAuth(res))) return true;
  res.status(403).json({ error: "Only workspace owners and admins can change AI automation settings." });
  return false;
}

async function loadSequence(workspaceId: string, sequenceId: string) {
  const [sequence] = await db.select().from(sequencesTable)
    .where(and(eq(sequencesTable.id, sequenceId), eq(sequencesTable.workspaceId, workspaceId))).limit(1);
  if (!sequence) return null;
  const steps = await db.select().from(sequenceStepsTable)
    .where(and(eq(sequenceStepsTable.sequenceId, sequence.id), eq(sequenceStepsTable.workspaceId, workspaceId)))
    .orderBy(sequenceStepsTable.position);
  return sequencePayload(sequence, steps);
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

function metaPageSelectionHtml(
  state: string,
  pages: Array<{ id: string; name: string; instagramBusinessId?: string }>,
): string {
  const data = JSON.stringify({ state, pages }).replaceAll("<", "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Select Meta Page</title>
<style>body{font-family:system-ui;background:#f4f7f9;margin:0;display:grid;place-items:center;min-height:100vh}.card{background:white;padding:28px;border:1px solid #dfe5e8;border-radius:12px;box-shadow:0 12px 35px #17304218;max-width:520px;width:calc(100% - 48px)}button{display:block;width:100%;padding:12px;margin-top:10px;text-align:left;border:1px solid #cad4da;border-radius:8px;background:white;cursor:pointer}button:hover{border-color:#22b768}p{color:#55636b}</style>
</head><body><main class="card"><h1>Select a Meta Page</h1><p>Choose the Page this channel should use. Its Page access token will be stored encrypted.</p><div id="pages"></div><p id="error"></p></main>
<script>const data=${data};const root=document.getElementById("pages");for(const page of data.pages){const button=document.createElement("button");button.textContent=page.name+(page.instagramBusinessId?" (Instagram connected)":"");button.onclick=async()=>{button.disabled=true;const response=await fetch(location.pathname.replace("/callback","/select"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({state:data.state,pageId:page.id})});if(response.ok){location.assign("/channels?connected=meta");return}const body=await response.json().catch(()=>({}));document.getElementById("error").textContent=body.error||"Unable to connect this Page.";button.disabled=false};root.appendChild(button)}</script></body></html>`;
}

router.get("/channels/meta/callback", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = CompleteMetaChannelConnectionQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const auth = getAuth(res);
    const state = await consumeMetaOAuthState(parsed.data.state, auth.user.id, auth.workspace.id);
    const [pendingChannel] = await db.select().from(channelsTable).where(and(
      eq(channelsTable.id, state.channelId),
      eq(channelsTable.workspaceId, state.workspaceId),
    )).limit(1);
    if (!pendingChannel || pendingChannel.type === "whatsapp") {
      res.status(400).json({ error: "This OAuth callback is not valid for the selected channel." });
      return;
    }
    const accessToken = await exchangeMetaAuthorizationCode(parsed.data.code);
    const candidates = await listMetaPageCandidates(accessToken, pendingChannel.type);
    if (!candidates.length) throw new Error("Meta did not return an eligible Page for this channel.");
    if (candidates.length > 1) {
      await prepareMetaPageSelection(state.transactionId, accessToken, candidates);
      if (req.accepts("html")) {
        res.type("html").send(metaPageSelectionHtml(parsed.data.state, candidates));
        return;
      }
      res.status(409).json({ error: "Select a Meta Page in the browser to complete this connection." });
      return;
    }
    const channel = await finishMetaAuthorization(state, "", undefined, {
      userAccessToken: accessToken,
      selectedPageId: candidates[0]!.id,
    });
    const payload = CompleteMetaChannelConnectionResponse.parse(channelPayload(channel));
    if (req.accepts("html")) {
      res.redirect(303, `/channels?connected=${encodeURIComponent(channel.type)}`);
      return;
    }
    res.json(payload);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to complete Meta authorization." });
  }
});

router.post("/channels/meta/select", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = SelectMetaPageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const auth = getAuth(res);
    const selection = await consumeMetaPageSelection(
      parsed.data.state,
      auth.user.id,
      auth.workspace.id,
      parsed.data.pageId,
    );
    const channel = await finishMetaAuthorization(selection, "", undefined, {
      userAccessToken: selection.accessToken,
      selectedPageId: selection.pageId,
    });
    res.json(SelectMetaPageResponse.parse(channelPayload(channel)));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to complete Meta Page selection." });
  }
});

router.get("/channels/meta/webhook", (req: Request, res: Response): void => {
  const parsed = VerifyMetaChannelWebhookQueryParams.safeParse(req.query);
  let verifyToken = "";
  try {
    verifyToken = metaVerifyToken();
  } catch {
    res.status(503).json({ error: "Meta webhook configuration is incomplete." });
    return;
  }
  if (!parsed.success
    || parsed.data["hub.mode"] !== "subscribe"
    || parsed.data["hub.verify_token"] !== verifyToken
    || !parsed.data["hub.challenge"]) {
    res.status(403).json({ error: "Meta webhook verification failed." });
    return;
  }
  res.type("text/plain").send(parsed.data["hub.challenge"]);
});

router.post("/channels/meta/webhook", async (req: Request, res: Response): Promise<void> => {
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || !verifyMetaWebhookSignature(rawBody, req.get("x-hub-signature-256"))) {
    res.status(401).json({ error: "Invalid Meta webhook signature." });
    return;
  }
  const parsed = ReceiveMetaChannelWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await enqueueMetaWebhook(parsed.data);
  void processPendingMetaWebhookEvents().catch((error) => {
    req.log?.error({ err: error }, "Meta webhook processing failed");
  });
  res.json(ReceiveMetaChannelWebhookResponse.parse({ received: true }));
});

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
  void enrollMatchingSequences(auth.workspace.id, lead.id, "new_lead", {
    source: lead.source,
    eventKey: `lead-created:${lead.id}`,
  });
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
  const [before] = await db.select().from(leadsTable).where(and(eq(leadsTable.id, params.data.id), eq(leadsTable.workspaceId, auth.workspace.id))).limit(1);
  const [lead] = await db.update(leadsTable).set({
    ...parsed.data,
    optedOutAt: parsed.data.messagingConsent === "opted_out"
      ? before?.optedOutAt ?? new Date()
      : parsed.data.messagingConsent ? null : undefined,
  }).where(and(eq(leadsTable.id, params.data.id), eq(leadsTable.workspaceId, auth.workspace.id))).returning();
  if (!lead) {
    res.status(404).json({ error: "Lead not found." });
    return;
  }
  if (parsed.data.stage && parsed.data.stage !== before?.stage) {
    void enrollMatchingSequences(auth.workspace.id, lead.id, "stage_changed", {
      stage: lead.stage,
      eventKey: `stage:${lead.id}:${lead.stage}:${lead.updatedAt.getTime()}`,
    });
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
  try {
    const message = await persistLiveOutboundMessage(
      auth.workspace.id,
      conversation.id,
      parsed.data.body,
      auth.user.name,
    );
    res.status(201).json(SendMessageResponse.parse(messagePayload(message)));
  } catch (error) {
    res.status(409).json({ error: error instanceof Error ? error.message : "Unable to deliver message." });
  }
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
  if (!requireAutomationManager(res)) return;
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
    status: "not_configured",
    accountName: parsed.data.accountName ?? null,
    externalAccountId: null,
    credentialsCiphertext: null,
    lastSyncedAt: null,
  }).where(and(eq(channelsTable.id, params.data.id), eq(channelsTable.workspaceId, auth.workspace.id))).returning();
  if (!channel) {
    res.status(404).json({ error: "Channel not found." });
    return;
  }
  res.json(UpdateChannelResponse.parse(channelPayload(channel)));
});

router.get("/channels/:id/connect", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = ConnectChannelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const auth = getAuth(res);
  const [channel] = await db.select().from(channelsTable).where(and(
    eq(channelsTable.id, params.data.id),
    eq(channelsTable.workspaceId, auth.workspace.id),
  )).limit(1);
  if (!channel) {
    res.status(404).json({ error: "Channel not found." });
    return;
  }
  if (!metaConfigurationReady(channel)) {
    res.status(400).json({ error: "Meta app secrets are not configured for this channel." });
    return;
  }
  const mode = channel.mode === "embedded_signup" ? "embedded_signup" : "oauth";
  const clientConfiguration = metaClientConfiguration();
  const authorizationUrl = await metaAuthorizationUrl(auth.workspace.id, channel.id, auth.user.id, mode);
  res.json(ConnectChannelResponse.parse({
    authorizationUrl,
    mode,
    ...(mode === "embedded_signup" ? {
      ...clientConfiguration,
      state: new URL(authorizationUrl).searchParams.get("state") ?? undefined,
    } : {}),
  }));
});

router.post("/channels/:id/complete", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = CompleteEmbeddedChannelConnectionParams.safeParse(req.params);
  const parsed = CompleteEmbeddedChannelConnectionBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid Embedded Signup completion." });
    return;
  }
  const auth = getAuth(res);
  const [channel] = await db.select().from(channelsTable).where(and(
    eq(channelsTable.id, params.data.id),
    eq(channelsTable.workspaceId, auth.workspace.id),
    eq(channelsTable.mode, "embedded_signup"),
  )).limit(1);
  if (!channel) {
    res.status(404).json({ error: "WhatsApp channel not found." });
    return;
  }
  try {
    const state = await consumeMetaOAuthState(parsed.data.state, auth.user.id, auth.workspace.id);
    if (state.channelId !== channel.id) {
      res.status(400).json({ error: "Embedded Signup state does not match this channel." });
      return;
    }
    const connected = await finishMetaAuthorization(
      state,
      parsed.data.code,
      { wabaId: parsed.data.wabaId, phoneNumberId: parsed.data.phoneNumberId },
    );
    res.json(CompleteEmbeddedChannelConnectionResponse.parse(channelPayload(connected)));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to complete Embedded Signup." });
  }
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

router.get("/ai-settings", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  let [settings] = await db.select().from(aiAgentSettingsTable)
    .where(eq(aiAgentSettingsTable.workspaceId, auth.workspace.id)).limit(1);
  if (!settings) {
    await db.insert(aiAgentSettingsTable).values({
      workspaceId: auth.workspace.id,
      companyName: auth.workspace.name,
    }).onConflictDoNothing();
    [settings] = await db.select().from(aiAgentSettingsTable)
      .where(eq(aiAgentSettingsTable.workspaceId, auth.workspace.id)).limit(1);
  }
  res.json(GetAiSettingsResponse.parse(aiSettingsPayload(settings!)));
});

router.patch("/ai-settings", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = UpdateAiSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [settings] = await db.insert(aiAgentSettingsTable).values({
    workspaceId: auth.workspace.id,
    companyName: auth.workspace.name,
    ...parsed.data,
  }).onConflictDoUpdate({
    target: aiAgentSettingsTable.workspaceId,
    set: { ...parsed.data, updatedAt: new Date() },
  }).returning();
  await db.insert(activitiesTable).values({
    workspaceId: auth.workspace.id,
    title: "AI agent settings updated",
    detail: `${auth.user.name} saved the AI agent and memory configuration.`,
  });
  res.json(UpdateAiSettingsResponse.parse(aiSettingsPayload(settings!)));
});

router.post("/ai-inbound-events", async (req: Request, res: Response): Promise<void> => {
  const parsed = ProcessAiInboundEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [lead] = await db.select().from(leadsTable).where(and(
    eq(leadsTable.id, parsed.data.leadId),
    eq(leadsTable.workspaceId, auth.workspace.id),
  )).limit(1);
  if (!lead) {
    res.status(404).json({ error: "Lead not found." });
    return;
  }
  let conversation = parsed.data.conversationId
    ? (await db.select().from(conversationsTable).where(and(
        eq(conversationsTable.id, parsed.data.conversationId),
        eq(conversationsTable.workspaceId, auth.workspace.id),
        eq(conversationsTable.leadId, lead.id),
      )).limit(1))[0]
    : (await db.select().from(conversationsTable).where(and(
        eq(conversationsTable.workspaceId, auth.workspace.id),
        eq(conversationsTable.leadId, lead.id),
        eq(conversationsTable.channel, parsed.data.channel),
      )).limit(1))[0];
  if (parsed.data.conversationId && !conversation) {
    res.status(404).json({ error: "Conversation not found for this lead." });
    return;
  }
  if (!conversation) {
    [conversation] = await db.insert(conversationsTable).values({
      workspaceId: auth.workspace.id,
      leadId: lead.id,
      contactName: lead.name,
      channel: parsed.data.channel,
      lastMessage: parsed.data.text,
      unread: 1,
    }).returning();
  } else {
    [conversation] = await db.update(conversationsTable).set({
      lastMessage: parsed.data.text,
      unread: conversation.unread + 1,
    }).where(and(
      eq(conversationsTable.id, conversation.id),
      eq(conversationsTable.workspaceId, auth.workspace.id),
    )).returning();
  }
  const [inboundMessage] = await db.insert(messagesTable).values({
    workspaceId: auth.workspace.id,
    conversationId: conversation!.id,
    body: parsed.data.text,
    direction: "inbound",
    senderName: lead.name,
  }).returning();
  const result = await executeAiRuntime(auth.workspace.id, lead.id, parsed.data.text, {
    conversationId: conversation!.id,
    eventKey: `inbound-message:${inboundMessage!.id}`,
  });
  if (result.status === "replied" && result.replyPreview) {
    const [channel] = await db.select().from(channelsTable).where(and(
      eq(channelsTable.workspaceId, auth.workspace.id),
      eq(channelsTable.type, parsed.data.channel),
      eq(channelsTable.status, "connected"),
    )).limit(1);
    if (channel && conversation!.externalParticipantId) {
      try {
        await persistAiLiveReply(auth.workspace.id, conversation!.id, result.replyPreview, result.senderName);
      } catch {
        // The failed live attempt is retained on the message for operators to inspect.
      }
    } else {
      await persistAiDryRunReply(
        auth.workspace.id,
        conversation!.id,
        result.replyPreview,
        result.senderName,
      );
    }
  }
  res.json(ProcessAiInboundEventResponse.parse({ ...result, conversationId: conversation!.id }));
});

router.get("/ai-memory", async (req: Request, res: Response): Promise<void> => {
  const parsed = ListAiMemoryItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const filters = [eq(aiMemoryItemsTable.workspaceId, auth.workspace.id)];
  if (parsed.data.kind) filters.push(eq(aiMemoryItemsTable.kind, parsed.data.kind));
  if (parsed.data.search) {
    const search = `%${parsed.data.search}%`;
    filters.push(or(ilike(aiMemoryItemsTable.title, search), ilike(aiMemoryItemsTable.content, search))!);
  }
  const items = await db.select().from(aiMemoryItemsTable)
    .where(and(...filters)).orderBy(desc(aiMemoryItemsTable.updatedAt));
  res.json(ListAiMemoryItemsResponse.parse(items.map(aiMemoryPayload)));
});

router.post("/ai-memory", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = CreateAiMemoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.insert(aiMemoryItemsTable).values({
    workspaceId: auth.workspace.id,
    ...parsed.data,
    price: parsed.data.price ?? "",
    tags: parsed.data.tags ?? [],
    status: parsed.data.status ?? "active",
  }).returning();
  res.status(201).json(CreateAiMemoryItemResponse.parse(aiMemoryPayload(item!)));
});

router.patch("/ai-memory/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateAiMemoryItemParams.safeParse(req.params);
  const parsed = UpdateAiMemoryItemBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid memory item update." });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.update(aiMemoryItemsTable).set(parsed.data)
    .where(and(eq(aiMemoryItemsTable.id, params.data.id), eq(aiMemoryItemsTable.workspaceId, auth.workspace.id))).returning();
  if (!item) {
    res.status(404).json({ error: "Memory item not found." });
    return;
  }
  res.json(UpdateAiMemoryItemResponse.parse(aiMemoryPayload(item)));
});

router.delete("/ai-memory/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DeleteAiMemoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Memory item not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(aiMemoryItemsTable)
    .where(and(eq(aiMemoryItemsTable.id, params.data.id), eq(aiMemoryItemsTable.workspaceId, auth.workspace.id)))
    .returning({ id: aiMemoryItemsTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Memory item not found." });
    return;
  }
  res.status(204).send();
});

router.get("/ai-mappings", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const items = await db.select().from(aiMappingsTable)
    .where(eq(aiMappingsTable.workspaceId, auth.workspace.id)).orderBy(aiMappingsTable.createdAt);
  res.json(ListAiMappingsResponse.parse(items.map(aiMappingPayload)));
});

router.post("/ai-mappings", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = CreateAiMappingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.insert(aiMappingsTable).values({
    workspaceId: auth.workspace.id,
    ...parsed.data,
    status: parsed.data.status ?? "active",
  }).returning();
  res.status(201).json(CreateAiMappingResponse.parse(aiMappingPayload(item!)));
});

router.patch("/ai-mappings/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateAiMappingParams.safeParse(req.params);
  const parsed = UpdateAiMappingBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid mapping update." });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.update(aiMappingsTable).set(parsed.data)
    .where(and(eq(aiMappingsTable.id, params.data.id), eq(aiMappingsTable.workspaceId, auth.workspace.id))).returning();
  if (!item) {
    res.status(404).json({ error: "Mapping not found." });
    return;
  }
  res.json(UpdateAiMappingResponse.parse(aiMappingPayload(item)));
});

router.delete("/ai-mappings/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DeleteAiMappingParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Mapping not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(aiMappingsTable)
    .where(and(eq(aiMappingsTable.id, params.data.id), eq(aiMappingsTable.workspaceId, auth.workspace.id)))
    .returning({ id: aiMappingsTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Mapping not found." });
    return;
  }
  res.status(204).send();
});

router.get("/ai-rules", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const items = await db.select().from(aiRulesTable)
    .where(eq(aiRulesTable.workspaceId, auth.workspace.id)).orderBy(aiRulesTable.createdAt);
  res.json(ListAiRulesResponse.parse(items.map(aiRulePayload)));
});

router.post("/ai-rules", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = CreateAiRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.insert(aiRulesTable).values({
    workspaceId: auth.workspace.id,
    ...parsed.data,
    status: parsed.data.status ?? "active",
  }).returning();
  res.status(201).json(CreateAiRuleResponse.parse(aiRulePayload(item!)));
});

router.patch("/ai-rules/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateAiRuleParams.safeParse(req.params);
  const parsed = UpdateAiRuleBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid rule update." });
    return;
  }
  const auth = getAuth(res);
  const [item] = await db.update(aiRulesTable).set(parsed.data)
    .where(and(eq(aiRulesTable.id, params.data.id), eq(aiRulesTable.workspaceId, auth.workspace.id))).returning();
  if (!item) {
    res.status(404).json({ error: "Rule not found." });
    return;
  }
  res.json(UpdateAiRuleResponse.parse(aiRulePayload(item)));
});

router.delete("/ai-rules/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DeleteAiRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Rule not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(aiRulesTable)
    .where(and(eq(aiRulesTable.id, params.data.id), eq(aiRulesTable.workspaceId, auth.workspace.id)))
    .returning({ id: aiRulesTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Rule not found." });
    return;
  }
  res.status(204).send();
});

router.get("/sequences", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const sequences = await db.select().from(sequencesTable)
    .where(eq(sequencesTable.workspaceId, auth.workspace.id)).orderBy(desc(sequencesTable.updatedAt));
  const steps = await db.select().from(sequenceStepsTable)
    .where(eq(sequenceStepsTable.workspaceId, auth.workspace.id)).orderBy(sequenceStepsTable.position);
  res.json(ListSequencesResponse.parse(sequences.map((sequence) =>
    sequencePayload(sequence, steps.filter((step) => step.sequenceId === sequence.id)))));
});

router.post("/sequences", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const parsed = CreateSequenceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.timezone && !isValidTimeZone(parsed.data.timezone)) {
    res.status(400).json({ error: "Timezone must be a valid IANA timezone, for example Asia/Kolkata." });
    return;
  }
  const auth = getAuth(res);
  const [sequence] = await db.insert(sequencesTable).values({
    workspaceId: auth.workspace.id,
    createdByUserId: auth.user.id,
    name: parsed.data.name,
    triggerType: parsed.data.triggerType ?? "manual",
    triggerConfig: parsed.data.triggerConfig ?? "",
    timezone: parsed.data.timezone ?? "Asia/Kolkata",
    quietHoursStart: parsed.data.quietHoursStart ?? "21:00",
    quietHoursEnd: parsed.data.quietHoursEnd ?? "09:00",
  }).returning();
  res.status(201).json(CreateSequenceResponse.parse(sequencePayload(sequence!, [])));
});

router.get("/sequences/:id", async (req: Request, res: Response): Promise<void> => {
  const params = GetSequenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  const auth = getAuth(res);
  const sequence = await loadSequence(auth.workspace.id, params.data.id);
  if (!sequence) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  res.json(GetSequenceResponse.parse(sequence));
});

router.patch("/sequences/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateSequenceParams.safeParse(req.params);
  const parsed = UpdateSequenceBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid sequence update." });
    return;
  }
  const auth = getAuth(res);
  if (parsed.data.timezone && !isValidTimeZone(parsed.data.timezone)) {
    res.status(400).json({ error: "Timezone must be a valid IANA timezone, for example Asia/Kolkata." });
    return;
  }
  if (parsed.data.status === "active") {
    const steps = await db.select({ id: sequenceStepsTable.id }).from(sequenceStepsTable)
      .where(and(eq(sequenceStepsTable.sequenceId, params.data.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id)));
    if (!steps.length) {
      res.status(400).json({ error: "Add at least one step before activating a sequence." });
      return;
    }
    const triggerType = parsed.data.triggerType ?? (await db.select({ triggerType: sequencesTable.triggerType, triggerConfig: sequencesTable.triggerConfig }).from(sequencesTable)
      .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).limit(1))[0]?.triggerType ?? "manual";
    const triggerConfig = parsed.data.triggerConfig ?? (await db.select({ triggerConfig: sequencesTable.triggerConfig }).from(sequencesTable)
      .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).limit(1))[0]?.triggerConfig ?? "";
    const triggerError = validateTriggerConfig(triggerType, triggerConfig);
    if (triggerError) {
      res.status(400).json({ error: triggerError });
      return;
    }
    const timezone = parsed.data.timezone ?? (await db.select({ timezone: sequencesTable.timezone }).from(sequencesTable)
      .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).limit(1))[0]?.timezone ?? "";
    if (!isValidTimeZone(timezone)) {
      res.status(400).json({ error: "Sequence has an invalid IANA timezone." });
      return;
    }
  }
  const [updated] = await db.update(sequencesTable).set(parsed.data)
    .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).returning();
  if (!updated) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  const sequence = await loadSequence(auth.workspace.id, updated.id);
  await db.insert(activitiesTable).values({
    workspaceId: auth.workspace.id,
    title: `Sequence ${updated.status}`,
    detail: `${auth.user.name} updated ${updated.name}.`,
  });
  res.json(UpdateSequenceResponse.parse(sequence!));
});

router.delete("/sequences/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DeleteSequenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(sequencesTable)
    .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id)))
    .returning({ id: sequencesTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  res.status(204).send();
});

router.post("/sequences/:id/duplicate", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DuplicateSequenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  const auth = getAuth(res);
  const [source] = await db.select().from(sequencesTable)
    .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).limit(1);
  if (!source) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  const sourceSteps = await db.select().from(sequenceStepsTable)
    .where(and(eq(sequenceStepsTable.sequenceId, source.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id)));
  const copy = await db.transaction(async (tx) => {
    const [sequence] = await tx.insert(sequencesTable).values({
      workspaceId: auth.workspace.id,
      createdByUserId: auth.user.id,
      name: `${source.name} Copy`,
      status: "draft",
      triggerType: source.triggerType,
      triggerConfig: source.triggerConfig,
      timezone: source.timezone,
      quietHoursStart: source.quietHoursStart,
      quietHoursEnd: source.quietHoursEnd,
    }).returning();
    const copiedSteps = sourceSteps.length ? await tx.insert(sequenceStepsTable).values(sourceSteps.map((step) => ({
      workspaceId: auth.workspace.id,
      sequenceId: sequence!.id,
      position: step.position,
      type: step.type,
      title: step.title,
      delayMinutes: step.delayMinutes,
      channel: step.channel,
      message: step.message,
      quickReplies: step.quickReplies,
      fallbackAction: step.fallbackAction,
      exitOnReply: step.exitOnReply,
      exitOnUnsubscribe: step.exitOnUnsubscribe,
    }))).returning() : [];
    return sequencePayload(sequence!, copiedSteps);
  });
  res.status(201).json(DuplicateSequenceResponse.parse(copy));
});

router.post("/sequences/:id/steps", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = CreateSequenceStepParams.safeParse(req.params);
  const parsed = CreateSequenceStepBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid sequence step." });
    return;
  }
  const auth = getAuth(res);
  const [sequence] = await db.select({ id: sequencesTable.id }).from(sequencesTable)
    .where(and(eq(sequencesTable.id, params.data.id), eq(sequencesTable.workspaceId, auth.workspace.id))).limit(1);
  if (!sequence) {
    res.status(404).json({ error: "Sequence not found." });
    return;
  }
  let position = parsed.data.position;
  if (position === undefined) {
    const existing = await db.select({ position: sequenceStepsTable.position }).from(sequenceStepsTable)
      .where(and(eq(sequenceStepsTable.sequenceId, sequence.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id)))
      .orderBy(desc(sequenceStepsTable.position)).limit(1);
    position = (existing[0]?.position ?? -1) + 1;
  }
  const [step] = await db.insert(sequenceStepsTable).values({
    workspaceId: auth.workspace.id,
    sequenceId: sequence.id,
    position,
    type: parsed.data.type,
    title: parsed.data.title,
    delayMinutes: parsed.data.delayMinutes ?? 0,
    channel: parsed.data.channel ?? "whatsapp",
    message: parsed.data.message ?? "",
    quickReplies: parsed.data.quickReplies ?? [],
    fallbackAction: parsed.data.fallbackAction ?? "retry",
    exitOnReply: parsed.data.exitOnReply ?? true,
    exitOnUnsubscribe: parsed.data.exitOnUnsubscribe ?? true,
  }).returning();
  res.status(201).json(CreateSequenceStepResponse.parse(sequenceStepPayload(step!)));
});

router.patch("/sequence-steps/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateSequenceStepParams.safeParse(req.params);
  const parsed = UpdateSequenceStepBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid sequence step update." });
    return;
  }
  const auth = getAuth(res);
  const [current] = await db.select().from(sequenceStepsTable)
    .where(and(eq(sequenceStepsTable.id, params.data.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id))).limit(1);
  if (!current) {
    res.status(404).json({ error: "Sequence step not found." });
    return;
  }
  const [step] = await db.transaction(async (tx) => {
    if (parsed.data.position !== undefined && parsed.data.position !== current.position) {
      await tx.update(sequenceStepsTable).set({ position: current.position }).where(and(
        eq(sequenceStepsTable.workspaceId, auth.workspace.id),
        eq(sequenceStepsTable.sequenceId, current.sequenceId),
        eq(sequenceStepsTable.position, parsed.data.position),
      ));
    }
    return tx.update(sequenceStepsTable).set(parsed.data)
      .where(and(eq(sequenceStepsTable.id, params.data.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id))).returning();
  });
  if (!step) {
    res.status(404).json({ error: "Sequence step not found." });
    return;
  }
  res.json(UpdateSequenceStepResponse.parse(sequenceStepPayload(step)));
});

router.delete("/sequence-steps/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = DeleteSequenceStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Sequence step not found." });
    return;
  }
  const auth = getAuth(res);
  const deleted = await db.delete(sequenceStepsTable)
    .where(and(eq(sequenceStepsTable.id, params.data.id), eq(sequenceStepsTable.workspaceId, auth.workspace.id)))
    .returning({ id: sequenceStepsTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Sequence step not found." });
    return;
  }
  res.status(204).send();
});

router.post("/sequences/:id/enroll", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = EnrollSequenceParams.safeParse(req.params);
  const parsed = EnrollSequenceBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid sequence enrollment." });
    return;
  }
  const auth = getAuth(res);
  const [[sequence], [lead]] = await Promise.all([
    db.select().from(sequencesTable).where(and(
      eq(sequencesTable.id, params.data.id),
      eq(sequencesTable.workspaceId, auth.workspace.id),
    )).limit(1),
    db.select({ id: leadsTable.id }).from(leadsTable).where(and(
      eq(leadsTable.id, parsed.data.leadId),
      eq(leadsTable.workspaceId, auth.workspace.id),
    )).limit(1),
  ]);
  if (!sequence || !lead) {
    res.status(404).json({ error: "Active sequence or lead not found." });
    return;
  }
  if (sequence.status !== "active") {
    res.status(409).json({ error: "Only active sequences can enroll leads." });
    return;
  }
  try {
    const [run] = await enqueueSequenceRun(sequence, lead.id, parsed.data.idempotencyKey);
    if (!run) {
      res.status(409).json({ error: "This enrollment request was already processed." });
      return;
    }
    await db.insert(activitiesTable).values({
      workspaceId: auth.workspace.id,
      title: "Lead enrolled in sequence",
      detail: `${auth.user.name} enrolled a lead in ${sequence.name}.`,
    });
    res.status(201).json(EnrollSequenceResponse.parse(sequenceRunPayload(run!)));
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      res.status(409).json({ error: "This enrollment request was already processed." });
      return;
    }
    throw error;
  }
});

router.get("/sequence-runs", async (_req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const runs = await db.select().from(sequenceRunsTable)
    .where(eq(sequenceRunsTable.workspaceId, auth.workspace.id))
    .orderBy(desc(sequenceRunsTable.updatedAt)).limit(100);
  res.json(ListSequenceRunsResponse.parse(runs.map(sequenceRunPayload)));
});

router.patch("/sequence-runs/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAutomationManager(res)) return;
  const params = UpdateSequenceRunParams.safeParse(req.params);
  const parsed = UpdateSequenceRunBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid sequence run update." });
    return;
  }
  const auth = getAuth(res);
  const [run] = await db.update(sequenceRunsTable).set({
    status: parsed.data.status,
    nextRunAt: parsed.data.status === "scheduled" ? new Date() : undefined,
    lastError: parsed.data.status === "scheduled" ? null : undefined,
  }).where(and(eq(sequenceRunsTable.id, params.data.id), eq(sequenceRunsTable.workspaceId, auth.workspace.id))).returning();
  if (!run) {
    res.status(404).json({ error: "Sequence run not found." });
    return;
  }
  res.json(UpdateSequenceRunResponse.parse(sequenceRunPayload(run)));
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