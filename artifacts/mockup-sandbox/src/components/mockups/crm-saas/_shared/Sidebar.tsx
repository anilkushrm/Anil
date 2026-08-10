import { useState } from "react";
import { Activity, BarChart3, BellRing, Bot, ChevronDown, Contact, FileText, Inbox, LayoutDashboard, Megaphone, Settings, Sparkles, UsersRound, Zap } from "lucide-react";

const items = [
  ["Dashboard", LayoutDashboard], ["Inbox", Inbox], ["Contacts", Contact], ["Leads Pipeline", BarChart3],
  ["Campaigns", Megaphone], ["WhatsApp Templates", FileText], ["Chatbot Flows", Bot], ["AI & Sequences", Sparkles], ["Broadcasts", BellRing],
  ["Reports", Activity], ["Settings", Settings],
] as const;

export function Sidebar({ active = "Dashboard" }: { active?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={`${collapsed ? "w-[76px]" : "w-[238px]"} shrink-0 bg-[#101a2e] text-slate-300 flex min-h-screen flex-col transition-all duration-200`}>
    <div className="h-[72px] border-b border-white/8 flex items-center px-5 gap-3">
      <div className="h-9 w-9 rounded-xl bg-[#22c55e] text-[#092314] flex items-center justify-center shadow-lg shadow-green-500/15"><Zap size={19} fill="currentColor" /></div>
      {!collapsed && <div><div className="font-display font-bold text-white tracking-tight">Connectly<span className="text-[#65e58c]"> CRM</span></div><div className="text-[10px] text-slate-500 tracking-[.12em] uppercase mt-0.5">Conversation OS</div></div>}
    </div>
    <div className="px-3 pt-5 flex-1">
      {!collapsed && <div className="text-[10px] uppercase tracking-[.16em] text-slate-600 font-bold px-3 mb-3">Workspace</div>}
      <nav className="space-y-1">
        {items.map(([label, Icon]) => <button key={label} onClick={() => {}} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${active === label ? "bg-[#1b3b32] text-[#67e58b] font-semibold" : "hover:bg-white/5 hover:text-white"}`}>
          <Icon size={17} strokeWidth={active === label ? 2.5 : 1.8} />{!collapsed && <span>{label}</span>}{!collapsed && label === "Inbox" && <span className="ml-auto rounded-md bg-[#ef7b5a] px-1.5 py-0.5 text-[10px] text-white">12</span>}
        </button>)}
      </nav>
    </div>
    <div className="p-3">
      {!collapsed && <div className="rounded-xl bg-[#17253d] border border-white/5 p-3 mb-3"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center">AC</div><div className="min-w-0"><div className="text-xs font-semibold text-white">Acme Corp</div><div className="text-[10px] text-slate-500 truncate">acme.connectly.app</div></div><ChevronDown size={14} className="ml-auto text-slate-500" /></div><div className="mt-3 flex justify-between items-center"><span className="text-[10px] text-slate-500">Business plan</span><span className="text-[10px] font-semibold text-[#65e58c]">Active</span></div></div>}
      <button onClick={() => setCollapsed(!collapsed)} className="w-full text-left text-xs text-slate-500 hover:text-white px-3 py-2">{collapsed ? "→" : "← Collapse sidebar"}</button>
    </div>
  </aside>;
}

export function Avatar({ initials, tone = "bg-slate-200 text-slate-700" }: { initials: string; tone?: string }) {
  return <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${tone}`}>{initials}</div>;
}

export function ChannelIcon({ channel }: { channel: "WhatsApp" | "Instagram" | "Facebook" }) {
  const style = channel === "WhatsApp" ? "bg-[#d9f7e4] text-[#139447]" : channel === "Instagram" ? "bg-[#fce1ef] text-[#d94685]" : "bg-[#deebff] text-[#3375d2]";
  return <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${style}`}>{channel === "WhatsApp" ? "W" : channel === "Instagram" ? "IG" : "f"}</span>;
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header className="h-[72px] px-7 border-b border-slate-200 bg-white flex items-center justify-between shrink-0"><div><h1 className="font-display text-[21px] font-bold tracking-tight text-slate-900">{title}</h1>{subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}</div><div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 h-9 w-56"><span className="text-xs text-slate-400">⌕</span><input className="bg-transparent outline-none text-xs w-full" placeholder="Search anything..." /></div><button className="relative h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"><BellRing size={16}/><span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-[#ef7b5a] text-[9px] text-white flex items-center justify-center">3</span></button><button className="hidden sm:flex items-center gap-2 h-9 rounded-lg bg-[#22c55e] px-3.5 text-xs font-bold text-[#082113] hover:bg-[#1dae51]"><Sparkles size={14}/> Create Lead</button><Avatar initials="RK" tone="bg-[#d8e8ff] text-[#245da8]" /></div></header>;
}