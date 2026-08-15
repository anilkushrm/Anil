import { useState } from "react";
import Sidebar from "./_shared/Sidebar";
import {
  Check, ChevronRight, ExternalLink, Plus, RefreshCw, Search, Star, Zap,
} from "lucide-react";

/* ─── App data ─── */
const categories = ["All", "E-commerce", "Payments", "Productivity", "Analytics", "Automation"];

const apps = [
  // E-commerce
  {
    id: "shopify", name: "Shopify", category: "E-commerce", logo: "🛍️",
    desc: "Orders, products aur customers sync karein. Abandoned cart WhatsApp recovery auto-send.",
    color: "#96bf48", bg: "bg-[#96bf48]/10", border: "border-[#96bf48]/30",
    connected: true, rating: 4.9, reviews: 1240,
    features: ["Order notifications", "Abandoned cart recovery", "Product catalog sync", "COD confirmation"],
  },
  {
    id: "woocommerce", name: "WooCommerce", category: "E-commerce", logo: "🛒",
    desc: "WordPress WooCommerce store se live order updates aur customer data sync.",
    color: "#7f54b3", bg: "bg-[#7f54b3]/10", border: "border-[#7f54b3]/30",
    connected: false, rating: 4.7, reviews: 890,
    features: ["Order sync", "Customer data", "Refund alerts", "Review requests"],
  },
  {
    id: "razorpay", name: "Razorpay", category: "Payments", logo: "💳",
    desc: "Payment success/failure pe automatic WhatsApp confirmation bhejein.",
    color: "#0d5fe4", bg: "bg-[#0d5fe4]/10", border: "border-[#0d5fe4]/30",
    connected: true, rating: 4.8, reviews: 2100,
    features: ["Payment alerts", "Invoice send", "Refund status", "Subscription reminders"],
  },
  {
    id: "stripe", name: "Stripe", category: "Payments", logo: "⚡",
    desc: "Global payment gateway — subscription renewal, failed payment alerts auto.",
    color: "#635bff", bg: "bg-[#635bff]/10", border: "border-[#635bff]/30",
    connected: false, rating: 4.8, reviews: 3400,
    features: ["Subscription alerts", "Payment links", "Invoice delivery", "Dispute alerts"],
  },
  {
    id: "gsheets", name: "Google Sheets", category: "Productivity", logo: "📊",
    desc: "Leads aur contacts automatically Google Sheets mein export karo — real time.",
    color: "#34a853", bg: "bg-[#34a853]/10", border: "border-[#34a853]/30",
    connected: true, rating: 4.6, reviews: 5600,
    features: ["Auto export leads", "2-way sync", "Custom columns", "Scheduled exports"],
  },
  {
    id: "tally", name: "Tally / Zoho Books", category: "Payments", logo: "🧾",
    desc: "GST invoice aur billing data automatically sync — accounts mein manually nahi daalna.",
    color: "#e85d04", bg: "bg-[#e85d04]/10", border: "border-[#e85d04]/30",
    connected: false, rating: 4.5, reviews: 420,
    features: ["GST invoices", "Payment records", "Customer sync", "Tax reports"],
  },
  {
    id: "zapier", name: "Zapier", category: "Automation", logo: "⚡",
    desc: "5,000+ apps ke saath connect karein bina code ke. Zap banao — CRM action trigger.",
    color: "#ff4a00", bg: "bg-[#ff4a00]/10", border: "border-[#ff4a00]/30",
    connected: false, rating: 4.7, reviews: 8900,
    features: ["5000+ app support", "No-code workflows", "Multi-step zaps", "Live testing"],
  },
  {
    id: "make", name: "Make (Integromat)", category: "Automation", logo: "🔄",
    desc: "Visual automation builder — complex multi-step scenarios banana aasaan.",
    color: "#6d00cc", bg: "bg-[#6d00cc]/10", border: "border-[#6d00cc]/30",
    connected: false, rating: 4.6, reviews: 3200,
    features: ["Visual builder", "Error handling", "Scheduling", "Data mapping"],
  },
  {
    id: "ga4", name: "Google Analytics 4", category: "Analytics", logo: "📈",
    desc: "Website visitors track karein. Lead conversion events CRM mein automatically log.",
    color: "#e37400", bg: "bg-[#e37400]/10", border: "border-[#e37400]/30",
    connected: false, rating: 4.5, reviews: 1800,
    features: ["Conversion tracking", "Lead source data", "UTM params", "Goal events"],
  },
  {
    id: "pabbly", name: "Pabbly Connect", category: "Automation", logo: "🔗",
    desc: "Indian no-code automation tool — cheap lifetime plan mein unlimited tasks.",
    color: "#00c4b3", bg: "bg-[#00c4b3]/10", border: "border-[#00c4b3]/30",
    connected: false, rating: 4.4, reviews: 670,
    features: ["Unlimited tasks", "Lifetime pricing", "1000+ apps", "Schedule triggers"],
  },
  {
    id: "indiamart", name: "IndiaMart", category: "E-commerce", logo: "🏭",
    desc: "IndiaMart buyer inquiries seedha CRM mein lead bante hain. Auto WhatsApp reply.",
    color: "#e31e2c", bg: "bg-[#e31e2c]/10", border: "border-[#e31e2c]/30",
    connected: false, rating: 4.3, reviews: 390,
    features: ["Lead import", "Auto WhatsApp", "Inquiry alerts", "Catalog sync"],
  },
  {
    id: "justdial", name: "JustDial", category: "E-commerce", logo: "📞",
    desc: "JustDial leads auto CRM mein import — koi manual entry nahi.",
    color: "#FF6600", bg: "bg-[#FF6600]/10", border: "border-[#FF6600]/30",
    connected: false, rating: 4.2, reviews: 210,
    features: ["Lead auto-import", "Caller data sync", "Follow-up trigger", "Response tracking"],
  },
];

