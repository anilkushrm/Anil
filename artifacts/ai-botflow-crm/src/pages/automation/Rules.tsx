import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, SlidersHorizontal, Zap } from "lucide-react";

export default function Rules() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">Automation / Rules</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">Rules</h1><p className="mt-1 text-sm text-slate-500">Define routing and handoff logic for your communication workspace.</p></div><Button disabled className="rounded-xl bg-[#22c55e] text-xs font-bold text-white"><Plus size={14} className="mr-2" />Create rule</Button></div>
        <section className="rounded-xl border border-slate-200 bg-white p-6 panel-shadow"><div className="flex flex-col items-center justify-center py-8 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f1ff] text-blue-600"><SlidersHorizontal size={23} /></div><h2 className="mt-4 font-display text-lg font-extrabold text-slate-900">Rules workspace ready</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Rule persistence and conditional routing are not connected to an API yet. Your existing live-ready automation flows are available now.</p><Link href="/flows" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#159447] hover:underline">Open flows <ArrowUpRight size={14} /></Link></div></section>
        <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-[#b8eac9] bg-[#effbf3] p-5"><div className="flex items-center gap-2 text-sm font-bold text-[#13783d]"><Zap size={16} /> Available now</div><p className="mt-2 text-xs leading-5 text-slate-500">Keyword, new-lead, and webhook triggers can be saved from Automation Flows.</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-bold text-slate-700">No active rules</p><p className="mt-2 text-xs leading-5 text-slate-500">When the rules API is enabled, conditions and actions will appear here.</p></div></div>
      </div>
    </AppLayout>
  );
}