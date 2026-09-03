import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAiSettingsQueryKey,
  getListAiMappingsQueryKey,
  getListAiMemoryItemsQueryKey,
  getListAiRulesQueryKey,
  getListSequenceRunsQueryKey,
  getListSequencesQueryKey,
  useCreateAiMapping,
  useCreateAiMemoryItem,
  useCreateAiRule,
  useCreateSequence,
  useCreateSequenceStep,
  useDeleteAiMapping,
  useDeleteAiMemoryItem,
  useDeleteAiRule,
  useDeleteSequence,
  useDeleteSequenceStep,
  useDuplicateSequence,
  useEnrollSequence,
  useGetAiSettings,
  useGetSession,
  useListAiMappings,
  useListAiMemoryItems,
  useListAiRules,
  useListLeads,
  useListSequenceRuns,
  useListSequences,
  useProcessAiInboundEvent,
  useUpdateAiMapping,
  useUpdateAiMemoryItem,
  useUpdateAiRule,
  useUpdateAiSettings,
  useUpdateSequence,
  useUpdateSequenceRun,
  useUpdateSequenceStep,
  type AiSettingsUpdate,
  type AiRuntimeResult,
  type Sequence,
  type SequenceStep,
} from "@workspace/api-client-react";
import {
  ArrowDown, ArrowUp, Bot, BrainCircuit, Check, Clock3, Copy, Database, GitBranch,
  Loader2, Pause, Play, Plus, RefreshCw, Save, Search, Send, Settings2, Trash2, Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Tab = "agent" | "memory" | "sync" | "sequences";

const defaultDraft: AiSettingsUpdate = {
  provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 500,
  prompt: "You are a helpful sales assistant. Answer accurately, qualify leads, and transfer to a human when unsure.",
  botName: "Ai Botflow Assistant", companyName: "", companyTagline: "", industry: "",
  contactEmail: "", supportPhone: "", officeAddress: "", replyAll: true, onlyUnassigned: false,
  outsideBusinessHours: false, keywordOnly: false, stopOnHuman: true, rememberContext: true,
  useConversationHistory: true, autoUpdateContact: true, rememberOptOut: true, retentionDays: 0,
};

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white panel-shadow ${className}`}>{children}</section>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} aria-pressed={checked} onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#22c55e]" : "bg-slate-200"} disabled:opacity-50`}>
    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>{label}</span>{children}</label>;
}

function Status({ message }: { message: string }) {
  if (!message) return null;
  return <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={14} className="text-green-400" />{message}</div>;
}

function getError(error: unknown) {
  return error instanceof Error ? error.message : "Request failed. Please try again.";
}

