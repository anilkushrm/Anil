import { useState } from "react";
import {
  MessageSquare, Users, Bell, Search, Plus, Filter,
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip,
  Smile, Mic, CheckCheck, X, Zap, Star, TrendingUp,
  Settings, LogOut, Shield, HelpCircle, ChevronRight,
  Camera, Image, FileText, BarChart3, Check,
} from "lucide-react";

type Screen = "inbox" | "chat" | "leads" | "notifications" | "profile";
type Channel = "all" | "whatsapp" | "instagram" | "facebook";

// ─── Data ────────────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  { id: "c1", name: "Rahul Sharma",  avatar: "RS", lastMsg: "Haan bhai, price batao",       time: "2m",  unread: 3, channel: "whatsapp"  as const, online: true,  tag: "Hot Lead" },
  { id: "c2", name: "Priya Mehta",   avatar: "PM", lastMsg: "Order confirm ho gaya?",        time: "15m", unread: 1, channel: "instagram" as const, online: true  },
  { id: "c3", name: "Ankit Patel",   avatar: "AP", lastMsg: "Thanks! Will check.",            time: "1h",  unread: 0, channel: "whatsapp"  as const, online: false },
  { id: "c4", name: "Sunita Roy",    avatar: "SR", lastMsg: "Delivery kab tak?",              time: "2h",  unread: 2, channel: "facebook"  as const, online: false, tag: "Follow-up" },
  { id: "c5", name: "Manish Kumar",  avatar: "MK", lastMsg: "Aapka product dekha",            time: "3h",  unread: 0, channel: "whatsapp"  as const, online: false },
  { id: "c6", name: "Deepa Singh",   avatar: "DS", lastMsg: "Can I get a discount?",          time: "5h",  unread: 0, channel: "instagram" as const, online: true  },
  { id: "c7", name: "Vikram Nair",   avatar: "VN", lastMsg: "Invoice bhej dijiye",            time: "1d",  unread: 0, channel: "whatsapp"  as const, online: false },
];

const MESSAGES = [
  { id: "m1", from: "them" as const, text: "Hello! Aapka product dekha Instagram pe, price kya hai?",                                         time: "10:30", status: "read"      as const },
  { id: "m2", from: "me"   as const, text: "Namaste Rahul ji! 😊 Hamare plans ₹999/month se shuru hote hain. Detail mein baat karein?",       time: "10:31", status: "read"      as const },
  { id: "m3", from: "them" as const, text: "Haan bilkul. Features kya kya hain?",                                                             time: "10:32", status: "read"      as const },
  { id: "m4", from: "me"   as const, text: "WhatsApp + Instagram + Facebook — sab ek jagah. AI auto-reply, lead pipeline, campaigns! 🚀",     time: "10:33", status: "read"      as const },
  { id: "m5", from: "them" as const, text: "Trial milega kya?",                                                                                time: "10:45", status: "read"      as const },
  { id: "m6", from: "me"   as const, text: "14 days free trial — koi credit card nahi chahiye. Abhi sign up karein 👇",                        time: "10:46", status: "read"      as const },
  { id: "m7", from: "them" as const, text: "Haan bhai, price batao",                                                                           time: "11:02", status: "delivered" as const },
];

const LEADS = [
  { id: "l1", name: "Rahul Sharma",  company: "Tech Solutions",    value: "₹45,000", stage: "Proposal",  stageColor: "bg-purple-100 text-purple-700", avatar: "RS", days: 2 },
  { id: "l2", name: "Priya Mehta",   company: "Fashion Hub",        value: "₹12,000", stage: "Qualified",  stageColor: "bg-blue-100 text-blue-700",   avatar: "PM", days: 1 },
  { id: "l3", name: "Sunita Roy",    company: "Roy Enterprises",    value: "₹8,500",  stage: "New Lead",   stageColor: "bg-slate-100 text-slate-600",  avatar: "SR", days: 0 },
  { id: "l4", name: "Ankit Patel",   company: "Patel & Co.",        value: "₹67,000", stage: "Won",        stageColor: "bg-green-100 text-green-700",  avatar: "AP", days: 5 },
  { id: "l5", name: "Manish Kumar",  company: "Kumar Traders",      value: "₹23,000", stage: "Contacted",  stageColor: "bg-yellow-100 text-yellow-700", avatar: "MK", days: 3 },
];

