import { useState } from "react";
import { Sidebar } from "./_shared/Sidebar";
import {
  Zap, CreditCard, Plus, ArrowDownLeft, ArrowUpRight,
  CheckCircle, Download, Infinity,
  MessageSquare, Instagram, Globe, Bot, TrendingUp, Users,
  Shield, X, Check,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const WALLET_BALANCE = 1240;
const PLAN = { name: "Growth", price: 2499, renewal: "15 Jan 2025", status: "active" };

const TOPUP_PACKS = [
  { id: "t1", amt: 500,  msgs: "~500 marketing msgs",  popular: false, bonus: null },
  { id: "t2", amt: 1000, msgs: "~1,000 marketing msgs", popular: true,  bonus: "₹50 bonus" },
  { id: "t3", amt: 2000, msgs: "~2,000 marketing msgs", popular: false, bonus: "₹150 bonus" },
  { id: "t4", amt: 5000, msgs: "~5,000 marketing msgs", popular: false, bonus: "₹500 bonus" },
];

const TXNS = [
  { id: "tx1", type: "topup",   desc: "Wallet Topup",              amt: +1000, date: "Today, 10:32 AM",    status: "success", icon: ArrowDownLeft, iconCls: "bg-green-100 text-green-600" },
  { id: "tx2", type: "debit",   desc: "Marketing Campaign — Diwali", amt: -387, date: "Yesterday, 6:15 PM",  status: "success", icon: ArrowUpRight,  iconCls: "bg-orange-100 text-orange-600" },
  { id: "tx3", type: "debit",   desc: "Utility Messages (OTP)",    amt: -43,  date: "22 Dec, 11:00 AM",   status: "success", icon: ArrowUpRight,  iconCls: "bg-orange-100 text-orange-600" },
  { id: "tx4", type: "topup",   desc: "Wallet Topup",              amt: +500, date: "20 Dec, 3:45 PM",    status: "success", icon: ArrowDownLeft, iconCls: "bg-green-100 text-green-600" },
  { id: "tx5", type: "debit",   desc: "Marketing Campaign — Sale", amt: -229, date: "18 Dec, 9:00 AM",    status: "success", icon: ArrowUpRight,  iconCls: "bg-orange-100 text-orange-600" },
  { id: "tx6", type: "invoice", desc: "Growth Plan — December",    amt: -2499, date: "1 Dec, 12:00 AM",   status: "success", icon: CreditCard,    iconCls: "bg-blue-100 text-blue-600" },
];

const USAGE = [
  { label: "Marketing",   used: 616, color: "bg-orange-400", cost: "₹1.00/msg" },
  { label: "Utility",     used: 215, color: "bg-blue-400",   cost: "₹0.20/msg" },
  { label: "IG Messages", used: 843, color: "bg-pink-400",   cost: "Free" },
  { label: "FB Messages", used: 321, color: "bg-blue-600",   cost: "Free" },
];

// ─── Topup Modal ──────────────────────────────────────────────────────────────

function TopupModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("t2");
  const [method, setMethod] = useState("upi");
  const [step, setStep] = useState<"select" | "pay" | "done">("select");
  const pack = TOPUP_PACKS.find(p => p.id === selected)!;

  if (step === "done") return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[360px] rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={32} className="text-[#22c55e]" />
        </div>
        <div className="text-[20px] font-extrabold text-slate-900 mb-1">Topup Successful!</div>
        <div className="text-[14px] text-slate-500 mb-1">₹{pack.amt.toLocaleString()} wallet mein add ho gaya</div>
        {pack.bonus && <div className="text-[12px] font-bold text-green-600 mb-5">+ {pack.bonus} bhi mila! 🎉</div>}
        <div className="rounded-2xl bg-[#f0fdf4] border border-green-100 px-4 py-3 mb-5">
          <div className="text-[12px] text-slate-500">New Wallet Balance</div>
          <div className="text-[28px] font-extrabold text-slate-900">₹{(WALLET_BALANCE + pack.amt).toLocaleString()}</div>
        </div>
        <button onClick={onClose} className="w-full rounded-2xl bg-[#22c55e] py-3 text-[14px] font-bold text-white">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[420px] rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="text-[17px] font-extrabold text-slate-900">Wallet Topup</div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"><X size={14} /></button>
        </div>

        {step === "select" && (
          <div className="p-6 space-y-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">Amount Chuniye</div>
            <div className="grid grid-cols-2 gap-3">
              {TOPUP_PACKS.map(p => (
                <button key={p.id} onClick={() => setSelected(p.id)} className={`relative rounded-2xl border p-4 text-left transition ${selected === p.id ? "border-[#22c55e] bg-[#f0fdf4] shadow-[0_0_0_2px_#dcfce7]" : "border-slate-200 hover:border-slate-300"}`}>
                  {p.popular && <span className="absolute -top-2 left-3 rounded-full bg-[#22c55e] px-2 py-0.5 text-[9px] font-bold text-white">Popular</span>}
                  {p.bonus && <span className="absolute -top-2 right-3 rounded-full bg-orange-400 px-2 py-0.5 text-[9px] font-bold text-white">{p.bonus}</span>}
                  <div className="text-[22px] font-extrabold text-slate-900">₹{p.amt.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.msgs}</div>
                  {selected === p.id && <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#22c55e] flex items-center justify-center"><Check size={11} className="text-white" strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 text-center">IG + FB messages unlimited & free — sirf WA charges</div>
            <button onClick={() => setStep("pay")} className="w-full rounded-2xl bg-[#22c55e] py-3.5 text-[14px] font-bold text-white hover:bg-[#16a34a] transition">
              Continue — ₹{pack.amt.toLocaleString()} →
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-[#f0fdf4] border border-green-100 px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-700">Topup Amount</span>
              <span className="text-[18px] font-extrabold text-slate-900">₹{pack.amt.toLocaleString()}</span>
            </div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Payment Method</div>
            <div className="space-y-2">
              {[["upi","UPI / Google Pay / PhonePe","⚡"],["card","Credit / Debit Card","💳"],["netbank","Net Banking","🏦"]].map(([id,label,icon]) => (
                <button key={id} onClick={() => setMethod(id)} className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition ${method === id ? "border-[#22c55e] bg-[#f0fdf4]" : "border-slate-200 hover:border-slate-300"}`}>
                  <span className="text-xl">{icon}</span>
                  <span className="flex-1 text-[13px] font-semibold text-slate-700 text-left">{label}</span>
                  {method === id && <div className="h-5 w-5 rounded-full bg-[#22c55e] flex items-center justify-center"><Check size={11} className="text-white" strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("select")} className="flex-1 rounded-2xl border border-slate-200 py-3 text-[13px] font-bold text-slate-600">Back</button>
              <button onClick={() => setStep("done")} className="flex-[2] rounded-2xl bg-[#22c55e] py-3 text-[14px] font-bold text-white hover:bg-[#16a34a] transition">
                Pay ₹{pack.amt.toLocaleString()} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BillingWallet() {
  const [showTopup, setShowTopup] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <Sidebar active="billing" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div>
            <div className="text-[16px] font-extrabold text-slate-900">Billing & Wallet</div>
            <div className="text-[11px] text-slate-400">Plan manage karein aur WhatsApp credits topup karein</div>
          </div>
          <button onClick={() => setShowTopup(true)} className="flex items-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#16a34a] transition shadow-sm">
            <Plus size={14} /> Wallet Topup
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Top row — Plan + Wallet */}
          <div className="grid grid-cols-3 gap-5">

            {/* Current Plan */}
            <div className="col-span-2 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] p-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <Infinity size={160} className="text-white -mr-8 -mt-8" />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Plan</div>
                  <div className="text-[26px] font-extrabold text-white flex items-center gap-2">
                    Growth <span className="text-[12px] font-bold rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] px-2.5 py-1">Active</span>
                  </div>
                  <div className="text-[13px] text-slate-400 mt-1">₹2,499/month · Renews {PLAN.renewal}</div>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-bold text-slate-300 hover:bg-white/10 transition">Change Plan</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Infinity, label: "WA Messages", val: "Unlimited" },
                  { icon: Bot,       label: "AI Auto-Reply", val: "Included" },
                  { icon: Users,     label: "Team Members",  val: "5 seats" },
                ].map(f => (
                  <div key={f.label} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                    <div className="text-[10px] text-slate-500 mb-0.5">{f.label}</div>
                    <div className="text-[13px] font-bold text-white">{f.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">WA Credit Wallet</div>
              <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                <div className="h-14 w-14 rounded-2xl bg-[#f0fdf4] border border-green-100 flex items-center justify-center mb-3">
                  <Zap size={24} className="text-[#22c55e]" />
                </div>
                <div className="text-[36px] font-extrabold text-slate-900">₹{WALLET_BALANCE.toLocaleString()}</div>
                <div className="text-[12px] text-slate-400 mt-0.5">Available balance</div>
                <div className="mt-2 text-[11px] text-orange-500 font-semibold">⚠️ Low balance — topup karein</div>
              </div>
              <button onClick={() => setShowTopup(true)} className="w-full rounded-xl bg-[#22c55e] py-3 text-[13px] font-bold text-white hover:bg-[#16a34a] transition flex items-center justify-center gap-2 mt-2">
                <Plus size={14} /> Add Credits
              </button>
            </div>
          </div>

          {/* Usage this month */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[14px] font-extrabold text-slate-900">This Month's Usage</div>
                <div className="text-[12px] text-slate-400">December 2024</div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-1.5">
                <TrendingUp size={13} className="text-green-600" />
                <span className="text-[12px] font-bold text-green-700">1,995 total messages</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {USAGE.map(u => (
                <div key={u.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${u.color}`} />
                    <span className="text-[11px] font-bold text-slate-600">{u.label}</span>
                  </div>
                  <div className="text-[22px] font-extrabold text-slate-900">{u.used.toLocaleString()}</div>
                  <div className={`mt-1 text-[11px] font-semibold ${u.cost === "Free" ? "text-green-600" : "text-slate-400"}`}>{u.cost}</div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full ${u.color}`} style={{ width: `${Math.min(100, (u.used / 1000) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="text-[14px] font-extrabold text-slate-900">Transaction History</div>
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500 hover:border-slate-300 transition">
                <Download size={13} /> Export
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {TXNS.map(tx => {
                const Icon = tx.icon;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ${tx.iconCls}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-slate-800">{tx.desc}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tx.date}</div>
                    </div>
                    <div className={`text-[14px] font-extrabold ${tx.amt > 0 ? "text-[#22c55e]" : "text-slate-700"}`}>
                      {tx.amt > 0 ? "+" : ""}₹{Math.abs(tx.amt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600">
                      <CheckCircle size={10} /> Success
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rate card */}
          <div className="rounded-2xl bg-[#f8fafc] border border-slate-200 p-5">
            <div className="text-[13px] font-extrabold text-slate-800 mb-3">WhatsApp Conversation Rates</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { type: "Marketing",      rate: "₹1.00",  eg: "Offers, promos", color: "bg-orange-100 text-orange-700 border-orange-100" },
                { type: "Utility",        rate: "₹0.20",  eg: "Order updates",  color: "bg-blue-100 text-blue-700 border-blue-100" },
                { type: "Authentication", rate: "₹0.20",  eg: "OTP, login",     color: "bg-purple-100 text-purple-700 border-purple-100" },
                { type: "Service (Incoming)", rate: "Free ✅", eg: "Customer replies", color: "bg-green-100 text-green-700 border-green-100" },
              ].map(r => (
                <div key={r.type} className={`rounded-xl border ${r.color} p-3`}>
                  <div className="text-[10px] font-bold mb-1">{r.type}</div>
                  <div className="text-[18px] font-extrabold">{r.rate}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{r.eg}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400">*Per 24-hour conversation window · Instagram & Facebook messages unlimited & free</div>
          </div>

        </div>
      </div>

      {showTopup && <TopupModal onClose={() => setShowTopup(false)} />}
    </div>
  );
}
