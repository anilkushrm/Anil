import { useState } from "react";
import { Link } from "wouter";
import { useListLeads } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Contacts() {
  const [search, setSearch] = useState("");
  const { data: leads = [], isLoading } = useListLeads({ search });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#159447]">CRM / People</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900">Contacts</h1>
            <p className="mt-1 text-sm text-slate-500">Every person connected to your lead pipeline, in one view.</p>
          </div>
          <Link href="/leads" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-3 text-xs font-bold text-white transition hover:bg-[#16a34a]">
            Manage leads <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">Total contacts</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{leads.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">With company</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{leads.filter((lead) => lead.company).length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 panel-shadow"><p className="text-xs font-semibold text-slate-500">Active pipeline</p><p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{leads.filter((lead) => !["won", "lost"].includes(lead.stage)).length}</p></div>
        </div>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white panel-shadow">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div><h2 className="font-display font-bold text-slate-900">Contact directory</h2><p className="mt-1 text-xs text-slate-500">Synced from your tenant-scoped lead records.</p></div>
            <div className="relative w-56 max-w-[48%]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input aria-label="Search contacts" placeholder="Search contacts..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-9 text-xs" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-y border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3 font-bold">Contact</th><th className="px-5 py-3 font-bold">Company</th><th className="px-5 py-3 font-bold">Reach</th><th className="px-5 py-3 font-bold">Stage</th><th className="px-5 py-3 font-bold text-right">Updated</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-400">Loading contacts...</td></tr> : leads.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center"><Users className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-600">No contacts yet</p><p className="mt-1 text-xs text-slate-400">Create a lead and it will appear here.</p></td></tr> : leads.map((lead) => <tr key={lead.id} className="border-b border-slate-50 text-xs transition hover:bg-slate-50/70"><td className="px-5 py-3"><p className="font-bold text-slate-700">{lead.name}</p><p className="mt-0.5 text-[11px] text-slate-400">{lead.email}</p></td><td className="px-5 text-slate-500">{lead.company || "—"}</td><td className="px-5 text-slate-500">{lead.phone}</td><td className="px-5"><Badge variant={lead.stage === "won" ? "success" : lead.stage === "lost" ? "destructive" : "secondary"} className="capitalize">{lead.stage}</Badge></td><td className="px-5 text-right text-slate-400">{formatDate(lead.updatedAt)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}