import { useState } from "react";
import {
  Zap, Check, ArrowRight, MessageSquare, Instagram,
  Shield, Users, Bot, BarChart3, Webhook, Globe, ChevronDown,
  Sparkles, Infinity, Crown, Phone, Mail,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 499,
    badge: null,
    popular: false,
    headerCls: "from-slate-600 to-slate-700",
    btnCls: "bg-slate-700 hover:bg-slate-800 text-white",
    limit: "1,000 Subscribers",
    limitNote: "Max 1,000 contacts",
    description: "Nayi shuruwat ke liye — limited subscribers, sab channels included",
    features: [
      "1,000 Subscribers / Contacts",
      "WhatsApp + Instagram + Facebook",
      "Unified Inbox",
      "Basic Chatbot Builder",
      "WhatsApp Templates",
      "Lead Pipeline",
      "1 Team Member",
      "WA Credits Wallet",
      "Email Support",
    ],
    notIncluded: ["AI Auto-Reply", "AI Sequences", "Broadcast Campaigns", "Webhooks", "Priority Support"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 999,
    badge: null,
    popular: false,
    headerCls: "from-[#1e3a5f] to-[#0f172a]",
    btnCls: "bg-[#0f172a] hover:bg-[#1e3a5f] text-white",
    limit: "Unlimited",
    limitNote: "Unlimited messages",
    description: "Grow karo bina limit ke — unlimited messages, zero complexity",
    features: [
      "Unlimited Subscribers",
      "WhatsApp + Instagram + Facebook",
      "Unified Inbox (All channels)",
      "Advanced Chatbot Builder",
      "WhatsApp Templates",
      "Lead Pipeline (Kanban)",
      "Broadcast Campaigns",
      "3 Team Members",
      "WA Credits Wallet",
      "Email Support",
    ],
    notIncluded: ["AI Auto-Reply", "AI Sequences", "Webhooks", "Priority Support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 2499,
    badge: "Most Popular",
    popular: true,
    headerCls: "from-[#15803d] to-[#166534]",
    btnCls: "bg-[#22c55e] hover:bg-[#16a34a] text-white",
    limit: "Unlimited + AI",
    limitNote: "AI-powered automation",
    description: "Full AI automation — smart replies, sequences, aur sabkuch",
    features: [
      "Unlimited Subscribers",
      "WhatsApp + Instagram + Facebook",
      "Unified Inbox (All channels)",
      "AI Auto-Reply (GPT powered) ✨",
      "AI Memory & CRM Sync ✨",
      "AI Follow-up Sequences ✨",
      "Advanced Chatbot Builder",
      "Broadcast Campaigns",
      "Webhook & Integrations",
      "5 Team Members",
      "Reports & Analytics",
      "Priority Support",
    ],
    notIncluded: ["White Label"],
  },
];

const FAQS = [
  {
    q: "WhatsApp messages ka charge alag hoga kya?",
    a: "Haan — WhatsApp Business API ke conversation charges Meta ke hisaab se alag hote hain. Aapko Ai Botflow ke panel mein wallet topup karna hoga (₹500 / ₹1000 / ₹2000). Har message automatically wallet se deduct hoga. Marketing message ₹0.92/conv, utility/auth ₹0.12/conv.",
  },
  {
    q: "Instagram aur Facebook ka charge kya hoga?",
    a: "Bilkul free! Instagram DMs aur Facebook messages ke liye koi extra charge nahi — yeh unlimited plan mein included hain.",
  },
  {
    q: "Kya contract hai? Lock-in period?",
    a: "Nahi! Koi contract nahi, koi lock-in nahi. Monthly subscription hai — kabhi bhi cancel kar sakte hain.",
  },
  {
    q: "Free trial milega?",
    a: "Haan! 14 days free trial — koi credit card nahi chahiye. Sirf sign up karein aur shuru ho jayein.",
  },
  {
    q: "Mera data safe hai?",
    a: "Bilkul. Aapka data aapke account mein secure rehta hai. Hum kabhi aapka data third party ko nahi dete.",
  },
];

const LOGOS = ["Zoko", "Shopify", "Razorpay", "WooCommerce", "Zapier", "Google Sheets"];

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          <span className="text-[16px] font-bold text-slate-900">Ai Botflow</span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-slate-500">
          {["Features", "Pricing", "Integrations", "Blog"].map(l => (
            <a key={l} href="#" className="hover:text-slate-900 transition">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[13px] font-bold text-slate-600 hover:text-slate-900 transition px-3 py-2">Sign in</button>
          <button className="rounded-xl bg-[#22c55e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#16a34a] transition shadow-sm">
            Free Trial →
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-16 pb-8 text-center px-6 bg-gradient-to-b from-[#f0fdf4] to-white">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#dcfce7] border border-[#86efac] px-4 py-1.5 mb-5">
        <Sparkles size={12} className="text-[#16a34a]" />
        <span className="text-[12px] font-bold text-[#166534]">14-day free trial · No credit card</span>
      </div>
      <h1 className="text-[44px] font-extrabold text-slate-900 leading-tight max-w-2xl mx-auto">
        Simple Pricing,<br />
        <span className="text-[#22c55e]">Unlimited Conversations</span>
      </h1>
      <p className="mt-4 text-[16px] text-slate-500 max-w-lg mx-auto leading-relaxed">
        WhatsApp + Instagram + Facebook — sab ek jagah. AI ke saath automate karein.
        Sirf ek flat monthly fee — messages unlimited.
      </p>

      {/* WA credits note */}
      <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5">
        <span className="text-[13px]">💡</span>
        <span className="text-[12px] text-amber-800 font-medium">
          <b>Note:</b> WhatsApp conversation charges alag hain (Meta policy) — panel mein wallet topup karein
        </span>
      </div>
    </section>
  );
}

function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setAnnual(false)} className={`rounded-xl px-5 py-2 text-[13px] font-bold transition ${!annual ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`rounded-xl px-5 py-2 text-[13px] font-bold transition flex items-center gap-2 ${annual ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>
              Annual
              <span className="rounded-full bg-[#22c55e] px-2 py-0.5 text-[10px] font-bold text-white">Save 20%</span>
            </button>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={plan.id} className={`relative rounded-3xl border bg-white overflow-hidden flex flex-col
                ${plan.popular
                  ? "border-[#22c55e] shadow-[0_0_0_3px_#dcfce7,0_20px_60px_rgba(34,197,94,.15)] scale-[1.02]"
                  : "border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,.07)]"}`}>

                {plan.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="flex items-center gap-1 rounded-full bg-[#22c55e] px-3 py-1 text-[10px] font-bold text-white shadow">
                      <Crown size={9} /> {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-br ${plan.headerCls} p-5 pb-7`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[13px] font-bold text-white/70 mt-1">₹</span>
                    <span className="text-[46px] font-extrabold text-white leading-none">{price.toLocaleString()}</span>
                    <span className="text-[12px] font-semibold text-white/50 mb-1.5">/mo</span>
                  </div>
                  {annual && <div className="text-[10px] text-white/50 mb-2">₹{(price * 12).toLocaleString()} billed yearly</div>}
                  <p className="text-[11px] text-white/60 leading-relaxed">{plan.description}</p>
                </div>

                {/* Limit badge */}
                <div className="mx-5 -mt-3.5 mb-4 flex items-center gap-2 rounded-xl bg-white border border-slate-100 shadow-sm px-3.5 py-2">
                  {plan.id === "basic"
                    ? <Users size={14} className="text-slate-500 shrink-0" />
                    : <Infinity size={14} className="text-[#22c55e] shrink-0" />}
                  <span className="text-[11.5px] font-bold text-slate-700">{plan.limit}</span>
                  <span className="text-[10px] text-slate-400">· {plan.limitNote}</span>
                </div>

                {/* Features */}
                <div className="px-5 pb-2 flex-1">
                  <div className="space-y-2">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="h-4.5 w-4.5 mt-0.5 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 h-[18px] w-[18px]">
                          <Check size={10} className="text-[#16a34a]" strokeWidth={3} />
                        </div>
                        <span className="text-[12px] text-slate-700 leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                  {plan.notIncluded.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 opacity-35">
                      {plan.notIncluded.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-[18px] w-[18px] rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-[9px] text-slate-500 font-bold">✕</span>
                          </div>
                          <span className="text-[11px] text-slate-400 line-through">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="p-5 pt-4">
                  <button className={`w-full rounded-xl py-3 text-[13px] font-bold transition flex items-center justify-center gap-2 ${plan.btnCls}`}>
                    14 Days Free Trial <ArrowRight size={14} />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-1.5">Koi credit card nahi chahiye</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom / Enterprise card */}
        <div className="mt-5 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-purple-200">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className="text-[18px] font-extrabold text-slate-900">Custom / Enterprise</span>
              <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">Bespoke</span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Zyada subscribers chahiye? White label branding? Dedicated server? Bulk pricing?
              <br className="hidden md:block" /> Hum aapke hisaab se plan banate hain — koi bhi volume, koi bhi requirement.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
              {["Unlimited seats", "White label", "Dedicated server", "Custom integrations", "SLA guarantee", "Dedicated manager"].map(f => (
                <span key={f} className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                  <Check size={10} className="text-[#22c55e]" strokeWidth={3} /> {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#6d28d9] transition shadow-md shadow-purple-200">
              <Phone size={14} /> Call Karein
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-bold text-slate-700 hover:border-slate-300 transition">
              <Mail size={14} /> Email Bhejein
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletSection() {
  return (
    <section className="py-12 px-6 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-4">
            <Zap size={12} className="text-[#22c55e]" />
            <span className="text-[12px] font-bold text-slate-300">WhatsApp Credits — Simple Wallet System</span>
          </div>
          <h2 className="text-[30px] font-extrabold text-white mb-3">WhatsApp ka Charge?<br /><span className="text-[#22c55e]">Wallet mein Topup karo, Bas!</span></h2>
          <p className="text-[14px] text-slate-400 max-w-lg mx-auto">Meta ka WhatsApp conversation charge alag hota hai — lekin aapko Meta pe nahi jaana. Panel mein sirf topup karo aur sab automatic.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { step: "1", title: "Topup Karo", desc: "Panel mein ₹500 / ₹1000 / ₹2000 add karo — UPI / card se", icon: "💳" },
            { step: "2", title: "Message Bhejo", desc: "WhatsApp messages bhejo — wallet se automatically deduct", icon: "💬" },
            { step: "3", title: "Balance Check Karo", desc: "Dashboard pe real-time wallet balance aur usage dekhte raho", icon: "📊" },
          ].map(s => (
            <div key={s.step} className="rounded-2xl bg-white/8 border border-white/10 p-5 text-center backdrop-blur-sm">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e] text-[11px] font-bold text-white mb-2">{s.step}</div>
              <div className="text-[14px] font-bold text-white mb-1.5">{s.title}</div>
              <div className="text-[12px] text-slate-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Topup options */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-[13px] font-bold text-slate-300 mb-4 text-center">Topup Options</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { amt: "₹500", msgs: "~500 marketing msgs", popular: false },
              { amt: "₹1,000", msgs: "~1,000 marketing msgs", popular: true },
              { amt: "₹2,000", msgs: "~2,000 marketing msgs", popular: false },
            ].map(t => (
              <div key={t.amt} className={`rounded-2xl border p-4 text-center cursor-pointer transition ${t.popular ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                {t.popular && <div className="text-[9px] font-bold text-[#22c55e] mb-1 uppercase tracking-wider">Most Used</div>}
                <div className="text-[22px] font-extrabold text-white">{t.amt}</div>
                <div className="text-[11px] text-slate-400 mt-1">{t.msgs}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 flex flex-wrap gap-4 justify-center text-[11px] text-slate-400">
            <span>✅ Marketing msg ₹0.92</span>
            <span>✅ Utility / Auth msg ₹0.12</span>
            <span>✅ Customer reply (incoming) Free</span>
            <span>✅ IG + FB unlimited — Free</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-[26px] font-extrabold text-slate-900 text-center mb-8">Aksar Pooche Jane Wale Sawaal</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className={`rounded-2xl border transition ${open === i ? "border-[#22c55e] bg-[#f0fdf4]" : "border-slate-200 bg-white"}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
                <span className="text-[13.5px] font-bold text-slate-800">{f.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-4 text-[12.5px] text-slate-600 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0f172a] px-6 py-10">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#22c55e] flex items-center justify-center"><Zap size={14} fill="white" className="text-white" /></div>
          <span className="text-[15px] font-bold text-white">Ai Botflow</span>
        </div>
        <div className="flex gap-5 text-[12px] font-semibold text-slate-500">
          {["Privacy Policy", "Terms", "Contact", "Support"].map(l => <a key={l} href="#" className="hover:text-slate-300 transition">{l}</a>)}
        </div>
        <div className="text-[12px] text-slate-600">© 2024 Ai Botflow. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Nav />
      <Hero />
      <PricingCards />
      <WalletSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
