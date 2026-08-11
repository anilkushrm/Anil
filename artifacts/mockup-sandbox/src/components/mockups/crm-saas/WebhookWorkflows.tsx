import { useState } from "react";
import { Sidebar } from "./_shared/Sidebar";
import {
  Webhook, Plus, Play, RefreshCw, Trash2, ChevronRight, CheckCircle2,
  XCircle, Clock, Zap, ArrowRight, Copy, Eye, EyeOff, AlertCircle,
  MoreHorizontal, Globe, Filter, Tag, MessageSquare, Mail, PhoneCall,
  UserPlus, BarChart2, Bell, ChevronDown, Search, Edit3,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type Status = "active" | "inactive" | "error";
type LogStatus = "success" | "failed" | "pending";

interface Endpoint {
  id: string;
  name: string;
  source: string;
  url: string;
  status: Status;
  events: number;
  lastTriggered: string;
  secret: string;
}

interface WorkflowAction {
  id: string;
  icon: typeof UserPlus;
  label: string;
  detail: string;
  color: string;
}

interface Workflow {
  id: string;
  trigger: string;
  condition: string;
  actions: WorkflowAction[];
  enabled: boolean;
  runs: number;
}

interface EventLog {
  id: string;
  endpoint: string;
  event: string;
  status: LogStatus;
  time: string;
  duration: string;
  payload: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const ENDPOINTS: Endpoint[] = [
  { id: "e1", name: "Lead Form – Website", source: "Website", url: "https://hook.ai-botflowcrm.app/wh/acme/lead-form", status: "active", events: 847, lastTriggered: "2 min ago", secret: "whsec_acme_lf_2025" },
  { id: "e2", name: "Shopify Orders", source: "Shopify", url: "https://hook.ai-botflowcrm.app/wh/acme/shopify", status: "active", events: 1204, lastTriggered: "14 min ago", secret: "whsec_acme_sh_2025" },
  { id: "e3", name: "Facebook Lead Ads", source: "Meta", url: "https://hook.ai-botflowcrm.app/wh/acme/fb-leads", status: "active", events: 391, lastTriggered: "1 hr ago", secret: "whsec_acme_fb_2025" },
  { id: "e4", name: "Custom CRM Sync", source: "Internal", url: "https://hook.ai-botflowcrm.app/wh/acme/crm-sync", status: "error", events: 34, lastTriggered: "3 days ago", secret: "whsec_acme_cs_2025" },
  { id: "e5", name: "Typeform Responses", source: "Typeform", url: "https://hook.ai-botflowcrm.app/wh/acme/typeform", status: "inactive", events: 0, lastTriggered: "Never", secret: "whsec_acme_tf_2025" },
];

const WORKFLOWS: Workflow[] = [
  {
    id: "w1", trigger: "Lead Form – Website", condition: "utm_source contains 'google'",
    actions: [
      { id: "a1", icon: UserPlus, label: "Create Lead", detail: "Pipeline: New Leads · Tag: google-ads", color: "bg-blue-50 text-blue-600" },
      { id: "a2", icon: MessageSquare, label: "Send WhatsApp", detail: "Template: welcome_lead_v2", color: "bg-green-50 text-green-600" },
      { id: "a3", icon: Bell, label: "Notify Agent", detail: "Assigned to: Sales Team Round-robin", color: "bg-purple-50 text-purple-600" },
    ],
    enabled: true, runs: 612,
  },
  {
    id: "w2", trigger: "Shopify Orders", condition: "order_value ≥ ₹5,000",
    actions: [
      { id: "a4", icon: Tag, label: "Add Tag", detail: "Tags: high-value, shopify-buyer", color: "bg-orange-50 text-orange-600" },
      { id: "a5", icon: MessageSquare, label: "Send WhatsApp", detail: "Template: order_confirmation_v1", color: "bg-green-50 text-green-600" },
    ],
    enabled: true, runs: 889,
  },
  {
    id: "w3", trigger: "Facebook Lead Ads", condition: "All events",
    actions: [
      { id: "a6", icon: UserPlus, label: "Create Contact", detail: "Source: facebook-ads · Stage: New", color: "bg-blue-50 text-blue-600" },
      { id: "a7", icon: Zap, label: "Trigger AI Sequence", detail: "Sequence: fb-nurture-7day", color: "bg-yellow-50 text-yellow-600" },
    ],
    enabled: true, runs: 391,
  },
  {
    id: "w4", trigger: "Custom CRM Sync", condition: "contact_status = 'qualified'",
    actions: [
      { id: "a8", icon: BarChart2, label: "Move Pipeline Stage", detail: "Stage: Qualified → Proposal", color: "bg-indigo-50 text-indigo-600" },
      { id: "a9", icon: Mail, label: "Send Email", detail: "Template: proposal-ready", color: "bg-pink-50 text-pink-600" },
    ],
    enabled: false, runs: 12,
  },
];

const LOGS: EventLog[] = [
  { id: "l1", endpoint: "Lead Form – Website", event: "form.submitted", status: "success", time: "2 min ago", duration: "142ms", payload: '{\n  "name": "Rahul Sharma",\n  "phone": "+91 99887 76655",\n  "email": "rahul@example.com",\n  "utm_source": "google",\n  "utm_campaign": "summer_sale"\n}' },
  { id: "l2", endpoint: "Shopify Orders", event: "order.created", status: "success", time: "14 min ago", duration: "98ms", payload: '{\n  "order_id": "SH-48291",\n  "customer": "Priya Mehta",\n  "order_value": 6400,\n  "items": 3,\n  "currency": "INR"\n}' },
  { id: "l3", endpoint: "Lead Form – Website", event: "form.submitted", status: "success", time: "28 min ago", duration: "131ms", payload: '{\n  "name": "Ankit Patel",\n  "phone": "+91 98765 43210",\n  "email": "ankit@co.in",\n  "utm_source": "facebook"\n}' },
  { id: "l4", endpoint: "Custom CRM Sync", event: "contact.updated", status: "failed", time: "3 days ago", duration: "5,001ms", payload: '{\n  "contact_id": "c_7823",\n  "status": "qualified",\n  "error": "Timeout after 5s"\n}' },
  { id: "l5", endpoint: "Facebook Lead Ads", event: "lead.created", status: "success", time: "1 hr ago", duration: "207ms", payload: '{\n  "lead_id": "fb_lead_9912",\n  "name": "Sunita Roy",\n  "phone": "+91 88776 65544",\n  "ad_id": "23850917391"\n}' },
  { id: "l6", endpoint: "Shopify Orders", event: "order.created", status: "pending", time: "Just now", duration: "—", payload: '{\n  "order_id": "SH-48319",\n  "customer": "Manish Kumar",\n  "order_value": 2200\n}' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  if (status === "active") return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Active</span>;
  if (status === "error") return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Error</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Inactive</span>;
}

function LogBadge({ status }: { status: LogStatus }) {
  if (status === "success") return <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={13} /><span className="text-[11px] font-bold">200 OK</span></span>;
  if (status === "failed") return <span className="flex items-center gap-1 text-red-500"><XCircle size={13} /><span className="text-[11px] font-bold">Timeout</span></span>;
  return <span className="flex items-center gap-1 text-amber-500"><Clock size={13} /><span className="text-[11px] font-bold">Pending</span></span>;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-[#22c55e]" : "bg-slate-200"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Panels ─────────────────────────────────────────────────────────────────

function EndpointPanel({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Webhook Endpoints</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{ENDPOINTS.filter(e => e.status === "active").length} active · {ENDPOINTS.length} total</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-green-200 hover:bg-[#16a34a]">
          <Plus size={13} /> New Endpoint
        </button>
      </div>
      <div className="divide-y divide-slate-50 overflow-y-auto">
        {ENDPOINTS.map(ep => (
          <button
            key={ep.id}
            onClick={() => onSelect(ep.id)}
            className={`w-full px-5 py-3.5 text-left transition hover:bg-slate-50 ${selected === ep.id ? "bg-[#f0fdf4] border-l-2 border-[#22c55e]" : "border-l-2 border-transparent"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-slate-800 truncate">{ep.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={ep.status} />
                  <span className="text-[10px] text-slate-400">{ep.source}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] font-bold text-slate-600">{ep.events.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">events</div>
              </div>
            </div>
            <div className="mt-2 truncate rounded bg-slate-100 px-2 py-0.5 font-mono text-[9px] text-slate-500">{ep.url}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkflowPanel({ endpointId, workflows, onToggle }: { endpointId: string; workflows: Workflow[]; onToggle: (id: string) => void }) {
  const ep = ENDPOINTS.find(e => e.id === endpointId)!;
  const epWorkflows = workflows.filter(w => w.trigger === ep.name);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Endpoint header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d9f7e4] text-[#159447]"><Webhook size={16} /></div>
              <h2 className="text-[15px] font-bold text-slate-800">{ep.name}</h2>
              <StatusBadge status={ep.status} />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Last triggered: <span className="font-semibold text-slate-600">{ep.lastTriggered}</span> · <span className="font-semibold text-slate-600">{ep.events.toLocaleString()} total events</span></p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"><Play size={12} /> Test</button>
            <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"><Edit3 size={12} /> Edit</button>
          </div>
        </div>
        {/* URL + Secret */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
            <Globe size={13} className="text-slate-400 shrink-0" />
            <span className="flex-1 truncate font-mono text-[11px] text-slate-600">{ep.url}</span>
            <button className="shrink-0 text-slate-400 hover:text-slate-600"><Copy size={13} /></button>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secret</span>
            <span className="flex-1 font-mono text-[11px] text-slate-600">{showSecret ? ep.secret : "whsec_••••••••••••"}</span>
            <button className="shrink-0 text-slate-400 hover:text-slate-600" onClick={() => setShowSecret(s => !s)}>{showSecret ? <EyeOff size={13} /> : <Eye size={13} />}</button>
            <button className="shrink-0 text-slate-400 hover:text-slate-600"><Copy size={13} /></button>
          </div>
        </div>
        {ep.status === "error" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-[11px] text-red-600">
            <AlertCircle size={14} className="shrink-0" />
            Last 3 deliveries failed. Webhook paused. <button className="ml-auto font-bold underline">Retry now</button>
          </div>
        )}
      </div>

      {/* Workflows */}
      <div className="flex-1 px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[12px] font-bold text-slate-700">Automation Workflows ({epWorkflows.length})</h3>
          <button className="flex items-center gap-1 rounded-lg bg-[#f0fdf4] border border-green-100 px-3 py-1.5 text-[11px] font-bold text-[#16a34a] hover:bg-[#dcfce7]"><Plus size={12} /> Add Workflow</button>
        </div>

        {epWorkflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
            <Zap size={28} className="mb-3 text-slate-300" />
            <p className="text-[13px] font-semibold text-slate-400">No workflows yet</p>
            <p className="mt-1 text-[11px] text-slate-400">Add a workflow to automate actions when this webhook fires.</p>
            <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-2 text-[12px] font-bold text-white"><Plus size={13} /> Create Workflow</button>
          </div>
        ) : (
          <div className="space-y-3">
            {epWorkflows.map(wf => (
              <div key={wf.id} className={`rounded-2xl border ${wf.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"} shadow-[0_1px_3px_rgba(15,23,42,.04)]`}>
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#22c55e]"><Zap size={13} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-slate-800">When: <span className="font-normal text-slate-500">{wf.condition}</span></div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400">{wf.runs} runs</span>
                    <Toggle enabled={wf.enabled} onChange={() => onToggle(wf.id)} />
                    <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={15} /></button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {wf.actions.map((action, idx) => (
                      <div key={action.id} className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1.5 rounded-lg border border-slate-100 px-2.5 py-1.5 ${action.color}`}>
                          <action.icon size={12} />
                          <span className="text-[11px] font-semibold">{action.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{action.detail}</span>
                        {idx < wf.actions.length - 1 && <ArrowRight size={12} className="text-slate-300 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogsPanel({ endpointId }: { endpointId: string }) {
  const ep = ENDPOINTS.find(e => e.id === endpointId)!;
  const logs = LOGS.filter(l => l.endpoint === ep.name);
  const [expanded, setExpanded] = useState<string | null>(logs[0]?.id ?? null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-[12px] font-bold text-slate-800">Event Logs</h3>
          <p className="mt-0.5 text-[10px] text-slate-400">Last 30 days · {logs.length} events shown</p>
        </div>
        <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50"><RefreshCw size={12} /> Refresh</button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <Clock size={24} className="mb-2" />
            <p className="text-[12px]">No events yet for this endpoint.</p>
          </div>
        ) : logs.map(log => (
          <div key={log.id} className="px-5">
            <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} className="flex w-full items-center gap-3 py-3 text-left">
              <LogBadge status={log.status} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-mono text-[11px] font-semibold text-slate-700">{log.event}</div>
                <div className="text-[10px] text-slate-400">{log.time} · {log.duration}</div>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${expanded === log.id ? "rotate-180" : ""}`} />
            </button>
            {expanded === log.id && (
              <div className="mb-3 rounded-xl bg-[#0f172a] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payload</span>
                  <button className="text-slate-500 hover:text-slate-300"><Copy size={12} /></button>
                </div>
                <pre className="font-mono text-[11px] leading-relaxed text-[#86efac] whitespace-pre-wrap">{log.payload}</pre>
                {log.status === "failed" && (
                  <button className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/15">
                    <RefreshCw size={11} /> Retry delivery
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WebhookWorkflows() {
  const [selectedEp, setSelectedEp] = useState("e1");
  const [tab, setTab] = useState<"workflows" | "logs">("workflows");
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  const toggleWorkflow = (id: string) => {
    setWorkflows(ws => ws.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans">
      <Sidebar active="Settings" />
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex h-[60px] items-center justify-between border-b border-slate-200 bg-white px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Settings</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-800">Webhook Workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <Search size={13} className="text-slate-400" />
              <input className="bg-transparent text-[12px] outline-none placeholder:text-slate-400 w-40" placeholder="Search endpoints…" />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"><Filter size={12} /> Filter</button>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Col 1: Endpoints list */}
          <div className="w-[270px] shrink-0 border-r border-slate-200 bg-white overflow-hidden flex flex-col">
            <EndpointPanel selected={selectedEp} onSelect={(id) => { setSelectedEp(id); setTab("workflows"); }} />
          </div>

          {/* Col 2: Workflows / Logs */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white">
            {/* Tab switcher */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-6">
              {(["workflows", "logs"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-1 py-3 mr-6 text-[12px] font-bold border-b-2 transition-colors capitalize ${tab === t ? "border-[#22c55e] text-[#16a34a]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  {t === "workflows" ? <><Zap size={13} /> Automation Workflows</> : <><Clock size={13} /> Event Logs</>}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {tab === "workflows"
                ? <WorkflowPanel endpointId={selectedEp} workflows={workflows} onToggle={toggleWorkflow} />
                : <LogsPanel endpointId={selectedEp} />
              }
            </div>
          </div>

          {/* Col 3: Stats sidebar */}
          <div className="w-[220px] shrink-0 overflow-y-auto bg-white px-4 py-5">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Overview</h3>
            {[
              { label: "Total Endpoints", value: ENDPOINTS.length.toString(), sub: `${ENDPOINTS.filter(e => e.status === "active").length} active` },
              { label: "Events Today", value: "312", sub: "+18% vs yesterday" },
              { label: "Success Rate", value: "99.1%", sub: "Last 7 days" },
              { label: "Avg Response", value: "161ms", sub: "P95: 340ms" },
              { label: "Failed Events", value: "7", sub: "Needs retry" },
            ].map(stat => (
              <div key={stat.label} className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-[10px] text-slate-500">{stat.label}</div>
                <div className="mt-1 text-[20px] font-bold text-slate-800">{stat.value}</div>
                <div className="text-[10px] text-slate-400">{stat.sub}</div>
              </div>
            ))}

            <h3 className="mb-3 mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Events / 24h</h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-4">
              <svg viewBox="0 0 160 60" className="w-full overflow-visible">
                <defs>
                  <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const data = [12, 18, 9, 24, 30, 22, 35, 28, 40, 32, 45, 38, 42, 50, 44, 55, 48, 52, 60, 47, 53, 58, 50, 55];
                  const max = Math.max(...data);
                  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 160},${60 - (v / max) * 52}`).join(" ");
                  const area = `M 0,60 L ${pts.split(" ").map((p, i, a) => i === 0 ? `0,${p.split(",")[1]}` : p).join(" L ")} L 160,60 Z`;
                  return <>
                    <path d={area} fill="url(#spark)" />
                    <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </>;
                })()}
              </svg>
              <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                <span>12h ago</span><span>Now</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <h4 className="text-[10px] font-bold text-slate-500 mb-2">Quick Actions</h4>
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100"><Plus size={12} /> Add Endpoint</button>
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100"><RefreshCw size={12} /> Retry Failed</button>
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100"><Trash2 size={12} /> Clear Old Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
