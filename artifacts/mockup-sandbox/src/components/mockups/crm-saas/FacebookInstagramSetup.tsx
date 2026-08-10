import { useState } from "react";
import { Sidebar } from "./_shared/Sidebar";
import {
  ChevronRight, CheckCircle2, Circle, AlertCircle, RefreshCw,
  MessageSquare, Users, Bell, Zap, Shield, Link2, X, ChevronDown,
  Instagram, Facebook, Globe, ArrowRight, Plus, Inbox,
  ToggleLeft, Settings, ExternalLink, Phone, Image, ThumbsUp,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ConnectState = "idle" | "connecting" | "connected" | "error";

interface FBPage {
  id: string;
  name: string;
  category: string;
  followers: string;
  connected: boolean;
}

interface IGAccount {
  id: string;
  handle: string;
  name: string;
  followers: string;
  connected: boolean;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const FB_PAGES: FBPage[] = [
  { id: "p1", name: "Acme Corp Official", category: "Business", followers: "12.4K", connected: true },
  { id: "p2", name: "Acme Sales & Deals", category: "Retail", followers: "3.1K", connected: false },
];

const IG_ACCOUNTS: IGAccount[] = [
  { id: "i1", handle: "@acmecorp", name: "Acme Corp", followers: "8.9K", connected: true },
  { id: "i2", handle: "@acmedeals", name: "Acme Deals", followers: "2.2K", connected: false },
];

const PERMISSIONS = [
  { label: "pages_messaging", desc: "Send & receive Facebook Page messages", granted: true },
  { label: "pages_read_engagement", desc: "Read comments and post engagement", granted: true },
  { label: "instagram_basic", desc: "Access Instagram account info", granted: true },
  { label: "instagram_manage_messages", desc: "Send & receive Instagram DMs", granted: true },
  { label: "leads_retrieval", desc: "Retrieve Facebook Lead Ad submissions", granted: true },
  { label: "pages_manage_posts", desc: "Publish posts on connected pages", granted: false },
];

const ROUTING_AGENTS = ["Round-robin", "Sales Team", "Support Team", "Specific Agent"];
const RESPONSE_MODES = ["Manual only", "AI + Manual", "AI Auto-reply"];

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-[#22c55e]" : "bg-slate-200"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Channel Status Card ─────────────────────────────────────────────────────

function ChannelCard({
  icon, title, subtitle, state, onConnect, onDisconnect,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  state: ConnectState;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className={`rounded-2xl border p-5 transition-all ${state === "connected" ? "border-green-200 bg-[#f0fdf4]" : state === "error" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
            {state === "connected" && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Connected</span>}
            {state === "error" && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600"><AlertCircle size={10} />Error</span>}
            {state === "idle" && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Not connected</span>}
          </div>
          <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>
        </div>
        <div className="shrink-0 flex gap-2">
          {state === "connected" ? (
            <>
              <button onClick={onDisconnect} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"><RefreshCw size={12} />Reconnect</button>
              <button onClick={onDisconnect} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50"><X size={12} />Disconnect</button>
            </>
          ) : (
            <button onClick={onConnect} className="flex items-center gap-1.5 rounded-lg bg-[#0f172a] px-4 py-1.5 text-[11px] font-bold text-white hover:bg-[#1e293b]">
              <Link2 size={12} />{state === "connecting" ? "Connecting…" : "Connect via Meta"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FacebookInstagramSetup() {
  const [fbState, setFbState] = useState<ConnectState>("connected");
  const [igState, setIgState] = useState<ConnectState>("connected");
  const [fbPages, setFbPages] = useState(FB_PAGES);
  const [igAccounts, setIgAccounts] = useState(IG_ACCOUNTS);
  const [permOpen, setPermOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "facebook" | "instagram">("overview");

  // routing & automation settings
  const [fbRouting, setFbRouting] = useState("Round-robin");
  const [igRouting, setIgRouting] = useState("Sales Team");
  const [fbMode, setFbMode] = useState("AI + Manual");
  const [igMode, setIgMode] = useState("AI + Manual");
  const [settings, setSettings] = useState({
    fbCommentReply: true,
    fbLeadCapture: true,
    fbReadReceipts: false,
    igStoryMention: true,
    igCommentReply: true,
    igAutoTag: true,
  });
  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const toggleFbPage = (id: string) => setFbPages(ps => ps.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  const toggleIgAccount = (id: string) => setIgAccounts(as => as.map(a => a.id === id ? { ...a, connected: !a.connected } : a));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans">
      <Sidebar active="Settings" />
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Settings</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-800">Facebook & Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] hover:underline"><ExternalLink size={12} />Meta Business Suite</a>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"><RefreshCw size={12} />Sync</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-[200px] shrink-0 border-r border-slate-200 bg-white px-3 py-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Channels</p>
            {([
              ["overview", Globe, "Overview"],
              ["facebook", Facebook, "Facebook"],
              ["instagram", Instagram, "Instagram"],
            ] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition ${activeTab === key ? "bg-[#f0fdf4] text-[#16a34a]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <Icon size={14} />
                {label}
                {key === "facebook" && fbState === "connected" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />}
                {key === "instagram" && igState === "connected" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />}
              </button>
            ))}

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Meta App</p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[10px] text-slate-500">App ID</div>
                <div className="mt-0.5 font-mono text-[11px] font-semibold text-slate-700">485920384756</div>
                <div className="mt-2 text-[10px] text-slate-500">Business ID</div>
                <div className="mt-0.5 font-mono text-[11px] font-semibold text-slate-700">112847392</div>
                <div className="mt-3">
                  <button
                    onClick={() => setPermOpen(o => !o)}
                    className="flex w-full items-center justify-between text-[10px] font-bold text-slate-500 hover:text-slate-700"
                  >
                    Permissions <ChevronDown size={11} className={`transition-transform ${permOpen ? "rotate-180" : ""}`} />
                  </button>
                  {permOpen && (
                    <div className="mt-2 space-y-1.5">
                      {PERMISSIONS.map(p => (
                        <div key={p.label} className="flex items-start gap-1.5">
                          {p.granted
                            ? <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-green-500" />
                            : <Circle size={11} className="mt-0.5 shrink-0 text-slate-300" />}
                          <span className={`font-mono text-[9px] leading-tight ${p.granted ? "text-slate-600" : "text-slate-400"}`}>{p.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-8 py-7">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h1 className="text-[20px] font-bold text-slate-900">Facebook & Instagram Channels</h1>
                  <p className="mt-1 text-[13px] text-slate-500">Connect your Meta accounts to receive messages, comments, and leads directly inside Connectly CRM.</p>
                </div>

                {/* Channel status cards */}
                <div className="space-y-3">
                  <ChannelCard
                    icon={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1877f2] text-white shadow"><Facebook size={22} /></div>}
                    title="Facebook Pages"
                    subtitle="Receive DMs, comments, and Lead Ad submissions from your Facebook Pages."
                    state={fbState}
                    onConnect={() => setFbState("connecting")}
                    onDisconnect={() => setFbState("idle")}
                  />
                  <ChannelCard
                    icon={<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow"><Instagram size={22} /></div>}
                    title="Instagram Business"
                    subtitle="Receive DMs, story mentions, and comment replies from your Instagram Business account."
                    state={igState}
                    onConnect={() => setIgState("connecting")}
                    onDisconnect={() => setIgState("idle")}
                  />
                </div>

                {/* What you can do */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-4 text-[13px] font-bold text-slate-800">What Connectly handles for you</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      [MessageSquare, "Unified Inbox", "All FB + IG messages in one place alongside WhatsApp"],
                      [Zap, "AI Auto-reply", "AI responds to DMs instantly using your trained knowledge base"],
                      [Users, "Lead Capture", "Facebook Lead Ads auto-create contacts in your pipeline"],
                      [Bell, "Comment Replies", "Reply to post comments directly from Connectly"],
                      [Phone, "Contact Sync", "Customers from FB/IG auto-synced into your Contacts"],
                      [Image, "Story Mentions", "Get notified when customers mention you in stories"],
                    ].map(([Icon, title, desc]) => (
                      <div key={title as string} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e9f8ee] text-[#16a34a]"><Icon size={15} /></div>
                        <div><div className="text-[12px] font-bold text-slate-700">{title as string}</div><div className="mt-0.5 text-[11px] text-slate-500">{desc as string}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── FACEBOOK TAB ── */}
            {activeTab === "facebook" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877f2] text-white"><Facebook size={20} /></div>
                    <div>
                      <h1 className="text-[18px] font-bold text-slate-900">Facebook Pages</h1>
                      <p className="text-[12px] text-slate-500">Manage connected pages and automation settings</p>
                    </div>
                  </div>
                </div>

                {/* Pages list */}
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-[13px] font-bold text-slate-800">Your Facebook Pages</h3>
                    <button className="flex items-center gap-1.5 rounded-lg bg-[#1877f2] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#166fe5]"><Plus size={12} /> Add Page</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {fbPages.map(page => (
                      <div key={page.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f0fd] text-[#1877f2] font-bold text-sm">{page.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-slate-800">{page.name}</div>
                          <div className="text-[11px] text-slate-400">{page.category} · {page.followers} followers</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {page.connected
                            ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Active</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Inactive</span>}
                          <Toggle enabled={page.connected} onChange={() => toggleFbPage(page.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Routing */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 text-[13px] font-bold text-slate-800">Message Routing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Assign messages to</label>
                      <div className="flex flex-col gap-1">
                        {ROUTING_AGENTS.map(opt => (
                          <button key={opt} onClick={() => setFbRouting(opt)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${fbRouting === opt ? "bg-[#f0fdf4] text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"}`}>
                            {fbRouting === opt ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <Circle size={14} className="text-slate-300" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Response mode</label>
                      <div className="flex flex-col gap-1">
                        {RESPONSE_MODES.map(opt => (
                          <button key={opt} onClick={() => setFbMode(opt)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${fbMode === opt ? "bg-[#f0fdf4] text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"}`}>
                            {fbMode === opt ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <Circle size={14} className="text-slate-300" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation toggles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 text-[13px] font-bold text-slate-800">Facebook Automation</h3>
                  <div className="space-y-3">
                    {([
                      ["fbCommentReply", ThumbsUp, "Comment Reply", "Auto-reply to post comments using AI"],
                      ["fbLeadCapture", Users, "Lead Ad Capture", "Auto-create contacts from Facebook Lead Ads"],
                      ["fbReadReceipts", Bell, "Read Receipts", "Send read receipts when agents open messages"],
                    ] as const).map(([key, Icon, title, desc]) => (
                      <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e7f0fd] text-[#1877f2]"><Icon size={15} /></div>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-slate-700">{title}</div>
                          <div className="text-[11px] text-slate-400">{desc}</div>
                        </div>
                        <Toggle enabled={settings[key]} onChange={() => toggle(key)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── INSTAGRAM TAB ── */}
            {activeTab === "instagram" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white"><Instagram size={20} /></div>
                    <div>
                      <h1 className="text-[18px] font-bold text-slate-900">Instagram Business</h1>
                      <p className="text-[12px] text-slate-500">Manage connected accounts and DM automation settings</p>
                    </div>
                  </div>
                </div>

                {/* Accounts list */}
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-[13px] font-bold text-slate-800">Connected Instagram Accounts</h3>
                    <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f58529] to-[#dd2a7b] px-3 py-1.5 text-[11px] font-bold text-white"><Plus size={12} /> Add Account</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {igAccounts.map(acc => (
                      <div key={acc.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fde68a] via-[#fb923c] to-[#c026d3] text-white font-bold text-sm">{acc.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-800">{acc.handle}</span>
                            <span className="text-[11px] text-slate-400">· {acc.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{acc.followers} followers</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {acc.connected
                            ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Active</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Inactive</span>}
                          <Toggle enabled={acc.connected} onChange={() => toggleIgAccount(acc.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 px-5 py-3">
                    <p className="text-[11px] text-slate-400">⚠️ Instagram must be a <b>Business or Creator</b> account linked to a Facebook Page to enable messaging.</p>
                  </div>
                </div>

                {/* Routing */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 text-[13px] font-bold text-slate-800">Message Routing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Assign DMs to</label>
                      <div className="flex flex-col gap-1">
                        {ROUTING_AGENTS.map(opt => (
                          <button key={opt} onClick={() => setIgRouting(opt)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${igRouting === opt ? "bg-[#f0fdf4] text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"}`}>
                            {igRouting === opt ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <Circle size={14} className="text-slate-300" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Response mode</label>
                      <div className="flex flex-col gap-1">
                        {RESPONSE_MODES.map(opt => (
                          <button key={opt} onClick={() => setIgMode(opt)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${igMode === opt ? "bg-[#f0fdf4] text-[#16a34a]" : "text-slate-600 hover:bg-slate-50"}`}>
                            {igMode === opt ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <Circle size={14} className="text-slate-300" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation toggles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 text-[13px] font-bold text-slate-800">Instagram Automation</h3>
                  <div className="space-y-3">
                    {([
                      ["igStoryMention", Image, "Story Mention Reply", "Auto-reply when a customer mentions you in their story"],
                      ["igCommentReply", MessageSquare, "Comment Auto-reply", "Reply to comments on your posts using AI"],
                      ["igAutoTag", Tag, "Auto-tag Contacts", "Tag contacts with 'instagram' source when they DM you"],
                    ] as const).map(([key, Icon, title, desc]) => (
                      <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fde68a] to-[#f472b6] text-white"><Icon size={15} /></div>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-slate-700">{title}</div>
                          <div className="text-[11px] text-slate-400">{desc}</div>
                        </div>
                        <Toggle enabled={settings[key]} onChange={() => toggle(key)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
