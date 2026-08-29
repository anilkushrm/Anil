import { useLocation } from "wouter";
import { useListChannels } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, CheckCircle2, Facebook, Instagram, MessageCircle, ShieldCheck } from "lucide-react";

const details = {
  whatsapp: { label: "WhatsApp", description: "Send transactional, utility, and marketing conversations through WhatsApp Business.", Icon: MessageCircle, tone: "text-[#139447] bg-[#d9f7e4]" },
  instagram: { label: "Instagram", description: "Bring Instagram conversations into the shared team inbox.", Icon: Instagram, tone: "text-[#d94685] bg-[#fce1ef]" },
  facebook: { label: "Facebook", description: "Manage Facebook Page messages alongside every customer channel.", Icon: Facebook, tone: "text-[#3375d2] bg-[#deebff]" },
} as const;

export default function ChannelDetail() {
  const [location, setLocation] = useLocation();
  const type = location.split("/")[2] as keyof typeof details;
  const detail = details[type] || details.whatsapp;
  const { data: channels = [], isLoading } = useListChannels();
  const channel = channels.find((item) => item.type === type);
  const Icon = detail.Icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        <button onClick={() => setLocation("/channels")} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800"><ArrowLeft size={14} />Back to channels</button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${detail.tone}`}><Icon size={23} /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">Channels / Setup</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">{detail.label}</h1></div></div><Badge variant={channel?.status === "connected" ? "success" : "secondary"} className="w-fit capitalize">{channel?.status?.replace("_", " ") || "not configured"}</Badge></div>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Provider authorization required</p><p className="mt-1 text-xs leading-5">This is a real channel setup record, but live Meta OAuth, Embedded Signup, webhooks, and message delivery are not enabled yet.</p></div></div></section>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]"><section className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><h2 className="font-display font-bold text-slate-900">Connection details</h2><div className="mt-5 space-y-3">{[["Workspace channel", isLoading ? "Loading..." : channel?.name || detail.label], ["Delivery mode", channel?.mode || "Provider setup pending"], ["Account", channel?.accountName || "Not connected"], ["Last synced", channel?.lastSyncedAt ? new Date(channel.lastSyncedAt).toLocaleString() : "Not synced"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-slate-100 py-3 text-xs"><span className="font-semibold text-slate-500">{label}</span><span className="max-w-[60%] truncate text-right font-bold text-slate-700">{value}</span></div>)}</div><Button disabled className="mt-5 w-full rounded-xl bg-[#22c55e] text-xs font-bold text-white">Connect after Meta setup</Button></section><section className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><h2 className="font-display font-bold text-slate-900">Setup checklist</h2><div className="mt-4 space-y-3">{["Create or select a Meta Business account", "Complete provider authorization", "Verify inbound webhook", "Send a test conversation"].map((item, index) => <div key={item} className="flex items-start gap-3 text-xs"><div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-[#e5f7eb] text-[#159447]" : "bg-slate-100 text-slate-400"}`}>{index === 0 ? <CheckCircle2 size={13} /> : <ShieldCheck size={13} />}</div><span className="leading-5 text-slate-600">{item}</span></div>)}</div></section></div>
      </div>
    </AppLayout>
  );
}