export default function Sequences() {
  const queryClient = useQueryClient();
  const { data: session } = useGetSession();
  const canEdit = session?.user?.role === "owner" || session?.user?.role === "admin";
  const [tab, setTab] = useState<Tab>("agent");
  const [notice, setNotice] = useState("");
  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2400); };
  const fail = (error: unknown) => notify(getError(error));

  const settingsQuery = useGetAiSettings();
  const updateSettings = useUpdateAiSettings();
  const processInbound = useProcessAiInboundEvent();
  const [draft, setDraft] = useState<AiSettingsUpdate>(defaultDraft);
  useEffect(() => {
    if (settingsQuery.data) {
      const { id: _id, updatedAt: _updatedAt, ...values } = settingsQuery.data;
      setDraft(values);
    }
  }, [settingsQuery.data]);
  const setSetting = <K extends keyof AiSettingsUpdate>(key: K, value: AiSettingsUpdate[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const memoryQuery = useListAiMemoryItems();
  const createMemory = useCreateAiMemoryItem();
  const updateMemory = useUpdateAiMemoryItem();
  const deleteMemory = useDeleteAiMemoryItem();
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryForm, setMemoryForm] = useState({ kind: "product" as "product" | "faq", title: "", content: "", price: "", tags: "" });

  const mappingsQuery = useListAiMappings();
  const createMapping = useCreateAiMapping();
  const updateMapping = useUpdateAiMapping();
  const deleteMapping = useDeleteAiMapping();
  const [mappingForm, setMappingForm] = useState({ fieldName: "", crmField: "", instruction: "" });
  const rulesQuery = useListAiRules();
  const createRule = useCreateAiRule();
  const updateRule = useUpdateAiRule();
  const deleteRule = useDeleteAiRule();
  const [ruleForm, setRuleForm] = useState({ trigger: "", actionText: "" });

  const sequencesQuery = useListSequences();
  const runsQuery = useListSequenceRuns();
  const leadsQuery = useListLeads();
  const createSequence = useCreateSequence();
  const updateSequence = useUpdateSequence();
  const duplicateSequence = useDuplicateSequence();
  const deleteSequence = useDeleteSequence();
  const createStep = useCreateSequenceStep();
  const updateStep = useUpdateSequenceStep();
  const deleteStep = useDeleteSequenceStep();
  const enroll = useEnrollSequence();
  const updateRun = useUpdateSequenceRun();
  const [sequenceName, setSequenceName] = useState("");
  const [sequenceTrigger, setSequenceTrigger] = useState<"manual" | "new_lead" | "no_reply" | "stage_changed">("manual");
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const selectedSequence = useMemo(() => sequencesQuery.data?.find((sequence) => sequence.id === selectedSequenceId) ?? sequencesQuery.data?.[0], [sequencesQuery.data, selectedSequenceId]);
  useEffect(() => {
    if (!selectedSequenceId && sequencesQuery.data?.[0]) setSelectedSequenceId(sequencesQuery.data[0].id);
  }, [sequencesQuery.data, selectedSequenceId]);
  const [stepForm, setStepForm] = useState({ type: "message" as "trigger" | "message" | "wait" | "ai", title: "", delayMinutes: 1440, channel: "whatsapp" as "whatsapp" | "instagram" | "facebook", message: "", quickReplies: "", fallbackAction: "retry" as "retry" | "skip" | "pause", exitOnReply: true, exitOnUnsubscribe: true });
  const [editingStepId, setEditingStepId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [runtimeLeadId, setRuntimeLeadId] = useState("");
  const [runtimeText, setRuntimeText] = useState("");
  const [runtimeChannel, setRuntimeChannel] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
  const [runtimeResult, setRuntimeResult] = useState<AiRuntimeResult | null>(null);
  const [enrollmentKey, setEnrollmentKey] = useState(() => crypto.randomUUID());
  const [sequenceSchedule, setSequenceSchedule] = useState({ timezone: "Asia/Kolkata", quietHoursStart: "21:00", quietHoursEnd: "09:00", triggerConfig: "" });
  useEffect(() => {
    if (selectedSequence) setSequenceSchedule({
      timezone: selectedSequence.timezone,
      quietHoursStart: selectedSequence.quietHoursStart,
      quietHoursEnd: selectedSequence.quietHoursEnd,
      triggerConfig: selectedSequence.triggerConfig,
    });
  }, [selectedSequence]);

  const refreshMemory = () => queryClient.invalidateQueries({ queryKey: getListAiMemoryItemsQueryKey() });
  const refreshMappings = () => queryClient.invalidateQueries({ queryKey: getListAiMappingsQueryKey() });
  const refreshRules = () => queryClient.invalidateQueries({ queryKey: getListAiRulesQueryKey() });
  const refreshSequences = () => queryClient.invalidateQueries({ queryKey: getListSequencesQueryKey() });
  const refreshRuns = () => queryClient.invalidateQueries({ queryKey: getListSequenceRunsQueryKey() });
  const busy = updateSettings.isPending || createMemory.isPending || createMapping.isPending || createRule.isPending || createSequence.isPending || createStep.isPending;
  const filteredMemory = (memoryQuery.data ?? []).filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(memorySearch.toLowerCase()));

  const editStep = (step: SequenceStep) => {
    setEditingStepId(step.id);
    setStepForm({
      type: step.type, title: step.title, delayMinutes: step.delayMinutes, channel: step.channel,
      message: step.message, quickReplies: step.quickReplies.join(", "), fallbackAction: step.fallbackAction,
      exitOnReply: step.exitOnReply, exitOnUnsubscribe: step.exitOnUnsubscribe,
    });
  };
  const resetStep = () => {
    setEditingStepId("");
    setStepForm({ type: "message", title: "", delayMinutes: 1440, channel: "whatsapp", message: "", quickReplies: "", fallbackAction: "retry", exitOnReply: true, exitOnUnsubscribe: true });
  };
  const stepData = () => ({
    type: stepForm.type, title: stepForm.title, delayMinutes: Number(stepForm.delayMinutes), channel: stepForm.channel,
    message: stepForm.message, quickReplies: stepForm.quickReplies.split(",").map((value) => value.trim()).filter(Boolean),
    fallbackAction: stepForm.fallbackAction, exitOnReply: stepForm.exitOnReply, exitOnUnsubscribe: stepForm.exitOnUnsubscribe,
  });

  return <AppLayout>
    <Status message={notice} />
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">AI / Automation</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">AI Agent, Memory & Sequences</h1><p className="mt-1 text-sm text-slate-500">Configure the AI brain, trusted memory, CRM actions and automated follow-ups.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 panel-shadow"><span className={`h-2 w-2 rounded-full ${canEdit ? "bg-green-500" : "bg-amber-400"}`} />{canEdit ? "Workspace configuration access" : "Read-only agent access"}</div>
      </div>
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 panel-shadow">
        {([["agent", Bot, "AI Agent"], ["memory", BrainCircuit, "Memory"], ["sync", Database, "CRM Data Sync"], ["sequences", Clock3, "Sequences"]] as const).map(([key, Icon, label]) =>
          <button key={key} type="button" onClick={() => setTab(key)} className={`flex min-w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${tab === key ? "bg-[#e5f7eb] text-[#159447]" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={15} />{label}</button>)}
      </nav>

      {settingsQuery.isLoading ? <Panel className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-green-600" /></Panel> : null}

      {tab === "agent" && !settingsQuery.isLoading && <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <Panel className="p-5">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-base font-extrabold">AI Agent Configuration</h2><p className="mt-1 text-xs text-slate-500">Provider, model and response behavior persist per workspace.</p></div><Zap className="text-violet-500" size={20} /></div>
            <div className="grid gap-3 sm:grid-cols-3">{(["openai", "gemini", "custom"] as const).map((provider) => <button type="button" key={provider} disabled={!canEdit} onClick={() => setSetting("provider", provider)} className={`rounded-xl border p-4 text-left text-xs font-bold capitalize ${draft.provider === provider ? "border-green-400 bg-green-50 ring-2 ring-green-100" : "border-slate-200"}`}>{provider}<span className="mt-1 block text-[10px] font-normal text-slate-400">{provider === "custom" ? "OpenAI-compatible" : "Managed provider"}</span></button>)}</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Model"><Input disabled={!canEdit} value={draft.model ?? ""} onChange={(e) => setSetting("model", e.target.value)} /></Field>
              <Field label={`Temperature · ${draft.temperature ?? 0.7}`}><input disabled={!canEdit} type="range" min="0" max="2" step=".1" className="mt-3 w-full accent-green-500" value={draft.temperature ?? 0.7} onChange={(e) => setSetting("temperature", Number(e.target.value))} /></Field>
              <Field label="Max tokens"><Input disabled={!canEdit} type="number" min={50} max={8000} value={draft.maxTokens ?? 500} onChange={(e) => setSetting("maxTokens", Number(e.target.value))} /></Field>
            </div>
            <Field label="System prompt / persona"><Textarea disabled={!canEdit} className="mt-1 min-h-32" value={draft.prompt ?? ""} onChange={(e) => setSetting("prompt", e.target.value)} /></Field>
          </Panel>
          <Panel className="p-5">
            <h2 className="font-display text-sm font-extrabold">When should AI reply?</h2>
            <div className="mt-3 divide-y divide-slate-100">{([
              ["replyAll", "Reply to all new incoming messages"], ["onlyUnassigned", "Only when no agent is assigned"],
              ["outsideBusinessHours", "Only outside business hours"], ["keywordOnly", "Only for configured keywords"],
              ["stopOnHuman", "Stop AI when a human takes over"],
            ] as const).map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600"><span>{label}</span><Toggle disabled={!canEdit} checked={Boolean(draft[key])} onChange={(value) => setSetting(key, value)} /></div>)}</div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-display text-sm font-extrabold">Test inbound AI runtime</h2><p className="mt-1 text-xs text-slate-500">Stores a real inbound event and previews the provider-independent result.</p></div><Bot size={18} className="text-green-600" /></div>
            <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); processInbound.mutate({ data: { leadId: runtimeLeadId, channel: runtimeChannel, text: runtimeText } }, { onSuccess: (result) => { setRuntimeResult(result); notify("Inbound event processed"); }, onError: fail }); }}>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Lead"><select required className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={runtimeLeadId} onChange={(e) => setRuntimeLeadId(e.target.value)}><option value="">Choose a lead</option>{leadsQuery.data?.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}</select></Field><Field label="Channel"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={runtimeChannel} onChange={(e) => setRuntimeChannel(e.target.value as typeof runtimeChannel)}><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option></select></Field></div>
              <Field label="Customer message"><Textarea required value={runtimeText} onChange={(e) => setRuntimeText(e.target.value)} placeholder={"I want a demo\nBudget: premium"} /></Field>
              <Button disabled={!runtimeLeadId || !runtimeText.trim() || processInbound.isPending} className="w-full bg-slate-900 text-white">{processInbound.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />}Process inbound event</Button>
            </form>
            {runtimeResult && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between"><span className={`rounded-full px-2 py-1 font-bold uppercase ${runtimeResult.status === "replied" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{runtimeResult.status}</span><span className="font-mono text-slate-400">{runtimeResult.provider}/{runtimeResult.model}</span></div>
              <p className="mt-3 text-slate-500">{runtimeResult.reason}</p>{runtimeResult.replyPreview && <p className="mt-3 rounded-lg bg-white p-3 leading-5 text-slate-700">{runtimeResult.replyPreview}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2 text-slate-500"><span>Memory: {runtimeResult.memoryUsed.length}</span><span>History: {runtimeResult.historyMessages}</span><span>Mappings: {runtimeResult.mappingsApplied.length}</span><span>Rules: {runtimeResult.rulesExecuted.length}</span></div>
            </div>}
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel className="p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-display text-sm font-extrabold">Company identity</h2><p className="mt-1 text-xs text-slate-500">Injected into every AI conversation.</p></div><Bot size={18} className="text-green-600" /></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Bot name"><Input disabled={!canEdit} value={draft.botName ?? ""} onChange={(e) => setSetting("botName", e.target.value)} /></Field>
              <Field label="Company name"><Input disabled={!canEdit} value={draft.companyName ?? ""} onChange={(e) => setSetting("companyName", e.target.value)} /></Field>
              <Field label="Tagline"><Input disabled={!canEdit} value={draft.companyTagline ?? ""} onChange={(e) => setSetting("companyTagline", e.target.value)} /></Field>
              <Field label="Industry"><Input disabled={!canEdit} value={draft.industry ?? ""} onChange={(e) => setSetting("industry", e.target.value)} /></Field>
              <Field label="Contact email"><Input disabled={!canEdit} value={draft.contactEmail ?? ""} onChange={(e) => setSetting("contactEmail", e.target.value)} /></Field>
              <Field label="Support phone"><Input disabled={!canEdit} value={draft.supportPhone ?? ""} onChange={(e) => setSetting("supportPhone", e.target.value)} /></Field>
            </div>
            <Field label="Office address"><Textarea disabled={!canEdit} value={draft.officeAddress ?? ""} onChange={(e) => setSetting("officeAddress", e.target.value)} /></Field>
          </Panel>
          <Panel className="p-5">
            <h2 className="font-display text-sm font-extrabold">Customer history memory</h2>
            <div className="mt-3 divide-y divide-slate-100">{([
              ["rememberContext", "Remember context across conversations"], ["useConversationHistory", "Use previous conversation history"],
              ["autoUpdateContact", "Auto-update contact profiles"], ["rememberOptOut", "Remember opt-outs and never re-contact"],
            ] as const).map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600"><span>{label}</span><Toggle disabled={!canEdit} checked={Boolean(draft[key])} onChange={(value) => setSetting(key, value)} /></div>)}</div>
            <Field label="Memory retention"><select disabled={!canEdit} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3" value={draft.retentionDays ?? 0} onChange={(e) => setSetting("retentionDays", Number(e.target.value))}><option value={0}>Forever</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option></select></Field>
          </Panel>
          <Button disabled={!canEdit || updateSettings.isPending} className="w-full rounded-xl bg-[#22c55e] font-bold text-white" onClick={() => updateSettings.mutate({ data: draft }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAiSettingsQueryKey() }); notify("AI configuration saved"); }, onError: fail })}>{updateSettings.isPending ? <Loader2 className="mr-2 animate-spin" size={15} /> : <Save className="mr-2" size={15} />}Save AI & memory settings</Button>
        </div>
      </div>}

      {tab === "memory" && <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Panel className="h-fit p-5"><h2 className="font-display text-base font-extrabold">Add trusted memory</h2><p className="mt-1 text-xs text-slate-500">Products and FAQs become reusable AI context.</p>
          <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); createMemory.mutate({ data: { ...memoryForm, tags: memoryForm.tags.split(",").map((v) => v.trim()).filter(Boolean) } }, { onSuccess: () => { setMemoryForm({ kind: "product", title: "", content: "", price: "", tags: "" }); refreshMemory(); notify("Memory item added"); }, onError: fail }); }}>
            <Field label="Type"><select disabled={!canEdit} className="h-10 w-full rounded-lg border border-slate-200 px-3" value={memoryForm.kind} onChange={(e) => setMemoryForm({ ...memoryForm, kind: e.target.value as "product" | "faq" })}><option value="product">Product / service</option><option value="faq">FAQ</option></select></Field>
            <Field label={memoryForm.kind === "faq" ? "Question" : "Name"}><Input disabled={!canEdit} required value={memoryForm.title} onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })} /></Field>
            <Field label={memoryForm.kind === "faq" ? "Answer" : "Description"}><Textarea disabled={!canEdit} required value={memoryForm.content} onChange={(e) => setMemoryForm({ ...memoryForm, content: e.target.value })} /></Field>
            {memoryForm.kind === "product" && <Field label="Price"><Input disabled={!canEdit} value={memoryForm.price} onChange={(e) => setMemoryForm({ ...memoryForm, price: e.target.value })} /></Field>}
            <Field label="Tags (comma separated)"><Input disabled={!canEdit} value={memoryForm.tags} onChange={(e) => setMemoryForm({ ...memoryForm, tags: e.target.value })} /></Field>
            <Button disabled={!canEdit || createMemory.isPending} className="w-full bg-[#22c55e] text-white"><Plus size={14} className="mr-2" />Add memory</Button>
          </form>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-base font-extrabold">Products & FAQ knowledge</h2><p className="text-xs text-slate-500">{memoryQuery.data?.length ?? 0} indexed records</p></div><div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={14} className="text-slate-400" /><input value={memorySearch} onChange={(e) => setMemorySearch(e.target.value)} className="bg-transparent text-xs outline-none" placeholder="Search memory" /></div></div>
          <div className="divide-y divide-slate-100">{filteredMemory.map((item) => <article key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.kind === "faq" ? "bg-violet-100 text-violet-700" : "bg-green-100 text-green-700"}`}>{item.kind}</span><h3 className="font-bold text-slate-800">{item.title}</h3></div><p className="mt-2 text-sm leading-6 text-slate-500">{item.content}</p>{item.price && <p className="mt-1 text-xs font-bold text-slate-700">{item.price}</p>}<div className="mt-2 flex flex-wrap gap-1">{item.tags.map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{tag}</span>)}</div></div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={!canEdit} onClick={() => updateMemory.mutate({ id: item.id, data: { status: item.status === "active" ? "inactive" : "active" } }, { onSuccess: refreshMemory, onError: fail })}>{item.status === "active" ? "Pause" : "Activate"}</Button><Button size="icon" variant="outline" disabled={!canEdit} onClick={() => deleteMemory.mutate({ id: item.id }, { onSuccess: refreshMemory, onError: fail })}><Trash2 size={14} className="text-red-500" /></Button></div></article>)}{!filteredMemory.length && <div className="p-10 text-center text-sm text-slate-500">No matching memory items yet.</div>}</div>
        </Panel>
      </div>}

      {tab === "sync" && <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-5"><div className="flex items-center gap-2"><Database className="text-cyan-600" size={18} /><h2 className="font-display text-base font-extrabold">CRM field mappings</h2></div>
          <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); createMapping.mutate({ data: mappingForm }, { onSuccess: () => { setMappingForm({ fieldName: "", crmField: "", instruction: "" }); refreshMappings(); notify("CRM mapping created"); }, onError: fail }); }}><div className="grid gap-3 sm:grid-cols-2"><Field label="Captured field"><Input disabled={!canEdit} required value={mappingForm.fieldName} onChange={(e) => setMappingForm({ ...mappingForm, fieldName: e.target.value })} /></Field><Field label="CRM field"><Input disabled={!canEdit} required placeholder="leads.tags" value={mappingForm.crmField} onChange={(e) => setMappingForm({ ...mappingForm, crmField: e.target.value })} /></Field></div><Field label="AI instruction"><Input disabled={!canEdit} required value={mappingForm.instruction} onChange={(e) => setMappingForm({ ...mappingForm, instruction: e.target.value })} /></Field><Button disabled={!canEdit} className="bg-[#22c55e] text-white"><Plus size={14} className="mr-2" />Add mapping</Button></form>
          <div className="mt-5 divide-y divide-slate-100">{(mappingsQuery.data ?? []).map((item) => <div key={item.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-700">{item.fieldName} <span className="font-mono text-xs font-normal text-slate-400">→ {item.crmField}</span></p><p className="text-xs text-slate-500">{item.instruction}</p></div><Toggle disabled={!canEdit} checked={item.status === "active"} onChange={(value) => updateMapping.mutate({ id: item.id, data: { status: value ? "active" : "inactive" } }, { onSuccess: refreshMappings, onError: fail })} /><button disabled={!canEdit} onClick={() => deleteMapping.mutate({ id: item.id }, { onSuccess: refreshMappings, onError: fail })}><Trash2 size={14} className="text-red-400" /></button></div>)}</div>
        </Panel>
        <Panel className="p-5"><div className="flex items-center gap-2"><GitBranch className="text-violet-600" size={18} /><h2 className="font-display text-base font-extrabold">Automatic CRM rules</h2></div>
          <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); createRule.mutate({ data: ruleForm }, { onSuccess: () => { setRuleForm({ trigger: "", actionText: "" }); refreshRules(); notify("Automation rule created"); }, onError: fail }); }}><Field label="When"><Input disabled={!canEdit} required placeholder="Lead asks for a demo" value={ruleForm.trigger} onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })} /></Field><Field label="Then"><Input disabled={!canEdit} required placeholder="Set stage to proposal and assign sales" value={ruleForm.actionText} onChange={(e) => setRuleForm({ ...ruleForm, actionText: e.target.value })} /></Field><Button disabled={!canEdit} className="bg-[#22c55e] text-white"><Plus size={14} className="mr-2" />Add rule</Button></form>
          <div className="mt-5 space-y-2">{(rulesQuery.data ?? []).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border-l-4 border-violet-400 bg-slate-50 p-3"><div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-700">{item.trigger}</p><p className="mt-1 text-xs text-slate-500">→ {item.actionText}</p></div><Toggle disabled={!canEdit} checked={item.status === "active"} onChange={(value) => updateRule.mutate({ id: item.id, data: { status: value ? "active" : "paused" } }, { onSuccess: refreshRules, onError: fail })} /><button disabled={!canEdit} onClick={() => deleteRule.mutate({ id: item.id }, { onSuccess: refreshRules, onError: fail })}><Trash2 size={14} className="text-red-400" /></button></div>)}</div>
        </Panel>
      </div>}

      {tab === "sequences" && <div className="space-y-5">
        <Panel className="p-5">
          <form className="flex flex-col gap-3 lg:flex-row lg:items-end" onSubmit={(e) => { e.preventDefault(); createSequence.mutate({ data: { name: sequenceName, triggerType: sequenceTrigger } }, { onSuccess: (created) => { setSequenceName(""); setSelectedSequenceId(created.id); refreshSequences(); notify("Sequence draft created"); }, onError: fail }); }}><Field label="New sequence name"><Input disabled={!canEdit} required className="lg:w-72" value={sequenceName} onChange={(e) => setSequenceName(e.target.value)} placeholder="Re-engage cold leads" /></Field><Field label="Trigger"><select disabled={!canEdit} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={sequenceTrigger} onChange={(e) => setSequenceTrigger(e.target.value as typeof sequenceTrigger)}><option value="manual">Manual enrollment</option><option value="new_lead">New lead</option><option value="no_reply">No reply</option><option value="stage_changed">Stage changed</option></select></Field><Button disabled={!canEdit || createSequence.isPending} className="bg-[#22c55e] text-white"><Plus size={14} className="mr-2" />Create sequence</Button></form>
        </Panel>
        {!selectedSequence ? <Panel className="p-12 text-center"><Clock3 className="mx-auto text-green-600" /><h2 className="mt-3 font-display text-lg font-extrabold">No sequences yet</h2><p className="mt-2 text-sm text-slate-500">Create a draft above, add steps, then activate it.</p></Panel> :
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Panel className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
              <select className="h-10 min-w-60 rounded-lg border border-slate-200 px-3 text-sm font-bold" value={selectedSequence.id} onChange={(e) => setSelectedSequenceId(e.target.value)}>{sequencesQuery.data?.map((sequence) => <option key={sequence.id} value={sequence.id}>{sequence.name}</option>)}</select>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${selectedSequence.status === "active" ? "bg-green-100 text-green-700" : selectedSequence.status === "paused" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{selectedSequence.status}</span>
              <div className="ml-auto flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!canEdit} onClick={() => duplicateSequence.mutate({ id: selectedSequence.id }, { onSuccess: (copy) => { refreshSequences(); setSelectedSequenceId(copy.id); notify("Sequence duplicated"); }, onError: fail })}><Copy size={13} className="mr-1" />Duplicate</Button><Button size="sm" variant="outline" disabled={!canEdit} onClick={() => updateSequence.mutate({ id: selectedSequence.id, data: { status: selectedSequence.status === "active" ? "paused" : "active" } }, { onSuccess: refreshSequences, onError: fail })}>{selectedSequence.status === "active" ? <Pause size={13} className="mr-1" /> : <Play size={13} className="mr-1" />}{selectedSequence.status === "active" ? "Pause" : "Activate"}</Button><Button size="icon" variant="outline" disabled={!canEdit} onClick={() => deleteSequence.mutate({ id: selectedSequence.id }, { onSuccess: () => { setSelectedSequenceId(""); refreshSequences(); }, onError: fail })}><Trash2 size={14} className="text-red-500" /></Button></div>
            </Panel>
            <Panel className="overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-display text-base font-extrabold">Sequence timeline</h2><p className="text-xs text-slate-500">Ordered steps run after their configured delay.</p></div><div className="space-y-3 p-5">{selectedSequence.steps.map((step, index) => <article key={step.id} onClick={() => editStep(step)} className={`cursor-pointer rounded-xl border p-4 ${editingStepId === step.id ? "border-green-400 bg-green-50/50 ring-2 ring-green-100" : "border-slate-200"}`}><div className="flex items-start gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase text-violet-700">{step.type}</span><span className="text-[10px] font-semibold text-slate-400">{Math.round(step.delayMinutes / 60)}h delay · {step.channel}</span></div><h3 className="mt-2 font-bold text-slate-800">{step.title}</h3>{step.message && <p className="mt-2 text-sm leading-6 text-slate-500">{step.message}</p>}</div><div className="flex gap-1"><button disabled={!canEdit || index === 0} onClick={(e) => { e.stopPropagation(); updateStep.mutate({ id: step.id, data: { ...step, position: index - 1 } }, { onSuccess: refreshSequences, onError: fail }); }}><ArrowUp size={14} /></button><button disabled={!canEdit || index === selectedSequence.steps.length - 1} onClick={(e) => { e.stopPropagation(); updateStep.mutate({ id: step.id, data: { ...step, position: index + 1 } }, { onSuccess: refreshSequences, onError: fail }); }}><ArrowDown size={14} /></button><button disabled={!canEdit} onClick={(e) => { e.stopPropagation(); deleteStep.mutate({ id: step.id }, { onSuccess: refreshSequences, onError: fail }); }}><Trash2 size={14} className="text-red-400" /></button></div></div></article>)}{!selectedSequence.steps.length && <div className="py-8 text-center text-sm text-slate-500">No steps yet. Add the first step from the editor.</div>}</div></Panel>
          </div>
          <div className="space-y-5">
            <Panel className="p-5"><h2 className="font-display text-base font-extrabold">Schedule & guardrails</h2><p className="mt-1 text-xs text-slate-500">Timezone and quiet hours control when queued steps may run.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Timezone"><Input disabled={!canEdit} value={sequenceSchedule.timezone} onChange={(e) => setSequenceSchedule({ ...sequenceSchedule, timezone: e.target.value })} /></Field><Field label="Trigger condition"><Input disabled={!canEdit} placeholder={selectedSequence.triggerType === "manual" ? "Manual enrollment" : "e.g. stage = qualified"} value={sequenceSchedule.triggerConfig} onChange={(e) => setSequenceSchedule({ ...sequenceSchedule, triggerConfig: e.target.value })} /></Field><Field label="Quiet hours start"><Input disabled={!canEdit} type="time" value={sequenceSchedule.quietHoursStart} onChange={(e) => setSequenceSchedule({ ...sequenceSchedule, quietHoursStart: e.target.value })} /></Field><Field label="Quiet hours end"><Input disabled={!canEdit} type="time" value={sequenceSchedule.quietHoursEnd} onChange={(e) => setSequenceSchedule({ ...sequenceSchedule, quietHoursEnd: e.target.value })} /></Field></div>
              <Button disabled={!canEdit || (selectedSequence.triggerType !== "manual" && !sequenceSchedule.triggerConfig.trim())} className="mt-4 w-full bg-[#22c55e] text-white" onClick={() => updateSequence.mutate({ id: selectedSequence.id, data: sequenceSchedule }, { onSuccess: () => { refreshSequences(); notify("Sequence schedule saved"); }, onError: fail })}><Save size={14} className="mr-2" />Save schedule</Button>
            </Panel>
            <Panel className="p-5"><div className="flex items-center justify-between"><h2 className="font-display text-base font-extrabold">{editingStepId ? "Edit step" : "Add step"}</h2><Settings2 size={17} className="text-slate-400" /></div>
              <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); const data = stepData(); const done = () => { resetStep(); refreshSequences(); notify(editingStepId ? "Step updated" : "Step added"); }; if (editingStepId) updateStep.mutate({ id: editingStepId, data }, { onSuccess: done, onError: fail }); else createStep.mutate({ id: selectedSequence.id, data }, { onSuccess: done, onError: fail }); }}>
                <div className="grid grid-cols-2 gap-3"><Field label="Type"><select disabled={!canEdit} className="h-10 w-full rounded-lg border border-slate-200 px-3" value={stepForm.type} onChange={(e) => setStepForm({ ...stepForm, type: e.target.value as typeof stepForm.type })}><option value="message">Message</option><option value="wait">Wait</option><option value="ai">AI reply</option><option value="trigger">Trigger</option></select></Field><Field label="Channel"><select disabled={!canEdit} className="h-10 w-full rounded-lg border border-slate-200 px-3" value={stepForm.channel} onChange={(e) => setStepForm({ ...stepForm, channel: e.target.value as typeof stepForm.channel })}><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option></select></Field></div>
                <Field label="Step name"><Input disabled={!canEdit} required value={stepForm.title} onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })} /></Field>
                <Field label="Delay (minutes)"><Input disabled={!canEdit} type="number" min={0} max={525600} value={stepForm.delayMinutes} onChange={(e) => setStepForm({ ...stepForm, delayMinutes: Number(e.target.value) })} /></Field>
                <Field label="Message"><Textarea disabled={!canEdit} value={stepForm.message} onChange={(e) => setStepForm({ ...stepForm, message: e.target.value })} /></Field>
                <Field label="Quick replies (comma separated)"><Input disabled={!canEdit} value={stepForm.quickReplies} onChange={(e) => setStepForm({ ...stepForm, quickReplies: e.target.value })} /></Field>
                <Field label="If undelivered"><select disabled={!canEdit} className="h-10 w-full rounded-lg border border-slate-200 px-3" value={stepForm.fallbackAction} onChange={(e) => setStepForm({ ...stepForm, fallbackAction: e.target.value as typeof stepForm.fallbackAction })}><option value="retry">Retry</option><option value="skip">Skip step</option><option value="pause">Pause sequence</option></select></Field>
                <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs"><label className="flex items-center gap-2"><input disabled={!canEdit} type="checkbox" checked={stepForm.exitOnReply} onChange={(e) => setStepForm({ ...stepForm, exitOnReply: e.target.checked })} />Exit when lead replies</label><label className="flex items-center gap-2"><input disabled={!canEdit} type="checkbox" checked={stepForm.exitOnUnsubscribe} onChange={(e) => setStepForm({ ...stepForm, exitOnUnsubscribe: e.target.checked })} />Exit when lead unsubscribes</label></div>
                <div className="flex gap-2"><Button disabled={!canEdit} className="flex-1 bg-[#22c55e] text-white"><Save size={14} className="mr-2" />{editingStepId ? "Save step" : "Add step"}</Button>{editingStepId && <Button type="button" variant="outline" onClick={resetStep}>Cancel</Button>}</div>
              </form>
            </Panel>
            <Panel className="p-5"><h2 className="font-display text-base font-extrabold">Enroll a lead</h2><p className="mt-1 text-xs text-slate-500">Active sequences schedule a tenant-safe run.</p><select disabled={!canEdit} className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Choose a lead</option>{leadsQuery.data?.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.stage}</option>)}</select><Button disabled={!canEdit || !leadId || selectedSequence.status !== "active" || enroll.isPending} className="mt-3 w-full bg-slate-900 text-white" onClick={() => enroll.mutate({ id: selectedSequence.id, data: { leadId, idempotencyKey: `${selectedSequence.id}:${leadId}:${enrollmentKey}` } }, { onSuccess: () => { setLeadId(""); setEnrollmentKey(crypto.randomUUID()); refreshRuns(); notify("Lead enrolled"); }, onError: fail })}><Send size={14} className="mr-2" />Enroll lead</Button></Panel>
          </div>
        </div>}
        <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-display text-base font-extrabold">Sequence run history</h2><p className="text-xs text-slate-500">Scheduled work uses idempotency keys and explicit status controls.</p></div><Button size="sm" variant="outline" onClick={() => refreshRuns()}><RefreshCw size={13} className="mr-1" />Refresh</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Sequence</th><th>Lead</th><th>Status</th><th>Step</th><th>Next run</th><th className="pr-5">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{(runsQuery.data ?? []).map((run) => <tr key={run.id}><td className="px-5 py-3 font-semibold">{sequencesQuery.data?.find((sequence) => sequence.id === run.sequenceId)?.name ?? run.sequenceId.slice(0, 8)}</td><td>{leadsQuery.data?.find((lead) => lead.id === run.leadId)?.name ?? "—"}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 font-bold">{run.status}</span></td><td>{run.currentStep + 1}</td><td>{run.nextRunAt ? new Date(run.nextRunAt).toLocaleString() : "—"}</td><td className="pr-5"><div className="flex gap-2">{run.status !== "canceled" && <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => updateRun.mutate({ id: run.id, data: { status: run.status === "paused" ? "scheduled" : "paused" } }, { onSuccess: refreshRuns, onError: fail })}>{run.status === "paused" ? "Resume" : "Pause"}</Button>}<Button size="sm" variant="outline" disabled={!canEdit || run.status === "canceled"} onClick={() => updateRun.mutate({ id: run.id, data: { status: "canceled" } }, { onSuccess: refreshRuns, onError: fail })}>Cancel</Button></div></td></tr>)}{!runsQuery.data?.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No sequence runs yet.</td></tr>}</tbody></table></div></Panel>
      </div>}
      {busy && <div className="fixed bottom-5 right-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold shadow-xl"><Loader2 size={14} className="animate-spin text-green-600" />Saving changes…</div>}
    </div>
  </AppLayout>;
}