const NOTIFICATIONS = [
  { id: "n1", icon: MessageSquare, color: "bg-green-100 text-green-600",  title: "New WhatsApp Message", body: "Rahul Sharma: Haan bhai, price batao",          time: "2m",  unread: true  },
  { id: "n2", icon: Users,         color: "bg-blue-100 text-blue-600",    title: "New Lead Created",     body: "Sunita Roy added via Facebook Lead Ad",         time: "15m", unread: true  },
  { id: "n3", icon: Zap,           color: "bg-purple-100 text-purple-600",title: "AI Sequence Triggered",body: "Day 3 follow-up sent to Manish Kumar",          time: "1h",  unread: false },
  { id: "n4", icon: Star,          color: "bg-yellow-100 text-yellow-600",title: "Deal Won! 🎉",          body: "Ankit Patel — ₹67,000 marked as Won",           time: "5h",  unread: false },
  { id: "n5", icon: Bell,          color: "bg-red-100 text-red-600",      title: "Webhook Error",        body: "Custom CRM Sync failed — retry needed",         time: "3h",  unread: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ChannelBadge({ ch }: { ch: "whatsapp" | "instagram" | "facebook" }) {
  const map = { whatsapp: ["W", "bg-[#25d366]"], instagram: ["I", "bg-gradient-to-br from-[#f58529] to-[#dd2a7b]"], facebook: ["F", "bg-[#1877f2]"] };
  const [letter, cls] = map[ch];
  return <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${cls} text-white text-[7px] font-bold shadow`}>{letter}</span>;
}

function Av({ initials, cls = "bg-slate-100 text-slate-700", size = "md" }: { initials: string; cls?: string; size?: "sm"|"md"|"lg" }) {
  const s = size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-12 w-12 text-[15px]" : "h-10 w-10 text-[11px]";
  return <div className={`${s} ${cls} flex shrink-0 items-center justify-center rounded-full font-bold`}>{initials}</div>;
}

// ─── INBOX ───────────────────────────────────────────────────────────────────

function InboxScreen({ onChat }: { onChat: () => void }) {
  const [filter, setFilter] = useState<Channel>("all");
  const [q, setQ] = useState("");
  const list = CONVERSATIONS.filter(c => (filter === "all" || c.channel === filter) && c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[19px] font-bold text-slate-900">Inbox</span>
          <div className="flex gap-2">
            <button className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100"><Filter size={15} className="text-slate-500" /></button>
            <button className="h-8 w-8 flex items-center justify-center rounded-full bg-[#22c55e]"><Plus size={15} className="text-white" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 mb-3">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-400" />
        </div>
        <div className="flex gap-1.5">
          {(["all","whatsapp","instagram","facebook"] as Channel[]).map(k => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-xl px-3 py-1 text-[10px] font-bold transition ${filter === k ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"}`}>
              {k === "all" ? "All 👥" : k === "whatsapp" ? "WA 💬" : k === "instagram" ? "IG 📸" : "FB 👍"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {list.map(c => (
          <button key={c.id} onClick={onChat} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left">
            <div className="relative shrink-0">
              <Av initials={c.avatar} cls={c.unread ? "bg-[#dcfce7] text-[#166534]" : "bg-slate-100 text-slate-600"} />
              {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />}
              <ChannelBadge ch={c.channel} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[13px] ${c.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{c.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{c.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 truncate">{c.lastMsg}</span>
                {c.unread > 0 && <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#22c55e] px-1 text-[9px] font-bold text-white">{c.unread}</span>}
              </div>
              {c.tag && <span className="mt-1 inline-block rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-600">{c.tag}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT ────────────────────────────────────────────────────────────────────

function ChatScreen({ onBack }: { onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const [attach, setAttach] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-[#0f172a] px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white"><ArrowLeft size={20} /></button>
          <div className="relative">
            <Av initials="RS" cls="bg-green-200 text-green-900" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#0f172a]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white">Rahul Sharma</div>
            <div className="text-[10px] text-green-400">Online · WhatsApp</div>
          </div>
          <button className="text-slate-400"><Phone size={18} /></button>
          <button className="text-slate-400"><Video size={18} /></button>
          <button className="text-slate-400"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* AI banner */}
      <div className="bg-[#f0fdf4] border-b border-green-100 px-4 py-2 flex items-center gap-2 shrink-0">
        <Zap size={12} className="text-[#22c55e] shrink-0" />
        <span className="text-[11px] text-[#166534] flex-1 truncate">AI: <b>"₹999/mo mein unlimited WA + AI reply"</b></span>
        <button className="text-[10px] font-bold text-[#16a34a] shrink-0">Use</button>
        <button onClick={() => {}} className="text-slate-400 shrink-0"><X size={12} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 my-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[9px] font-semibold text-slate-400">Today</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        {MESSAGES.map(m => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${m.from === "me" ? "bg-[#22c55e] text-white rounded-br-sm" : "bg-white text-slate-800 rounded-bl-sm shadow-sm"}`}>
              <div className="text-[12px] leading-relaxed">{m.text}</div>
              <div className={`flex items-center justify-end gap-1 mt-1 ${m.from === "me" ? "text-green-100" : "text-slate-400"}`}>
                <span className="text-[9px]">{m.time}</span>
                {m.from === "me" && <CheckCheck size={11} className={m.status === "read" ? "text-blue-200" : ""} />}
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
            {[0,1,2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      </div>

      {/* Attach tray */}
      {attach && (
        <div className="bg-white border-t border-slate-100 px-5 py-3 shrink-0">
          <div className="flex justify-around">
            {[[Camera,"Photo","bg-pink-50 text-pink-500"],[Image,"Gallery","bg-purple-50 text-purple-500"],[FileText,"Document","bg-blue-50 text-blue-500"],[Zap,"Template","bg-green-50 text-green-500"]].map(([Icon,label,cls]) => (
              <button key={label as string} onClick={() => setAttach(false)} className="flex flex-col items-center gap-1.5">
                <div className={`h-12 w-12 rounded-2xl ${cls} flex items-center justify-center`}><Icon size={20} /></div>
                <span className="text-[10px] font-semibold text-slate-600">{label as string}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-3 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setAttach(s => !s)} className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full transition ${attach ? "bg-[#22c55e] text-white" : "bg-slate-100 text-slate-500"}`}><Paperclip size={16} /></button>
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message…" className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-400" />
            <button><Smile size={16} className="text-slate-400" /></button>
          </div>
          <button className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full transition ${msg ? "bg-[#22c55e]" : "bg-slate-100"}`}>
            {msg ? <Send size={15} className="text-white" /> : <Mic size={15} className="text-slate-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

function LeadsScreen() {
  const [stage, setStage] = useState("All");
  const stages = ["All","New","Contacted","Qualified","Proposal","Won"];
  const list = stage === "All" ? LEADS : LEADS.filter(l => l.stage === stage);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[19px] font-bold text-slate-900">Leads</span>
          <button className="h-8 w-8 flex items-center justify-center rounded-full bg-[#22c55e]"><Plus size={15} className="text-white" /></button>
        </div>
        {/* Stage strip */}
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden mb-3">
          {[["flex-[2] bg-slate-300"],["flex-[3] bg-blue-400"],["flex-[2] bg-purple-400"],["flex-[2] bg-orange-400"],["flex-[2] bg-[#22c55e]"]].map(([cls],i) => <div key={i} className={cls} />)}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth:"none" }}>
          {stages.map(s => (
            <button key={s} onClick={() => setStage(s)} className={`shrink-0 rounded-xl px-3 py-1 text-[10px] font-bold transition ${stage === s ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Pipeline total */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Total Pipeline</div>
            <div className="text-[22px] font-bold text-white mt-0.5">₹1,55,500</div>
            <div className="flex items-center gap-1 mt-1"><TrendingUp size={11} className="text-[#22c55e]" /><span className="text-[10px] text-[#22c55e] font-semibold">+23% this week</span></div>
          </div>
          <BarChart3 size={36} className="text-white/20" />
        </div>

        {list.map(l => (
          <div key={l.id} className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,.06)] p-4">
            <div className="flex items-start gap-3">
              <Av initials={l.avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{l.name}</div>
                    <div className="text-[11px] text-slate-500">{l.company}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold text-slate-800">{l.value}</div>
                    <div className="text-[10px] text-slate-400">{l.days === 0 ? "Today" : `${l.days}d ago`}</div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${l.stageColor}`}>{l.stage}</span>
                  <div className="flex gap-1.5">
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-green-50 text-green-600"><MessageSquare size={13} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-600"><Phone size={13} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"><MoreVertical size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function NotificationsScreen() {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-4 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[19px] font-bold text-slate-900">Notifications</span>
          <button className="text-[11px] font-bold text-[#16a34a]">Mark all read</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {NOTIFICATIONS.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-4 ${n.unread ? "bg-[#f0fdf4]" : "bg-white"}`}>
              <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl ${n.color}`}><Icon size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-bold text-slate-800">{n.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</div>
              </div>
              {n.unread && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
      <div className="bg-[#0f172a] px-4 pt-5 pb-14 shrink-0">
        <div className="text-[16px] font-bold text-white mb-5">Profile</div>
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 text-[20px] font-bold">AC</div>
          <div className="mt-3 text-[16px] font-bold text-white">Admin User</div>
          <div className="text-[12px] text-slate-400">admin@acmecorp.com</div>
          <div className="mt-2 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 px-3 py-1 text-[10px] font-bold text-[#22c55e]">Business Plan · Active</div>
        </div>
      </div>

      <div className="-mt-8 px-4">
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,.08)] overflow-hidden mb-4">
          {[[Settings,"Account Settings","Profile, password, 2FA"],[Users,"Team Members","4 members · 2 agents"],[Shield,"Security","Sessions, API keys"],[HelpCircle,"Help & Support","Docs, chat, tickets"]].map(([Icon,title,sub]) => (
            <button key={title as string} className="flex w-full items-center gap-3 border-b border-slate-50 px-5 py-4 hover:bg-slate-50 text-left">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Icon size={17} /></div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-800">{title as string}</div>
                <div className="text-[10px] text-slate-400">{sub as string}</div>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,.05)] p-4 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Connected Channels</div>
          {[["💬","WhatsApp","+91 98765 43210"],["📸","Instagram","@acmecorp"],["👍","Facebook","Acme Corp Official"]].map(([e,ch,detail]) => (
            <div key={ch} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 mb-2 last:mb-0">
              <span className="text-[18px]">{e}</span>
              <div className="flex-1"><div className="text-[12px] font-bold text-slate-700">{ch}</div><div className="text-[10px] text-slate-400">{detail}</div></div>
              <span className="text-[10px] font-bold text-green-600">Connected</span>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-[13px] font-bold text-red-500 mb-4">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── BOTTOM TAB BAR ───────────────────────────────────────────────────────────

function TabBar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);
  const tabs: [Screen, typeof MessageSquare, string][] = [
    ["inbox", MessageSquare, "Inbox"],
    ["leads", Users, "Leads"],
    ["notifications", Bell, "Alerts"],
    ["profile", Settings, "Profile"],
  ];
  return (
    <div className="bg-white border-t border-slate-100 flex items-center justify-around px-2 pt-2 pb-5 shrink-0">
      {tabs.map(([s, Icon, label]) => {
        const isActive = active === s || (s === "inbox" && active === "chat");
        return (
          <button key={s} onClick={() => onNav(s)} className="relative flex flex-col items-center gap-0.5 min-w-[60px] py-1">
            <div className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${isActive ? "bg-[#0f172a]" : ""}`}>
              <Icon size={19} className={isActive ? "text-[#22c55e]" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-bold ${isActive ? "text-[#0f172a]" : "text-slate-400"}`}>{label}</span>
            {s === "inbox" && totalUnread > 0 && <span className="absolute top-0 right-2 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-[#ef4444] px-1 text-[8px] font-bold text-white">{totalUnread}</span>}
            {s === "notifications" && <span className="absolute top-0.5 right-2.5 h-2 w-2 rounded-full bg-[#ef4444]" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── PHONE FRAME ─────────────────────────────────────────────────────────────

export default function MobileApp() {
  const [screen, setScreen] = useState<Screen>("inbox");
  const [prev, setPrev]     = useState<Screen>("inbox");

  const nav = (s: Screen) => { setPrev(screen); setScreen(s); };
  const back = () => setScreen(prev === screen ? "inbox" : prev);

  const content = () => {
    switch (screen) {
      case "inbox":         return <InboxScreen onChat={() => nav("chat")} />;
      case "chat":          return <ChatScreen  onBack={() => nav("inbox")} />;
      case "leads":         return <LeadsScreen />;
      case "notifications": return <NotificationsScreen />;
      case "profile":       return <ProfileScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center font-sans py-10">
      <div className="flex flex-col items-center gap-6">

        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-[#22c55e]"><Zap size={14} fill="white" className="text-white" /></div>
            <span className="text-[16px] font-bold text-white">Connectly CRM</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">Mobile</span>
          </div>
          <p className="text-[11px] text-slate-500">Tap pills to switch screens</p>
        </div>

        {/* Phone */}
        <div className="relative" style={{ width: 375, height: 812 }}>
          <div className="absolute inset-0 rounded-[48px] bg-[#1a1a1a] shadow-[0_40px_80px_rgba(0,0,0,.5),0_0_0_1px_rgba(255,255,255,.08)] overflow-hidden">
            <div className="absolute inset-[10px] rounded-[40px] overflow-hidden flex flex-col bg-white">

              {/* Status bar */}
              <div className="flex items-center justify-between px-6 bg-white shrink-0" style={{ paddingTop: 16, paddingBottom: 6 }}>
                <span className="text-[11px] font-semibold text-slate-900">9:41</span>
                <div className="absolute left-1/2 -translate-x-1/2 top-2 h-[22px] w-[110px] rounded-full bg-[#1a1a1a]" />
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-[2px] items-end h-3">
                    {[1,1.5,2,3].map((h,i) => <div key={i} className="w-[3px] rounded-sm bg-slate-900" style={{ height: `${h*4}px` }} />)}
                  </div>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M8 2.5a7 7 0 0 1 4.6 1.7l1-1A8.5 8.5 0 0 0 8 1a8.5 8.5 0 0 0-5.6 2.2l1 1A7 7 0 0 1 8 2.5z" fill="#0f172a"/>
                    <path d="M8 5.5a4 4 0 0 1 2.6 1l1-1A5.5 5.5 0 0 0 8 4a5.5 5.5 0 0 0-3.6 1.5l1 1A4 4 0 0 1 8 5.5z" fill="#0f172a"/>
                    <circle cx="8" cy="10" r="1.5" fill="#0f172a"/>
                  </svg>
                  <div className="flex items-center">
                    <div className="h-[14px] w-[22px] rounded-[4px] border-[1.5px] border-slate-900 p-[2px]">
                      <div className="h-full w-[70%] rounded-sm bg-[#22c55e]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen */}
              <div className="flex-1 overflow-hidden">{content()}</div>

              {/* Tab bar — always visible */}
              <TabBar active={screen} onNav={nav} />
            </div>
          </div>
          {/* Side buttons */}
          <div className="absolute left-[-3px] top-28  h-8  w-1 rounded-l-full bg-[#2a2a2a]" />
          <div className="absolute left-[-3px] top-40  h-12 w-1 rounded-l-full bg-[#2a2a2a]" />
          <div className="absolute left-[-3px] top-56  h-12 w-1 rounded-l-full bg-[#2a2a2a]" />
          <div className="absolute right-[-3px] top-36 h-16 w-1 rounded-r-full bg-[#2a2a2a]" />
        </div>

        {/* Nav pills */}
        <div className="flex gap-2 flex-wrap justify-center">
          {([["inbox","💬 Inbox"],["chat","🗨️ Chat"],["leads","📊 Leads"],["notifications","🔔 Alerts"],["profile","👤 Profile"]] as [Screen,string][]).map(([s,label]) => (
            <button key={s} onClick={() => nav(s)} className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${screen === s ? "bg-[#22c55e] text-white" : "bg-white/10 text-slate-400 hover:bg-white/15 hover:text-white"}`}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
