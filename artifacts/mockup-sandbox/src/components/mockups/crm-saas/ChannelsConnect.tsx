import { useState } from "react";
import Sidebar from "./_shared/Sidebar";
import {
  AlertCircle, Check, CheckCircle2, ChevronDown, ChevronRight,
  Copy, ExternalLink, Facebook, Globe, Instagram, MessageCircle,
  Phone, RefreshCw, Shield, ShieldCheck, Sparkles,
  Unlink, Zap,
} from "lucide-react";

/* ─── Types ─── */
type WaStep = 1 | 2 | 3 | 4;
type ConnState = "connected" | "disconnected" | "connecting" | "error";

/* ─── WhatsApp Embedded Signup Panel ─── */
function WhatsAppPanel() {
  const [step, setStep] = useState<WaStep>(4); // 4 = already connected for mockup
  const [conn, setConn] = useState<ConnState>("connected");
  const [copied, setCopied] = useState(false);

  const wabaId   = "487291056384029";
  const phoneNum = "+91 98765 43210";
  const dispName = "Acme Corp";

  const copy = (txt: string) => { setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const reconnect = () => {
    setConn("connecting");
    setTimeout(() => { setConn("connected"); setStep(4); }, 2000);
  };

  const steps = [
    { n: 1, label: "Meta Account Login"       },
    { n: 2, label: "Business Portfolio Select" },
    { n: 3, label: "WhatsApp Number Verify"    },
    { n: 4, label: "API Permission Grant"      },
  ];

  return (
    <div className="rounded-2xl border-2 border-[#25d366]/40 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#25d366]/15 bg-[#25d366]/5 px-6 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25d366]/15 text-[#128c3f]">
          <MessageCircle size={26} fill="currentColor" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">WhatsApp Business API</h2>
            <span className="rounded-full bg-[#25d366] px-2.5 py-0.5 text-[10px] font-bold text-white">Official Meta API</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">Meta Embedded Signup se seedha connect karein — koi third-party nahi</p>
        </div>
        {conn === "connected" && (
          <div className="flex items-center gap-2 rounded-xl bg-[#25d366]/10 px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#25d366]" />
            <span className="text-[12px] font-bold text-[#128c3f]">Live & Connected</span>
          </div>
        )}
        {conn === "error" && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5">
            <AlertCircle size={13} className="text-red-500" />
            <span className="text-[12px] font-bold text-red-600">Connection Error</span>
          </div>
        )}
      </div>

      <div className="px-6 py-5">
        {conn === "connected" && step === 4 ? (
          // ── Connected State ──
          <div className="space-y-4">
            {/* Step progress - all done */}
            <div className="flex items-center gap-2 mb-2">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25d366] text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {i < steps.length - 1 && <div className="h-px w-8 bg-[#25d366]" />}
                </div>
              ))}
              <span className="ml-2 text-[11px] font-bold text-[#128c3f]">Setup Complete ✓</span>
            </div>

            {/* Account details */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Business Display Name", val: dispName },
                { label: "WhatsApp Number",       val: phoneNum },
                { label: "WABA ID",               val: wabaId   },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-slate-800 truncate">{val}</span>
                    <button onClick={() => copy(val)} className={`shrink-0 rounded-lg p-1.5 transition ${copied ? "bg-emerald-100 text-emerald-600" : "text-slate-400 hover:bg-slate-200"}`}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Limits & quality */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Tier",              val: "Tier 2",   sub: "10k msgs/day",   color: "text-blue-600 bg-blue-50"   },
                { label: "Quality Rating",    val: "High ●",   sub: "Green status",   color: "text-emerald-600 bg-emerald-50" },
                { label: "Templates",         val: "18 / 250", sub: "Approved",       color: "text-purple-600 bg-purple-50" },
                { label: "Phone Verified",    val: "✓ Verified", sub: "+91 987...",   color: "text-[#128c3f] bg-[#25d366]/10" },
              ].map(({ label, val, sub, color }) => (
                <div key={label} className={`rounded-xl p-3 ${color.split(" ")[1]}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div>
                  <div className={`text-[13px] font-bold ${color.split(" ")[0]}`}>{val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* Webhook */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Webhook Callback URL (Meta configured)</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] text-slate-600 truncate">
                  https://api.ai-botflowcrm.app/webhooks/whatsapp/acme
                </code>
                <button onClick={() => copy("url")} className="rounded-xl bg-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-300 transition">Copy</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={reconnect} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition">
                <RefreshCw size={13} /> Reconnect
              </button>
              <button onClick={() => setConn("disconnected")} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition">
                <Unlink size={13} /> Disconnect
              </button>
              <a href="#" className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold text-[#25d366] hover:underline">
                Meta Business Suite <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : conn === "connecting" ? (
          // ── Connecting ──
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25d366]/10">
              <RefreshCw size={28} className="animate-spin text-[#25d366]" />
            </div>
            <div className="text-center">
              <div className="text-[15px] font-bold text-slate-800">Meta se connect ho raha hai...</div>
              <div className="text-[12px] text-slate-500 mt-1">Permissions verify ho rahi hain. Thodi wait karein.</div>
            </div>
          </div>
        ) : (
          // ── Disconnected / Setup ──
          <div className="space-y-5">
            {/* Step indicators */}
            <div className="flex items-start gap-0">
              {steps.map((s, i) => (
                <div key={s.n} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex items-center w-full">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold z-10 mx-auto ${
                      step > s.n ? "bg-[#25d366] text-white" : step === s.n ? "bg-[#25d366] text-white ring-4 ring-[#25d366]/20" : "border-2 border-slate-200 bg-white text-slate-400"
                    }`}>
                      {step > s.n ? <Check size={13} strokeWidth={3} /> : s.n}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${step > s.n ? "bg-[#25d366]" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <span className={`text-center text-[10px] font-semibold ${step >= s.n ? "text-[#128c3f]" : "text-slate-400"}`}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Embedded Signup Box */}
            <div className="rounded-2xl border-2 border-dashed border-[#25d366]/30 bg-[#25d366]/3 p-6 text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[#25d366]/15 mb-3">
                <MessageCircle size={28} className="text-[#128c3f]" fill="currentColor" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">Meta Embedded Signup</h3>
              <p className="text-[12px] text-slate-500 mb-4 max-w-sm mx-auto">
                Meta ka official popup khulega — apna Facebook account se login karein aur WhatsApp Business number select karein. Koi app install nahi karna.
              </p>
              <button
                onClick={() => { setConn("connecting"); setTimeout(() => { setConn("connected"); setStep(4); }, 2200); }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,.35)] hover:bg-[#1ea856] transition"
              >
                <Zap size={16} fill="white" />
                WhatsApp Connect Karein
              </button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck size={12} className="text-emerald-500" />
                Meta Official API · Aapka password nahi chahiye · TLS Encrypted
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Instagram Panel ─── */
function InstagramPanel() {
  const [conn, setConn] = useState<ConnState>("connected");

  const accounts = [
    { name: "@acmecorp_official", followers: "12.4K", type: "Business", img: "AC" },
  ];

  return (
    <div className="rounded-2xl border-2 border-[#e1306c]/30 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#e1306c]/15 bg-gradient-to-r from-[#f9dbea]/40 to-[#fce7e7]/20 px-6 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f09433] via-[#e1306c] to-[#833ab4] text-white">
          <Instagram size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">Instagram DM</h2>
            <span className="rounded-full bg-gradient-to-r from-[#f09433] to-[#e1306c] px-2.5 py-0.5 text-[10px] font-bold text-white">Free</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">DMs, story replies, comment automation — sab ek jagah</p>
        </div>
        {conn === "connected" && (
          <div className="flex items-center gap-2 rounded-xl bg-[#e1306c]/10 px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#e1306c]" />
            <span className="text-[12px] font-bold text-[#e1306c]">Connected</span>
          </div>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        {conn === "connected" ? (
          <>
            {/* Connected accounts */}
            {accounts.map(a => (
              <div key={a.name} className="flex items-center gap-3 rounded-xl border border-[#e1306c]/20 bg-[#e1306c]/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e1306c] to-[#833ab4] text-white text-[12px] font-bold">
                  {a.img}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-slate-900">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.followers} followers · {a.type} Account</div>
                </div>
                <CheckCircle2 size={18} className="text-[#e1306c]" fill="#fce7e7" />
              </div>
            ))}

            {/* Permissions */}
            <div className="grid grid-cols-3 gap-2">
              {["DMs & Replies", "Story Mentions", "Comment DM"].map(p => (
                <div key={p} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                  <Check size={12} className="text-emerald-500" strokeWidth={3} /> {p}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "DMs This Month", val: "843" },
                { label: "Auto-replied",   val: "621" },
                { label: "Leads Created",  val: "94"  },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                  <div className="text-[20px] font-bold text-slate-900">{val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition">
                <RefreshCw size={13} /> Reconnect
              </button>
              <button onClick={() => setConn("disconnected")} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition">
                <Unlink size={13} /> Disconnect
              </button>
              <span className="ml-auto text-[11px] text-slate-400">⚠ Requires Instagram Business + FB Page link</span>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
              Instagram Business account aur Facebook Page ka linked hona zaroori hai. Meta OAuth se ek click mein connect hoga.
            </p>
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => { setConn("connecting"); setTimeout(() => setConn("connected"), 1800); }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#e1306c] to-[#833ab4] px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(225,48,108,.3)] hover:opacity-90 transition"
              >
                <Instagram size={16} /> Instagram Connect Karein
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                Meta OAuth 2.0 · Password nahi chahiye
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Facebook Panel ─── */
function FacebookPanel() {
  const [conn, setConn] = useState<ConnState>("disconnected");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-[#1877f2]/30 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#1877f2]/15 bg-[#1877f2]/5 px-6 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1877f2] text-white">
          <Facebook size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">Facebook Page</h2>
            <span className="rounded-full bg-[#1877f2]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#1877f2]">Free</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">Messenger, comments, lead ads — sab CRM mein auto-sync</p>
        </div>
        {conn !== "connected" && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="text-[12px] font-semibold text-slate-500">Not Connected</span>
          </div>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        {conn === "connected" ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-[#1877f2]/20 bg-[#1877f2]/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white text-[12px] font-bold">AC</div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-slate-900">Acme Corp Official</div>
                <div className="text-[11px] text-slate-500">8,200 followers · Business Page · Messenger ON</div>
              </div>
              <CheckCircle2 size={18} className="text-[#1877f2]" fill="#deebff" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Messenger DMs", "Comment Auto-DM", "Lead Ads Sync"].map(p => (
                <div key={p} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                  <Check size={12} className="text-emerald-500" strokeWidth={3} /> {p}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition">
                <RefreshCw size={13} /> Reconnect
              </button>
              <button onClick={() => setConn("disconnected")} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition">
                <Unlink size={13} /> Disconnect
              </button>
            </div>
          </>
        ) : conn === "connecting" ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <RefreshCw size={26} className="animate-spin text-[#1877f2]" />
            <div className="text-[13px] font-semibold text-slate-600">Facebook se connect ho raha hai...</div>
          </div>
        ) : (
          <>
            {/* Requirements */}
            <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-[12px] font-semibold text-amber-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} /> Connect karne se pehle — requirements
              </div>
              <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 space-y-2 -mt-2">
                {[
                  "Facebook Page Admin access hona chahiye",
                  "Page pe Messenger enabled hona chahiye",
                  "Business Manager mein Page linked hona chahiye",
                ].map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-amber-700">
                    <ChevronRight size={13} className="mt-0.5 shrink-0" /> {req}
                  </div>
                ))}
              </div>
            )}

            <div className="text-center py-4 space-y-3">
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
                Facebook Page select karein aur Messenger permissions allow karein. Lead Ads ka data bhi automatically sync hoga.
              </p>
              <button
                onClick={() => { setConn("connecting"); setTimeout(() => setConn("connected"), 1800); }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(24,119,242,.3)] hover:bg-[#1464d8] transition"
              >
                <Facebook size={16} /> Facebook Connect Karein
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck size={12} className="text-emerald-500" />
                Meta OAuth 2.0 · Password nahi chahiye
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Status Bar ─── */
function StatusBar() {
  const channels = [
    { name: "WhatsApp", color: "bg-[#25d366]", status: "Connected", icon: "W" },
    { name: "Instagram", color: "bg-gradient-to-r from-[#f09433] to-[#e1306c]", status: "Connected", icon: "IG" },
    { name: "Facebook", color: "bg-[#1877f2]", status: "Not Connected", icon: "f" },
  ];
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
        <Globe size={15} /> Channel Status:
      </div>
      {channels.map(c => (
        <div key={c.name} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white ${c.color}`}>{c.icon}</div>
          <span className="text-[12px] font-semibold text-slate-700">{c.name}</span>
          <span className={`text-[10px] font-bold ${c.status === "Connected" ? "text-emerald-600" : "text-slate-400"}`}>
            {c.status === "Connected" ? "● Connected" : "○ Not Connected"}
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck size={13} className="text-emerald-500" />
        All secure · Meta Official APIs only
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function ChannelsConnect() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f6f5]">
      <Sidebar active="whatsapp" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900">Channels Setup</h1>
            <p className="text-[12px] text-slate-500">WhatsApp · Instagram · Facebook — sab ek jagah connect karein</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-[12px] font-bold text-emerald-700">2 / 3 channels active</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <StatusBar />
          <div className="space-y-5">
            <WhatsAppPanel />
            <div className="grid grid-cols-2 gap-5">
              <InstagramPanel />
              <FacebookPanel />
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
            <Shield size={18} className="mt-0.5 text-blue-500 shrink-0" />
            <div className="text-[12px] leading-relaxed text-blue-700">
              <strong>100% Secure:</strong> Hum sirf Meta ke official APIs use karte hain. Kisi bhi channel ka password ya secret key kabhi nahi maangenge.
              Connect karte waqt Meta ka official login page hi khulega — koi third-party redirect nahi. Kabhi bhi disconnect kar sakte hain.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
