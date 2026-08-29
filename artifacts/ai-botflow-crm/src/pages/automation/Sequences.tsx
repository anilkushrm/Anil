import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, GitBranch, Plus, Repeat2 } from "lucide-react";

export default function Sequences() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">Automation / Sequences</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">Sequences</h1><p className="mt-1 text-sm text-slate-500">Plan multi-step follow-up journeys for leads and contacts.</p></div><Button disabled className="rounded-xl bg-[#22c55e] text-xs font-bold text-white"><Plus size={14} className="mr-2" />Create sequence</Button></div>
        <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><Repeat2 className="h-5 w-5 text-[#159447]" /><p className="mt-4 text-xs font-semibold text-slate-500">Active sequences</p><p className="mt-1 font-display text-2xl font-extrabold text-slate-900">0</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><GitBranch className="h-5 w-5 text-violet-500" /><p className="mt-4 text-xs font-semibold text-slate-500">Steps configured</p><p className="mt-1 font-display text-2xl font-extrabold text-slate-900">0</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><ArrowUpRight className="h-5 w-5 text-blue-500" /><p className="mt-4 text-xs font-semibold text-slate-500">Replies generated</p><p className="mt-1 font-display text-2xl font-extrabold text-slate-900">0</p></div></div>
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center panel-shadow"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f7eb] text-[#159447]"><Repeat2 size={23} /></div><h2 className="mt-4 font-display text-lg font-extrabold text-slate-900">No sequences yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Use Automation Flows for the currently supported keyword, new-lead, and webhook triggers. Sequence scheduling is ready for a future automation endpoint.</p><Link href="/flows" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#159447] hover:underline">Open automation flows <ArrowUpRight size={14} /></Link></section>
      </div>
    </AppLayout>
  );
}