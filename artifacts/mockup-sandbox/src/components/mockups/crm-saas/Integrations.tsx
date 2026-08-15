import { useState } from "react";
import Sidebar from "./_shared/Sidebar";
import {
  Check, ChevronRight, Copy, Eye, EyeOff, Globe, Key,
  Plus, RefreshCw, Search, Shield, Zap,
} from "lucide-react";

/* ─── API Keys ─── */
const apiKeys = [
  { id: "k1", name: "Production API Key", key: "abf_live_xK9mP2qR7nJ4vL8wE3tY6uI1oA5sD0hF", created: "Jan 10, 2025", lastUsed: "2 min ago", active: true },
  { id: "k2", name: "Staging API Key",    key: "abf_test_zX7cV4bN2mQ9wR6eT1yU5iO8pA3sL0kF", created: "Dec 28, 2024", lastUsed: "1 day ago",  active: true },
  { id: "k3", name: "Webhook Signing",    key: "whsec_k8P2xM7nR4vQ9wL3eT6yU1iO5pA0sD2hF", created: "Jan 1, 2025",  lastUsed: "5 min ago",  active: true },
];

/* ─── Automation platforms ─── */
const platforms = [
  {
    id: "zapier", name: "Zapier", logo: "⚡", color: "#ff4a00", bg: "bg-[#ff4a00]/10",
    desc: "5,000+ apps connect karein. New lead → Slack notify, Gmail send, CRM update.",
    connected: true, triggers: 12, zaps: 4,
    docs: "https://zapier.com",
  },
  {
    id: "make", name: "Make", logo: "🔄", color: "#6d00cc", bg: "bg-[#6d00cc]/10",
    desc: "Visual drag-drop automation builder. Complex multi-step flows asaani se banayein.",
    connected: false, triggers: 8, zaps: 0,
    docs: "https://make.com",
  },
  {
    id: "pabbly", name: "Pabbly Connect", logo: "🔗", color: "#00c4b3", bg: "bg-[#00c4b3]/10",
    desc: "Lifetime plan mein unlimited tasks — Indian businesses ke liye best value.",
    connected: false, triggers: 6, zaps: 0,
    docs: "https://pabbly.com",
  },
  {
    id: "n8n", name: "n8n (Self-hosted)", logo: "🤖", color: "#ea4b71", bg: "bg-[#ea4b71]/10",
    desc: "Open source automation — apne Hostinger VPS pe host karein. 100% control.",
    connected: false, triggers: 10, zaps: 0,
    docs: "https://n8n.io",
  },
];

/* ─── Available triggers / actions for REST ─── */
const endpoints = [
  { method: "POST",   path: "/api/leads",            desc: "Naya lead create karein" },
  { method: "GET",    path: "/api/leads",            desc: "Saare leads list karein" },
  { method: "GET",    path: "/api/leads/:id",        desc: "Specific lead dekhein" },
  { method: "PUT",    path: "/api/leads/:id/stage",  desc: "Lead stage update karein" },
  { method: "POST",   path: "/api/messages/send",    desc: "WhatsApp message bhejein" },
  { method: "POST",   path: "/api/contacts",         desc: "Naya contact banayein" },
  { method: "GET",    path: "/api/conversations",    desc: "Saari conversations" },
  { method: "POST",   path: "/api/campaigns/trigger",desc: "Campaign manually trigger" },
];

