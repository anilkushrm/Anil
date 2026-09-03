import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListFlowsQueryKey, useCreateFlow, useListFlows, useUpdateFlow, type Flow,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Bot, Check, Clock3, GitBranch, MessageCircle, Pause, Play, Plus, Save,
  Search, Send, Settings2, Sparkles, Tag, UserRound, Zap, ZoomIn, ZoomOut,
} from "lucide-react";

const triggerLabels = { keyword: "Keyword detected", new_lead: "New lead created", webhook: "Webhook received" } as const;

function BuilderNode({ icon: Icon, title, detail, tone, selected }: { icon: typeof Bot; title: string; detail: string; tone: string; selected?: boolean }) {
  return <div className={`relative z-10 w-60 rounded-xl border bg-[#172238] p-4 text-left shadow-xl shadow-slate-950/30 ${tone} ${selected ? "ring-2 ring-green-300 ring-offset-2 ring-offset-[#0e1728]" : ""}`}><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white"><Icon size={15} /></span><p className="text-xs font-bold text-slate-100">{title}</p></div><p className="mt-2 text-[11px] leading-5 text-slate-400">{detail}</p></div>;
}

export default function Flows() {
  const { data: flows = [], isLoading } = useListFlows();
  const createFlow = useCreateFlow();
  const updateFlow = useUpdateFlow();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("Welcome & Qualify Lead");
  const [triggerType, setTriggerType] = useState<"keyword" | "new_lead" | "webhook">("keyword");
  const [actionText, setActionText] = useState("Send a helpful response and assign a sales owner.");
  const [zoom, setZoom] = useState(100);
  const [notice, setNotice] = useState("");
  const selected = useMemo(() => flows.find((flow) => flow.id === selectedId), [flows, selectedId]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListFlowsQueryKey() });
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  useEffect(() => {
    if (!selected && flows[0]) setSelectedId(flows[0].id);
  }, [flows, selected]);
  useEffect(() => {
    if (!selected) return;
    setName(selected.name);
    setTriggerType(selected.triggerType);
    setActionText(selected.actionText);
  }, [selected]);

  const save = () => {
    const onSuccess = (flow?: Flow) => { if (flow) setSelectedId(flow.id); refresh(); flash(selected ? "Flow saved" : "Flow created"); };
    if (selected) updateFlow.mutate({ id: selected.id, data: { name, triggerType, actionText } }, { onSuccess });
    else createFlow.mutate({ data: { name, triggerType, actionText } }, { onSuccess });
  };

  return (
    <AppLayout title="Chatbot Flow Builder" subtitle="Design automated customer journeys with live workspace flows.">
      <div className="grid min-h-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white panel-shadow lg:grid-cols-[240px_minmax(480px,1fr)_300px]">
        <aside className="border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r">
          <button onClick={() => { setSelectedId(""); setName("Untitled Flow"); setTriggerType("keyword"); setActionText(""); }} className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] text-xs font-bold text-white"><Plus size={14} /> New Flow</button>
          <label className="mt-4 flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400"><Search size={13} /><input className="w-full bg-transparent text-xs outline-none" placeholder="Search flows" /></label>
          <div className="mt-4 space-y-2">
            {flows.map((flow) => <button key={flow.id} onClick={() => setSelectedId(flow.id)} className={`w-full rounded-xl border p-3 text-left transition ${flow.id === selectedId ? "border-green-300 bg-green-50" : "border-transparent hover:bg-slate-50"}`}><div className="flex items-center justify-between"><p className="truncate text-xs font-extrabold text-slate-700">{flow.name}</p><span className={`h-2 w-2 rounded-full ${flow.status === "active" ? "bg-green-500" : flow.status === "paused" ? "bg-amber-400" : "bg-slate-300"}`} /></div><p className="mt-1 truncate text-[10px] text-slate-400">{triggerLabels[flow.triggerType]}</p></button>)}
            {!isLoading && !flows.length && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400">No flows yet. Create your first automation.</p>}
          </div>
        </aside>

        <section className="relative min-h-[720px] overflow-auto bg-[#0e1728]">
          <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-white/10 bg-[#111c30]/95 px-4 backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300"><GitBranch size={14} className="text-green-400" />{name}</div>
            <div className="flex items-center gap-1"><button onClick={() => setZoom(Math.max(75, zoom - 10))} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10"><ZoomOut size={14} /></button><span className="w-10 text-center text-[10px] text-slate-500">{zoom}%</span><button onClick={() => setZoom(Math.min(125, zoom + 10))} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10"><ZoomIn size={14} /></button></div>
          </div>
          <div className="absolute inset-0 top-12 opacity-20" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="relative mx-auto flex min-h-[670px] w-[620px] origin-top flex-col items-center gap-8 py-10 transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
            <BuilderNode icon={Zap} title="Start Trigger" detail={triggerLabels[triggerType]} tone="border-green-400/50" />
            <div className="h-8 w-px bg-green-400" />
            <BuilderNode icon={GitBranch} title="Check condition" detail={triggerType === "keyword" ? "Match configured keyword and workspace context" : "Validate tenant-safe event context"} tone="border-amber-400/40" />
            <div className="h-8 w-px bg-green-400" />
            <BuilderNode icon={MessageCircle} title="Send message" detail={actionText || "Configure the reply or action in the settings panel."} tone="border-blue-400/40" selected />
            <div className="h-8 w-px bg-green-400" />
            <div className="grid grid-cols-2 gap-8"><BuilderNode icon={Tag} title="Update CRM" detail="Apply configured lead tags and routing." tone="border-violet-400/40" /><BuilderNode icon={UserRound} title="Human handoff" detail="Assign the conversation when needed." tone="border-cyan-400/40" /></div>
            <div className="h-8 w-px bg-green-400" />
            <BuilderNode icon={Check} title="End flow" detail="Automation completed and activity recorded." tone="border-slate-500" />
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="font-display text-sm font-extrabold text-slate-900">Flow settings</h2><p className="mt-1 text-[10px] text-green-600">Message node selected</p></div><Settings2 size={16} className="text-slate-400" /></div>
          <div className="space-y-4 pt-4">
            <label className="block text-[11px] font-bold text-slate-600">Flow name<input minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-green-400" /></label>
            <label className="block text-[11px] font-bold text-slate-600">Trigger<select value={triggerType} onChange={(event) => setTriggerType(event.target.value as typeof triggerType)} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none"><option value="keyword">Keyword</option><option value="new_lead">New lead</option><option value="webhook">Webhook</option></select></label>
            <label className="block text-[11px] font-bold text-slate-600">Reply / action<textarea maxLength={2000} value={actionText} onChange={(event) => setActionText(event.target.value)} className="mt-2 min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 outline-none focus:border-green-400" /></label>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[10px] leading-5 text-slate-500"><Sparkles size={13} className="mr-1 inline text-violet-500" />Live provider delivery starts after channel authorization. Flow configuration is saved now.</div>
            <button onClick={save} disabled={!name.trim() || !actionText.trim() || createFlow.isPending || updateFlow.isPending} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] text-xs font-bold text-white disabled:opacity-50"><Save size={14} />{selected ? "Save Flow" : "Create Flow"}</button>
            {selected && <button onClick={() => updateFlow.mutate({ id: selected.id, data: { status: selected.status === "active" ? "paused" : "active" } }, { onSuccess: () => { refresh(); flash(selected.status === "active" ? "Flow paused" : "Flow activated"); } })} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">{selected.status === "active" ? <Pause size={14} /> : <Play size={14} />}{selected.status === "active" ? "Pause Flow" : "Activate Flow"}</button>}
          </div>
        </aside>
      </div>
      {notice && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17233a] px-4 py-3 text-xs font-bold text-white shadow-xl"><Check size={14} className="text-green-300" />{notice}</div>}
    </AppLayout>
  );
}