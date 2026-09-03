import { useState } from "react";
import { useGetBilling } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ArrowDownLeft, ArrowUpRight, Bot, CheckCircle2, CreditCard, Download,
  Infinity as InfinityIcon, MessageCircle, Plus, ShieldCheck, Sparkles, Users, Wallet, X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const planNames: Record<string, { name: string; price: string }> = {
  starter: { name: "Starter", price: "₹499/month" },
  growth: { name: "Growth", price: "₹999/month" },
  pro: { name: "Pro", price: "₹2,499/month" },
  enterprise: { name: "Enterprise", price: "Custom plan" },
};

export default function Billing() {
  const { data: billing, isLoading } = useGetBilling();
  const [showTopup, setShowTopup] = useState(false);
  const plan = planNames[billing?.plan ?? "starter"] ?? planNames.starter;
  const balance = billing?.walletBalance ?? 0;
  const transactions = billing?.transactions ?? [];

  return (
    <AppLayout title="Billing & Wallet" subtitle="Manage your plan and monitor messaging credits.">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-green-600" /> Secure workspace billing in INR
          </div>
          <button onClick={() => setShowTopup(true)} className="flex h-9 items-center gap-2 rounded-xl bg-[#22c55e] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#16a34a]">
            <Plus size={14} /> Wallet Topup
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101a2d] to-[#1e3a5f] p-6 text-white xl:col-span-2">
            <InfinityIcon size={180} className="absolute -right-9 -top-12 opacity-[.06]" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Current plan</p>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="font-display text-3xl font-extrabold">{plan.name}</h2>
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-[10px] font-bold text-green-300">Active</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{plan.price} · Workspace billing</p>
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10">Change Plan</button>
            </div>
            <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
              {[
                [MessageCircle, "WA Messages", "Usage based"],
                [Bot, "AI Auto-Reply", "Included"],
                [Users, "Team Members", "Plan based"],
              ].map(([Icon, label, value]) => (
                <div key={label as string} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Icon size={15} className="mb-2 text-green-300" />
                  <p className="text-[10px] text-slate-400">{label as string}</p>
                  <p className="mt-1 text-xs font-bold">{value as string}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 panel-shadow">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">WA Credit Wallet</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600"><Wallet size={17} /></span>
            </div>
            <p className="mt-5 font-display text-3xl font-extrabold text-slate-900">{isLoading ? "—" : `₹${balance.toFixed(2)}`}</p>
            <p className="mt-1 text-[11px] text-slate-400">Available messaging balance</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[42%] rounded-full bg-[#22c55e]" /></div>
            <button onClick={() => setShowTopup(true)} className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-xs font-bold text-green-700 transition hover:bg-green-100"><Plus size={14} /> Add credits</button>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 panel-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-sm font-extrabold text-slate-900">This month&apos;s usage</h2><p className="mt-1 text-[11px] text-slate-400">Live workspace channel pricing</p></div>
            <span className="rounded-xl border border-green-100 bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700">Instagram & Facebook are free</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["WhatsApp marketing", `₹${(billing?.pricing.marketing ?? 0.92).toFixed(2)}`, "per message", "bg-green-500"],
              ["Utility / auth", `₹${(billing?.pricing.utilityAuthentication ?? 0.12).toFixed(2)}`, "per message", "bg-blue-500"],
              ["Instagram", "Free", "social messaging", "bg-fuchsia-500"],
              ["Facebook", "Free", "social messaging", "bg-indigo-500"],
            ].map(([label, value, detail, color]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><p className="text-[11px] font-bold text-slate-600">{label}</p></div>
                <p className="mt-3 text-xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white panel-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-display text-sm font-extrabold text-slate-900">Transaction history</h2><p className="mt-1 text-[11px] text-slate-400">Wallet activity and plan charges</p></div>
            <button className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-500"><Download size={13} /> Export</button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const credit = transaction.amount >= 0;
              const Icon = credit ? ArrowDownLeft : ArrowUpRight;
              return (
                <div key={transaction.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${credit ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}><Icon size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold capitalize text-slate-700">{transaction.type.replaceAll("_", " ")}</p><p className="mt-1 text-[10px] text-slate-400">{transaction.reference || "Wallet transaction"} · {formatDate(transaction.createdAt)}</p></div>
                  <p className={`text-sm font-extrabold ${credit ? "text-green-600" : "text-slate-700"}`}>{credit ? "+" : "−"}₹{Math.abs(transaction.amount).toFixed(2)}</p>
                  <span className="hidden items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600 sm:flex"><CheckCircle2 size={11} /> Success</span>
                </div>
              );
            })}
            {!transactions.length && <div className="flex flex-col items-center px-5 py-12 text-center"><CreditCard size={24} className="text-slate-300" /><p className="mt-3 text-xs font-bold text-slate-600">No transactions yet</p><p className="mt-1 text-[11px] text-slate-400">Your wallet activity will appear here.</p></div>}
          </div>
        </section>
      </div>

      {showTopup && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Wallet topup">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-green-600">Wallet Topup</p><h2 className="mt-1 font-display text-xl font-extrabold text-slate-900">Add WhatsApp credits</h2></div><button onClick={() => setShowTopup(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><X size={15} /></button></div>
          <div className="mt-5 grid grid-cols-3 gap-2">{[500, 1000, 2500].map((amount) => <button key={amount} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-extrabold text-slate-700 hover:border-green-400 hover:bg-green-50">₹{amount.toLocaleString()}</button>)}</div>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800"><Sparkles size={14} className="mr-1 inline" />Payment processing will activate after the payment provider is connected. No charge will be made now.</div>
          <button disabled className="mt-4 h-11 w-full rounded-xl bg-slate-200 text-sm font-bold text-slate-500">Payment provider not connected</button>
        </div>
      </div>}
    </AppLayout>
  );
}