const methodColor: Record<string, string> = {
  GET:  "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT:  "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

/* ─── Webhook events ─── */
const events = [
  { event: "lead.created",          desc: "Naya lead bana",             enabled: true },
  { event: "lead.stage_changed",    desc: "Lead stage change hua",      enabled: true },
  { event: "message.received",      desc: "Customer ka message aaya",   enabled: true },
  { event: "message.sent",          desc: "Message bheja gaya",         enabled: false },
  { event: "campaign.completed",    desc: "Campaign finish hua",        enabled: true },
  { event: "contact.created",       desc: "Naya contact bana",         enabled: false },
  { event: "payment.received",      desc: "Payment receive hua",        enabled: true },
];

/* ─── Sub-components ─── */
function ApiKeyRow({ apiKey }: { apiKey: typeof apiKeys[0] }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const masked = apiKey.key.slice(0, 12) + "••••••••••••••••••••" + apiKey.key.slice(-4);

  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Key size={16} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-bold text-slate-800">{apiKey.name}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 truncate">
          {visible ? apiKey.key : masked}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] text-slate-400">Last used</div>
        <div className="text-[12px] font-semibold text-slate-600">{apiKey.lastUsed}</div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setVisible(!visible)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button onClick={copy} className={`rounded-lg p-2 transition ${copied ? "bg-emerald-100 text-emerald-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}

function PlatformCard({ p, onConnect }: { p: typeof platforms[0]; onConnect: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = () => { setLoading(true); setTimeout(() => { setLoading(false); onConnect(); }, 1600); };

  return (
    <div className={`rounded-2xl border-2 bg-white p-5 transition hover:shadow-md ${p.connected ? "border-emerald-400" : "border-slate-200"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px] ${p.bg}`}>{p.logo}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-slate-900">{p.name}</span>
            {p.connected && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Connected</span>}
          </div>
          {p.connected && (
            <div className="text-[11px] text-slate-400 mt-0.5">{p.zaps} automations active · {p.triggers} triggers available</div>
          )}
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-slate-500 mb-4">{p.desc}</p>
      <div className="flex items-center gap-2">
        {p.connected ? (
          <>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-600">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live & Syncing
            </div>
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">Manage</button>
          </>
        ) : (
          <button onClick={handle} disabled={loading} className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90" style={{ backgroundColor: p.color }}>
            {loading ? <><RefreshCw size={13} className="animate-spin" />Connecting...</> : <><Plus size={14} />Connect {p.name}</>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function Integrations() {
  const [tab, setTab] = useState<"api" | "platforms" | "webhooks" | "docs">("api");
  const [platformList, setPlatformList] = useState(platforms);
  const [webhookUrl, setWebhookUrl] = useState("https://hook.ai-botflowcrm.app/wh/acme/main");
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [eventList, setEventList] = useState(events);
  const [search, setSearch] = useState("");

  const toggleEvent = (idx: number) => {
    setEventList(prev => prev.map((e, i) => i === idx ? { ...e, enabled: !e.enabled } : e));
  };

  const connectPlatform = (id: string) => {
    setPlatformList(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  };

  const copyWebhook = () => { setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 1500); };

  const tabs = [
    { id: "api", label: "API Keys" },
    { id: "platforms", label: "Automation Platforms" },
    { id: "webhooks", label: "Webhooks" },
    { id: "docs", label: "REST API Docs" },
  ] as const;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f6f5]">
      <Sidebar active="integrations" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* topbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900">Integrations</h1>
            <p className="text-[12px] text-slate-500">API keys, webhooks aur automation platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-500" />
            <span className="text-[12px] text-slate-500">All connections encrypted · TLS 1.3</span>
          </div>
        </div>

        {/* tab bar */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition ${tab === t.id ? "border-[#22c55e] text-[#22c55e]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── API KEYS ── */}
          {tab === "api" && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">API Keys</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Apni website ya app se CRM ko API se connect karein</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#16a34a] transition">
                  <Plus size={15} /> New API Key
                </button>
              </div>

              {/* usage box */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Globe size={18} className="mt-0.5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-blue-800 mb-1">API kaise use karein?</div>
                    <code className="text-[11px] text-blue-700 bg-blue-100 rounded px-2 py-0.5">
                      Authorization: Bearer abf_live_YOUR_KEY
                    </code>
                    <div className="text-[11px] text-blue-600 mt-1.5">Base URL: <span className="font-mono">https://api.ai-botflowcrm.app/v1</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {apiKeys.map(k => <ApiKeyRow key={k.id} apiKey={k} />)}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-700">
                ⚠️ API keys ko secret rakho — publicly share mat karo. Agar compromise ho jaye toh immediately rotate karo.
              </div>
            </div>
          )}

          {/* ── PLATFORMS ── */}
          {tab === "platforms" && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Automation Platforms</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">No-code tools se CRM ko thousands of apps se connect karein</p>
              </div>

              {/* connected highlight */}
              {platformList.filter(p => p.connected).length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                  <Zap size={18} className="text-emerald-600" />
                  <div>
                    <div className="text-[13px] font-bold text-emerald-800">
                      {platformList.filter(p => p.connected).map(p => p.name).join(", ")} connected
                    </div>
                    <div className="text-[11px] text-emerald-600">Automations live hain — data real-time sync ho raha hai</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {platformList.map(p => <PlatformCard key={p.id} p={p} onConnect={() => connectPlatform(p.id)} />)}
              </div>
            </div>
          )}

          {/* ── WEBHOOKS ── */}
          {tab === "webhooks" && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Webhook Configuration</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Events ke liye real-time notifications apni URL pe receive karein</p>
              </div>

              {/* endpoint */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-[13px] font-bold text-slate-700 mb-3">Inbound Webhook URL (aapki website se data aayega)</div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Globe size={14} className="text-slate-400 shrink-0" />
                  <code className="flex-1 text-[12px] text-slate-700 truncate">{webhookUrl}</code>
                  <button onClick={copyWebhook} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${webhookCopied ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
                    {webhookCopied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                  </button>
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  Yeh URL apni website ke form action mein daalo — POST request se data seedha CRM mein aayega
                </div>
              </div>

              {/* outbound webhook */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[13px] font-bold text-slate-700">Outbound Webhook (CRM events aapko bhejega)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Apni endpoint URL daalo jahan events receive karne hain</div>
                  </div>
                </div>
                <input
                  defaultValue="https://yourapp.com/webhooks/crm"
                  className="mb-4 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-[12px] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition"
                />

                <div className="text-[12px] font-bold text-slate-600 mb-3">Events choose karein:</div>
                <div className="space-y-2">
                  {eventList.map((ev, i) => (
                    <div key={ev.event} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <div>
                        <code className="text-[12px] font-mono font-semibold text-slate-700">{ev.event}</code>
                        <div className="text-[11px] text-slate-400">{ev.desc}</div>
                      </div>
                      <button
                        onClick={() => toggleEvent(i)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${ev.enabled ? "bg-[#22c55e]" : "bg-slate-200"}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ev.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-4 h-10 w-full rounded-xl bg-[#22c55e] text-[13px] font-bold text-white hover:bg-[#16a34a] transition">
                  Save Webhook Settings
                </button>
              </div>
            </div>
          )}

          {/* ── REST API DOCS ── */}
          {tab === "docs" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">REST API Reference</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Base URL: <code className="font-mono text-[#22c55e]">https://api.ai-botflowcrm.app/v1</code></p>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Endpoint dhundein..." className="h-9 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" />
                </div>
              </div>

              {/* auth block */}
              <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Authentication</div>
                <pre className="text-[12px] text-emerald-400 font-mono leading-relaxed overflow-x-auto">{`curl -X GET https://api.ai-botflowcrm.app/v1/leads \\
  -H "Authorization: Bearer abf_live_YOUR_KEY" \\
  -H "Content-Type: application/json"`}</pre>
              </div>

              {/* endpoints list */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50">
                  <span className="text-[13px] font-bold text-slate-700">Available Endpoints</span>
                  <span className="text-[12px] text-slate-400">{endpoints.length} endpoints</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {endpoints.filter(e => e.path.includes(search) || e.desc.toLowerCase().includes(search.toLowerCase())).map((ep, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer group transition">
                      <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${methodColor[ep.method]}`}>
                        {ep.method}
                      </span>
                      <code className="flex-1 font-mono text-[13px] text-slate-700">{ep.path}</code>
                      <span className="text-[12px] text-slate-400">{ep.desc}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
                    </div>
                  ))}
                </div>
              </div>

              {/* example response */}
              <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Example Response — POST /api/leads</div>
                <pre className="text-[12px] font-mono leading-relaxed overflow-x-auto">{`{
  `}<span className="text-blue-400">"success"</span>{`: `}<span className="text-emerald-400">true</span>{`,
  `}<span className="text-blue-400">"lead"</span>{`: {
    `}<span className="text-blue-400">"id"</span>{`: `}<span className="text-yellow-300">"lead_xK9mP2qR"</span>{`,
    `}<span className="text-blue-400">"name"</span>{`: `}<span className="text-yellow-300">"Rahul Kumar"</span>{`,
    `}<span className="text-blue-400">"phone"</span>{`: `}<span className="text-yellow-300">"+91 98765 43210"</span>{`,
    `}<span className="text-blue-400">"stage"</span>{`: `}<span className="text-yellow-300">"New"</span>{`,
    `}<span className="text-blue-400">"source"</span>{`: `}<span className="text-yellow-300">"Website"</span>{`,
    `}<span className="text-blue-400">"whatsapp_sent"</span>{`: `}<span className="text-emerald-400">true</span>{`,
    `}<span className="text-blue-400">"created_at"</span>{`: `}<span className="text-yellow-300">"2025-01-15T10:42:00Z"</span>{`
  }
}`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
