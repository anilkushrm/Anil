import { Link } from "wouter";
import { useListLeads } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, GitMerge } from "lucide-react";

const stages = [
  { key: "new", label: "New", color: "border-blue-200 bg-blue-50", dot: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "border-yellow-200 bg-yellow-50", dot: "bg-yellow-500" },
  { key: "qualified", label: "Qualified", color: "border-violet-200 bg-violet-50", dot: "bg-violet-500" },
  { key: "proposal", label: "Proposal", color: "border-orange-200 bg-orange-50", dot: "bg-orange-500" },
  { key: "won", label: "Won", color: "border-green-200 bg-green-50", dot: "bg-green-500" },
  { key: "lost", label: "Lost", color: "border-red-200 bg-red-50", dot: "bg-red-500" },
];

export default function Pipeline() {
  const { data: leads = [], isLoading } = useListLeads({});
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">CRM / Pipeline</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">Pipeline</h1><p className="mt-1 text-sm text-slate-500">Move opportunities forward with a clear view of every stage.</p></div>
          <Link href="/leads" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-3 text-xs font-bold text-white transition hover:bg-[#16a34a]">Add or edit leads <ArrowUpRight size={14} /></Link>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#b8eac9] bg-[#effbf3] px-4 py-3 text-xs text-[#13783d]"><GitMerge size={16} /><span>Pipeline totals are live from your workspace lead records.</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage.key);
            return <section key={stage.key} className={`min-h-[250px] rounded-xl border p-3 ${stage.color}`}><div className="flex items-center justify-between px-1 py-1"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${stage.dot}`} /><h2 className="text-xs font-extrabold text-slate-700">{stage.label}</h2></div><span className="rounded-md bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-500">{stageLeads.length}</span></div><div className="mt-3 space-y-2">{isLoading ? <div className="rounded-lg border border-white/70 bg-white/60 p-4 text-xs text-slate-400">Loading...</div> : stageLeads.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300/70 bg-white/45 p-5 text-center text-xs text-slate-400">No leads in this stage</div> : stageLeads.map((lead) => <div key={lead.id} className="rounded-lg border border-white bg-white p-3 shadow-sm"><div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-bold text-slate-700">{lead.name}</p><Badge variant="outline" className="shrink-0 text-[9px]">{lead.source}</Badge></div><p className="mt-1 truncate text-[11px] text-slate-400">{lead.company || lead.email}</p><p className="mt-3 text-xs font-bold text-slate-700">₹{lead.value.toLocaleString()}</p></div>)}</div></section>;
          })}
        </div>
      </div>
    </AppLayout>
  );
}