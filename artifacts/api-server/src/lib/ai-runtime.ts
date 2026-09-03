import { and, desc, eq, gte } from "drizzle-orm";
import {
  activitiesTable,
  aiAgentSettingsTable,
  aiMappingsTable,
  aiMemoryItemsTable,
  aiRulesTable,
  contactsTable,
  conversationsTable,
  db,
  leadsTable,
  messagesTable,
} from "@workspace/db";
import { enrollMatchingSequences } from "./automation-enrollment";

type LeadUpdates = Partial<Pick<typeof leadsTable.$inferInsert, "company" | "email" | "phone" | "stage" | "assignee" | "tags">>;

const defaultSettings = {
  provider: "openai",
  model: "gpt-4o",
  prompt: "You are a helpful sales assistant.",
  botName: "Ai Botflow Assistant",
  companyName: "",
  companyTagline: "",
  industry: "",
  replyAll: true,
  onlyUnassigned: false,
  outsideBusinessHours: false,
  keywordOnly: false,
  stopOnHuman: true,
  rememberContext: true,
  useConversationHistory: true,
  autoUpdateContact: true,
  rememberOptOut: true,
  retentionDays: 0,
  maxTokens: 500,
  temperature: 0.7,
};

function capturedValue(text: string, fieldName: string): string | null {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*[:=]\\s*([^\\n]+)`, "i"))?.[1]?.trim() || null;
}

function mappedLeadField(crmField: string): keyof LeadUpdates | null {
  const normalized = crmField.toLowerCase().replace(/^leads?\./, "");
  return ["company", "email", "phone", "stage", "assignee", "tags"].includes(normalized)
    ? normalized as keyof LeadUpdates
    : null;
}

function applyRuleAction(action: string, updates: LeadUpdates, currentTags: string[]): string | null {
  const stage = action.match(/set\s+(?:lead\s+)?stage\s+to\s+["']?([^,"']+)/i)?.[1]?.trim();
  if (stage) {
    updates.stage = stage.toLowerCase().replace(/\s+/g, "_");
    return `stage → ${updates.stage}`;
  }
  const assignee = action.match(/assign\s+(?:lead\s+)?to\s+["']?([^,"']+)/i)?.[1]?.trim();
  if (assignee) {
    updates.assignee = assignee;
    return `assignee → ${assignee}`;
  }
  const tag = action.match(/add\s+tag\s+["']?([^,"']+)/i)?.[1]?.trim();
  if (tag) {
    updates.tags = Array.from(new Set([...currentTags, tag]));
    return `tag +${tag}`;
  }
  return null;
}

function isOutsideBusinessHours(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date));
  return hour < 9 || hour >= 18;
}

export async function executeAiRuntime(
  workspaceId: string,
  leadId: string | null,
  inputText: string,
  options: { conversationId?: string; eventKey?: string } = {},
) {
  const [storedSettings] = await db.select().from(aiAgentSettingsTable)
    .where(eq(aiAgentSettingsTable.workspaceId, workspaceId)).limit(1);
  const settings = storedSettings ?? defaultSettings;
  const retentionStart = settings.retentionDays > 0
    ? new Date(Date.now() - settings.retentionDays * 24 * 60 * 60_000)
    : null;
  const memoryFilters = [
    eq(aiMemoryItemsTable.workspaceId, workspaceId),
    eq(aiMemoryItemsTable.status, "active"),
  ];
  if (retentionStart) memoryFilters.push(gte(aiMemoryItemsTable.updatedAt, retentionStart));
  const memory = await db.select().from(aiMemoryItemsTable).where(and(...memoryFilters));
  const words = new Set(inputText.toLowerCase().split(/\W+/).filter((word) => word.length > 2));
  const relevantMemory = memory.filter((item) => {
    const searchable = `${item.title} ${item.content} ${item.tags.join(" ")}`.toLowerCase();
    return [...words].some((word) => searchable.includes(word));
  }).slice(0, 8);
  const history = settings.rememberContext && settings.useConversationHistory && options.conversationId
    ? await db.select().from(messagesTable).where(and(
        eq(messagesTable.conversationId, options.conversationId),
        ...(retentionStart ? [gte(messagesTable.sentAt, retentionStart)] : []),
      )).orderBy(desc(messagesTable.sentAt)).limit(20)
    : [];
  if (!leadId) return {
    status: "skipped" as const,
    reason: "No lead is linked to this event.",
    replyPreview: "",
    provider: settings.provider,
    model: settings.model,
    promptApplied: false,
    companyName: settings.companyName,
    memoryUsed: relevantMemory.map((item) => item.title),
    mappingsApplied: [] as string[],
    rulesExecuted: [] as string[],
    historyMessages: history.length,
    contactUpdated: false,
    senderName: settings.botName,
  };

  const [lead] = await db.select().from(leadsTable).where(and(
    eq(leadsTable.id, leadId),
    eq(leadsTable.workspaceId, workspaceId),
  )).limit(1);
  if (!lead) throw new Error("Lead not found.");

  const mappings = await db.select().from(aiMappingsTable).where(and(
    eq(aiMappingsTable.workspaceId, workspaceId),
    eq(aiMappingsTable.status, "active"),
  ));
  const rules = await db.select().from(aiRulesTable).where(and(
    eq(aiRulesTable.workspaceId, workspaceId),
    eq(aiRulesTable.status, "active"),
  ));
  const updates: LeadUpdates = {};
  const mappedFields: string[] = [];
  for (const mapping of mappings) {
    const value = capturedValue(inputText, mapping.fieldName);
    const field = mappedLeadField(mapping.crmField);
    if (!value || !field) continue;
    if (field === "tags") updates.tags = Array.from(new Set([...lead.tags, ...value.split(",").map((tag) => tag.trim()).filter(Boolean)]));
    else updates[field] = value as never;
    mappedFields.push(`${mapping.fieldName} → ${mapping.crmField}`);
  }
  const executedRules: string[] = [];
  for (const rule of rules) {
    if (!inputText.toLowerCase().includes(rule.trigger.toLowerCase())) continue;
    const effect = applyRuleAction(rule.actionText, updates, updates.tags ?? lead.tags);
    if (effect) executedRules.push(`${rule.trigger}: ${effect}`);
  }
  let contactUpdated = false;
  if (Object.keys(updates).length) {
    const [updated] = await db.update(leadsTable).set(updates).where(and(
      eq(leadsTable.id, lead.id),
      eq(leadsTable.workspaceId, workspaceId),
    )).returning();
    if (settings.autoUpdateContact && updated?.contactId) {
      await db.update(contactsTable).set({
        company: updates.company,
        email: updates.email,
        phone: updates.phone,
      }).where(and(eq(contactsTable.id, updated.contactId), eq(contactsTable.workspaceId, workspaceId)));
      contactUpdated = true;
    }
    if (updated && updates.stage && updates.stage !== lead.stage) {
      await enrollMatchingSequences(workspaceId, updated.id, "stage_changed", {
        stage: updated.stage,
        eventKey: options.eventKey ?? `ai-stage:${updated.id}:${lead.stage}:${updated.stage}`,
      });
    }
  }

  const normalizedTags = (updates.tags ?? lead.tags).map((tag) => tag.toLowerCase());
  let skipReason = "";
  if (settings.rememberOptOut && normalizedTags.some((tag) => ["opt-out", "optout", "unsubscribed", "do-not-contact", "dnc"].includes(tag))) {
    skipReason = "Lead opted out.";
  } else if (settings.stopOnHuman && lead.assignee !== "Unassigned") {
    skipReason = "Human agent owns this lead.";
  } else if (settings.onlyUnassigned && lead.assignee !== "Unassigned") {
    skipReason = "AI replies only to unassigned leads.";
  } else if (settings.outsideBusinessHours && !isOutsideBusinessHours()) {
    skipReason = "AI is configured to reply only outside business hours.";
  } else if (settings.keywordOnly && relevantMemory.length === 0 && executedRules.length === 0) {
    skipReason = "No configured keyword, memory, or rule matched.";
  } else if (!settings.replyAll && !settings.onlyUnassigned && !settings.outsideBusinessHours && !settings.keywordOnly) {
    skipReason = "Automatic replies are disabled.";
  }

  const knowledge = relevantMemory[0]?.content;
  const identity = settings.companyName || settings.companyTagline
    ? ` for ${settings.companyName || settings.companyTagline}`
    : "";
  const reply = knowledge
    ? `${settings.botName}${identity}: ${knowledge}`
    : `${settings.botName}${identity}: Thanks for your message. I have recorded your request and the team can follow up.`;
  const replyPreview = reply.slice(0, Math.max(1, settings.maxTokens) * 4);
  await db.insert(activitiesTable).values({
    workspaceId,
    title: skipReason ? "AI inbound event skipped" : "AI inbound event processed",
    detail: `${settings.provider}/${settings.model}; memory ${relevantMemory.length}; history ${history.length}; mappings ${mappedFields.length}; rules ${executedRules.length}${skipReason ? `; ${skipReason}` : ""}.`,
  });
  return {
    status: skipReason ? "skipped" as const : "replied" as const,
    reason: skipReason || `Dry-run reply composed with ${settings.prompt.length} character system prompt at temperature ${settings.temperature}.`,
    replyPreview: skipReason ? "" : replyPreview,
    provider: settings.provider,
    model: settings.model,
    promptApplied: !skipReason,
    companyName: settings.companyName,
    memoryUsed: relevantMemory.map((item) => item.title),
    mappingsApplied: mappedFields,
    rulesExecuted: executedRules,
    historyMessages: history.length,
    contactUpdated,
    senderName: settings.botName,
  };
}

export async function persistAiDryRunReply(
  workspaceId: string,
  conversationId: string,
  body: string,
  senderName: string,
) {
  return db.transaction(async (tx) => {
    const [conversation] = await tx.update(conversationsTable).set({
      lastMessage: body,
    }).where(and(
      eq(conversationsTable.id, conversationId),
      eq(conversationsTable.workspaceId, workspaceId),
    )).returning();
    if (!conversation) throw new Error("Conversation not found.");
    const [message] = await tx.insert(messagesTable).values({
      workspaceId,
      conversationId,
      body,
      direction: "outbound",
      senderName,
      deliveryStatus: "delivery_disabled",
    }).returning();
    return message!;
  });
}

export async function composeAiOutboundMessage(workspaceId: string, instruction: string) {
  const [storedSettings] = await db.select().from(aiAgentSettingsTable)
    .where(eq(aiAgentSettingsTable.workspaceId, workspaceId)).limit(1);
  const settings = storedSettings ?? defaultSettings;
  const memory = settings.rememberContext
    ? await db.select().from(aiMemoryItemsTable).where(and(
        eq(aiMemoryItemsTable.workspaceId, workspaceId),
        eq(aiMemoryItemsTable.status, "active"),
      )).limit(5)
    : [];
  const knowledge = memory[0]?.content;
  const identity = settings.companyName ? ` for ${settings.companyName}` : "";
  const generated = instruction
    .replace(/\{\{\s*botName\s*\}\}/gi, settings.botName)
    .replace(/\{\{\s*companyName\s*\}\}/gi, settings.companyName);
  return {
    body: (knowledge ? `${generated}\n\n${knowledge}` : generated).slice(0, Math.max(1, settings.maxTokens) * 4),
    senderName: `${settings.botName}${identity}`,
    provider: settings.provider,
    model: settings.model,
  };
}