function AppCard({ app, onToggle }: { app: typeof apps[0]; onToggle: () => void }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
    onToggle();
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl border-2 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      app.connected ? "border-emerald-400 shadow-[0_0_0_3px_rgba(34,197,94,.06)]" : "border-slate-200"
    }`}>
      {app.connected && (
        <div className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
          <Check size={12} strokeWidth={3} />
        </div>
      )}

      <div className="p-5">
        {/* header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[24px] ${app.bg}`}>
            {app.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-slate-900 truncate">{app.name}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${app.bg}`} style={{color: app.color}}>
                {app.category}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-slate-600">{app.rating}</span>
              <span className="text-[10px] text-slate-400">({app.reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-slate-500 mb-3">{app.desc}</p>

        {/* features toggle */}
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 mb-3">
          <ChevronRight size={13} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          {expanded ? "Features chhupayein" : "Features dekhein"}
        </button>

        {expanded && (
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {app.features.map(f => (
              <div key={f} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check size={10} className="text-emerald-500 shrink-0" strokeWidth={3} />
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* action */}
      <div className="mt-auto border-t border-slate-100 p-4">
        {app.connected ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-600">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected & Active
            </div>
            <button onClick={handleConnect} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition">
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: app.color }}
          >
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Connecting...</> : <><Plus size={14} /> Connect {app.name}</>}
          </button>
        )}
      </div>
    </div>
  );
}

export function BusinessApps() {
  const [appList, setAppList] = useState(apps);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const toggle = (id: string) => {
    setAppList(prev => prev.map(a => a.id === id ? { ...a, connected: !a.connected } : a));
  };

  const filtered = appList.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedCount = appList.filter(a => a.connected).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f6f5]">
      <Sidebar active="business" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* topbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900">Business Apps</h1>
            <p className="text-[12px] text-slate-500">Apne tools ko CRM se connect karein</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-600">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              {connectedCount} connected
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
              <ExternalLink size={13} /> Request an App
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* connected banner */}
          {connectedCount > 0 && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-emerald-600" />
                  <div>
                    <div className="text-[13px] font-bold text-emerald-800">{connectedCount} apps connected — CRM mein data auto sync ho raha hai</div>
                    <div className="text-[11px] text-emerald-600">
                      {appList.filter(a => a.connected).map(a => a.name).join(" · ")}
                    </div>
                  </div>
                </div>
                <button className="text-[12px] font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                  Activity dekhein <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* search + filter */}
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="App dhundein..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#22c55e] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* grid */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map(app => (
              <AppCard key={app.id} app={app} onToggle={() => toggle(app.id)} />
            ))}
            {/* Request card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:border-[#22c55e]/50 hover:bg-emerald-50/30 transition cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[24px] mb-3">🔌</div>
              <div className="text-[13px] font-bold text-slate-700 mb-1">Koi aur app chahiye?</div>
              <div className="text-[11px] text-slate-400 mb-3">Request karein — hum 2 weeks mein add karte hain</div>
              <button className="rounded-xl bg-slate-100 px-4 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-200 transition">
                + Request App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
