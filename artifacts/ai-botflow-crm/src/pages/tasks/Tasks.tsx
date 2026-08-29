import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock3, Plus, Sparkles } from "lucide-react";

export default function Tasks() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">CRM / Work queue</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">Tasks & follow-ups</h1><p className="mt-1 text-sm text-slate-500">Keep the next action visible for every customer conversation.</p></div><Button disabled className="rounded-xl bg-[#22c55e] text-xs font-bold text-white hover:bg-[#16a34a]"><Plus size={14} className="mr-2" />Create task</Button></div>
        <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">Open tasks</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">0</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">Due today</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">0</p></div><div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">Completed this week</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">0</p></div></div>
        <section className="rounded-xl border border-slate-200 bg-white p-5 panel-shadow"><div className="flex items-center justify-between"><div><h2 className="font-display font-bold text-slate-900">Your work queue</h2><p className="mt-1 text-xs text-slate-500">Task persistence will appear here when task endpoints are connected.</p></div><Clock3 size={18} className="text-slate-300" /></div><div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center"><CheckSquare size={28} className="text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No tasks assigned</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">Lead management is ready in the meantime. Open Leads to create records and move them through the pipeline.</p><Link href="/leads" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#159447] hover:underline">Open leads <Plus size={13} /></Link></div></section>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500"><Sparkles size={15} className="text-[#159447]" />This workspace is ready for follow-up automation when task scheduling is enabled.</div>
      </div>
    </AppLayout>
  );
}