import { useState } from "react";
import {
  Check, ChevronRight, ExternalLink, Facebook, Instagram,
  MessageCircle, RefreshCw, ShieldCheck, Sparkles, Zap,
} from "lucide-react";

/* ─── Types ─── */
type ChannelId = "whatsapp" | "instagram" | "facebook";
type Status = "idle" | "connecting" | "connected" | "error";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cf2a7] text-[#0f172a] shadow-[0_6px_18px_rgba(140,242,167,.25)]">
        <Zap size={18} fill="currentColor" strokeWidth={2.5} />
      </div>
      <div className="text-[16px] font-bold tracking-tight text-white">
        Ai Botflow <span className="text-[#8cf2a7]">CRM</span>
      </div>
    </div>
  );
}

/* ─── Channel card data ─── */
const channels = [
  {
    id: "whatsapp" as ChannelId,
    icon: MessageCircle,
    name: "WhatsApp Business",
    desc: "Meta Business API se connect karein aur customers ko directly WhatsApp pe message karein.",
    color: "#25d366",
    bg: "bg-[#25d366]/10",
    border: "border-[#25d366]/30",
    iconColor: "text-[#25d366]",
    badge: "Most Popular",
    badgeColor: "bg-[#25d366]/15 text-[#25d366]",
    steps: [
      "Meta Business Manager kholein",
      "WhatsApp Business Account select karein",
      "Phone number verify karein",
    ],
    note: "✓ WABA API · ✓ Unlimited messages · ✓ Templates approved",
  },
  {
    id: "instagram" as ChannelId,
    icon: Instagram,
    name: "Instagram DM",
    desc: "Instagram Business account connect karein. DMs, story replies aur comments — sab ek jagah.",
    color: "#e1306c",
    bg: "bg-[#e1306c]/10",
    border: "border-[#e1306c]/30",
    iconColor: "text-[#e1306c]",
    badge: "Free",
    badgeColor: "bg-[#e1306c]/15 text-[#e1306c]",
    steps: [
      "Instagram Business account chahiye",
      "Facebook Page se linked hona chahiye",
      "Permissions allow karein",
    ],
    note: "✓ DMs Free · ✓ Story replies · ✓ Comment automation",
  },
  {
    id: "facebook" as ChannelId,
    icon: Facebook,
    name: "Facebook Page",
    desc: "Facebook Page ke messages aur comments automate karein. Leads directly CRM mein aayenge.",
    color: "#1877f2",
    bg: "bg-[#1877f2]/10",
    border: "border-[#1877f2]/30",
    iconColor: "text-[#1877f2]",
    badge: "Free",
    badgeColor: "bg-[#1877f2]/15 text-[#1877f2]",
    steps: [
      "Facebook Page admin access chahiye",
      "Messenger enable kiya ho",
      "App permissions allow karein",
    ],
    note: "✓ Page messages Free · ✓ Comment DM · ✓ Lead ads sync",
  },
];

/* ─── Single channel card ─── */
function ChannelCard({ ch, status, onConnect }: {
  ch: typeof channels[0];
  status: Status;
  onConnect: () => void;
}) {
  const Icon = ch.icon;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className={`relative rounded-2xl border-2 bg-white p-6 transition-all duration-300 ${
      isConnected
        ? "border-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,.08)]"
        : `${ch.border} hover:shadow-lg hover:-translate-y-0.5`
    }`}>
      {/* badge */}
      <span className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ch.badgeColor}`}>
        {ch.badge}
      </span>

      {/* header */}
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ch.bg} ${ch.iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-slate-900">{ch.name}</h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{ch.desc}</p>
        </div>
      </div>

      {/* steps */}
      <div className="mt-5 space-y-2.5">
        {ch.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              isConnected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {isConnected ? <Check size={11} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-[12px] ${isConnected ? "text-slate-400 line-through" : "text-slate-600"}`}>{step}</span>
          </div>
        ))}
      </div>

      {/* note */}
      <div className={`mt-4 rounded-xl px-3 py-2 text-[11px] font-medium ${ch.bg} ${ch.iconColor}`}>
        {ch.note}
      </div>

      {/* action */}
      <div className="mt-5">
        {isConnected ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-[13px] font-bold text-emerald-600">
            <Check size={15} strokeWidth={3} /> Connected ✓
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white transition ${
              isConnecting ? "opacity-70 cursor-wait" : "hover:opacity-90"
            }`}
            style={{ backgroundColor: ch.color }}
          >
            {isConnecting ? (
              <><RefreshCw size={15} className="animate-spin" /> Connecting...</>
            ) : (
              <><ExternalLink size={14} /> Connect {ch.name.split(" ")[0]}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Progress header ─── */
function ProgressBar({ connected }: { connected: number }) {
  const total = 3;
  const pct = Math.round((connected / total) * 100);
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="font-semibold text-slate-600">{connected}/{total} channels connected</span>
        <span className="font-bold text-[#22c55e]">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function OnboardingConnect() {
  const [statuses, setStatuses] = useState<Record<ChannelId, Status>>({
    whatsapp: "connected",
    instagram: "idle",
    facebook: "idle",
  });

  const connected = Object.values(statuses).filter(s => s === "connected").length;

  const handleConnect = (id: ChannelId) => {
    setStatuses(s => ({ ...s, [id]: "connecting" }));
    setTimeout(() => setStatuses(s => ({ ...s, [id]: "connected" })), 1800);
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      {/* top nav */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <Brand />
        <div className="flex items-center gap-3">
          <ShieldCheck size={15} className="text-emerald-500" />
          <span className="text-[12px] text-slate-500">Secure Meta OAuth 2.0</span>
          <div className="h-4 w-px bg-slate-200" />
          <button className="text-[12px] font-semibold text-slate-500 hover:text-slate-700">
            Skip karein →
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 py-12">
        {/* heading */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8cf2a7]/30 bg-[#8cf2a7]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-4">
            <Sparkles size={12} /> Step 2 of 3 — Channels Connect Karein
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900">
            Apne channels connect karein
          </h1>
          <p className="mt-2 text-[14px] text-slate-500 max-w-[480px] mx-auto">
            WhatsApp, Instagram aur Facebook — teeno ko ek baar mein connect karein.<br />
            Baad mein bhi kar sakte hain, koi baat nahi.
          </p>
        </div>

        {/* progress */}
        <ProgressBar connected={connected} />

        {/* cards grid */}
        <div className="grid gap-5 md:grid-cols-3">
          {channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              ch={ch}
              status={statuses[ch.id]}
              onConnect={() => handleConnect(ch.id)}
            />
          ))}
        </div>

        {/* info box */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-500" />
            <div>
              <div className="text-[13px] font-bold text-slate-900 mb-1">Secure aur Safe — Meta Official API</div>
              <p className="text-[12px] leading-relaxed text-slate-500">
                Hum sirf <strong>Meta Official API</strong> use karte hain. Aapka password kabhi nahi maangenge.
                Connect karte waqt Meta ka official login page khulega — wahan se approve karein, bas ho gaya.
                Aap kabhi bhi disconnect kar sakte hain.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <button className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
            ← Wapas jaayein
          </button>
          <button
            className={`flex h-11 items-center gap-2 rounded-xl px-8 text-[14px] font-bold text-white transition ${
              connected > 0
                ? "bg-[#22c55e] shadow-[0_4px_16px_rgba(34,197,94,.3)] hover:bg-[#16a34a]"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Dashboard pe jaayein <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
