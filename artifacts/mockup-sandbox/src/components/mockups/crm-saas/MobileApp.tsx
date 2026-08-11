import { useState } from "react";
import {
  Home, MessageSquare, Users, BarChart3, Bell, Search, ChevronRight,
  Phone, Video, MoreVertical, Send, Paperclip, Smile, ArrowLeft,
  Zap, CheckCheck, Clock, Filter, Plus, TrendingUp, TrendingDown,
  Star, Circle, CheckCircle2, Instagram, Facebook, Mic,
  Settings, LogOut, Shield, HelpCircle, ChevronDown, X,
  Image, FileText, Camera,
} from "lucide-react";

// ─── Types & Data ────────────────────────────────────────────────────────────

type Screen = "home" | "inbox" | "chat" | "leads" | "notifications" | "profile";
type Channel = "whatsapp" | "instagram" | "facebook" | "all";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  channel: "whatsapp" | "instagram" | "facebook";
  online: boolean;
  tag?: string;
}

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type?: "text" | "image" | "template";
}

interface Lead {
  id: string;
  name: string;
  company: string;
  value: string;
  stage: string;
  stageColor: string;
  avatar: string;
  daysAgo: number;
}

const CONVERSATIONS: Conversation[] = [
  { id: "c1", name: "Rahul Sharma", avatar: "RS", lastMsg: "Haan bhai, price batao", time: "2m", unread: 3, channel: "whatsapp", online: true, tag: "Hot Lead" },
  { id: "c2", name: "Priya Mehta", avatar: "PM", lastMsg: "Order confirm ho gaya?", time: "15m", unread: 1, channel: "instagram", online: true },
  { id: "c3", name: "Ankit Patel", avatar: "AP", lastMsg: "Thanks! Will check.", time: "1h", unread: 0, channel: "whatsapp", online: false },
  { id: "c4", name: "Sunita Roy", avatar: "SR", lastMsg: "Delivery kab tak?", time: "2h", unread: 2, channel: "facebook", online: false, tag: "Follow-up" },
  { id: "c5", name: "Manish Kumar", avatar: "MK", lastMsg: "Aapka product dekha", time: "3h", unread: 0, channel: "whatsapp", online: false },
  { id: "c6", name: "Deepa Singh", avatar: "DS", lastMsg: "Can I get a discount?", time: "5h", unread: 0, channel: "instagram", online: true },
  { id: "c7", name: "Vikram Nair", avatar: "VN", lastMsg: "Invoice bhej dijiye", time: "1d", unread: 0, channel: "whatsapp", online: false },
];

const MESSAGES: Message[] = [
  { id: "m1", from: "them", text: "Hello! Aapka product dekha Instagram pe, price kya hai?", time: "10:30", status: "read" },
  { id: "m2", from: "me", text: "Namaste Rahul ji! 😊 Hamare plans ₹999/month se shuru hote hain. Kya aap detail mein baat karna chahenge?", time: "10:31", status: "read" },
  { id: "m3", from: "them", text: "Haan bilkul. Features kya kya hain?", time: "10:32", status: "read" },
  { id: "m4", from: "me", text: "WhatsApp + Instagram + Facebook — sab ek jagah. AI auto-reply, lead pipeline, campaigns — poora CRM! 🚀", time: "10:33", status: "read" },
  { id: "m5", from: "them", text: "Trial milega kya?", time: "10:45", status: "read" },
  { id: "m6", from: "me", text: "Haan! 14 days free trial — koi credit card nahi chahiye. Abhi sign up karein 👇", time: "10:46", status: "read" },
  { id: "m7", from: "them", text: "Haan bhai, price batao", time: "11:02", status: "delivered" },
];

const LEADS: Lead[] = [
  { id: "l1", name: "Rahul Sharma", company: "Tech Solutions", value: "₹45,000", stage: "Proposal", stageColor: "bg-purple-100 text-purple-700", avatar: "RS", daysAgo: 2 },
  { id: "l2", name: "Priya Mehta", company: "Fashion Hub", value: "₹12,000", stage: "Qualified", stageColor: "bg-blue-100 text-blue-700", avatar: "PM", daysAgo: 1 },
  { id: "l3", name: "Sunita Roy", company: "Roy Enterprises", value: "₹8,500", stage: "New Lead", stageColor: "bg-slate-100 text-slate-700", avatar: "SR", daysAgo: 0 },
  { id: "l4", name: "Ankit Patel", company: "Patel & Co.", value: "₹67,000", stage: "Won", stageColor: "bg-green-100 text-green-700", avatar: "AP", daysAgo: 5 },
  { id: "l5", name: "Manish Kumar", company: "Kumar Traders", value: "₹23,000", stage: "Contacted", stageColor: "bg-yellow-100 text-yellow-700", avatar: "MK", daysAgo: 3 },
];

const NOTIFICATIONS = [
  { id: "n1", icon: MessageSquare, color: "bg-green-100 text-green-600", title: "New WhatsApp Message", body: "Rahul Sharma: Haan bhai, price batao", time: "2 min ago", unread: true },
  { id: "n2", icon: Users, color: "bg-blue-100 text-blue-600", title: "New Lead Created", body: "Sunita Roy added via Facebook Lead Ad", time: "15 min ago", unread: true },
  { id: "n3", icon: Zap, color: "bg-purple-100 text-purple-600", title: "AI Sequence Triggered", body: "Day 3 follow-up sent to Manish Kumar", time: "1 hr ago", unread: false },
  { id: "n4", icon: Star, color: "bg-yellow-100 text-yellow-600", title: "Deal Won! 🎉", body: "Ankit Patel — ₹67,000 marked as Won", time: "5 hr ago", unread: false },
  { id: "n5", icon: Bell, color: "bg-red-100 text-red-600", title: "Webhook Error", body: "Custom CRM Sync failed — 3 retries", time: "3 hr ago", unread: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ChannelDot({ channel }: { channel: "whatsapp" | "instagram" | "facebook" }) {
  if (channel === "whatsapp") return <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#25d366] text-white text-[7px] font-bold shadow">W</span>;
  if (channel === "instagram") return <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] to-[#dd2a7b] text-white text-[7px] font-bold shadow">I</span>;
  return <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white text-[7px] font-bold shadow">F</span>;
}

function Avatar({ initials, size = "md", color = "bg-slate-200 text-slate-700" }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const s = size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-12 w-12 text-[14px]" : "h-10 w-10 text-[11px]";
  return <div className={`${s} ${color} flex shrink-0 items-center justify-center rounded-full font-bold`}>{initials}</div>;
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#0f172a] px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Good morning 👋</div>
            <div className="text-[18px] font-bold text-white mt-0.5">Acme Corp</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNav("notifications")} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Bell size={17} className="text-white" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ef4444]" />
            </button>
            <button onClick={() => onNav("profile")} className="h-9 w-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 text-[11px] font-bold">AC</button>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "New Leads", value: "24", trend: "+8", up: true },
            { label: "Open Chats", value: "47", trend: "+12", up: true },
            { label: "Won Today", value: "₹1.2L", trend: "+3", up: true },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur">
              <div className="text-[10px] text-slate-400">{s.label}</div>
              <div className="text-[18px] font-bold text-white mt-0.5">{s.value}</div>
              <div className="flex items-center gap-0.5 mt-1">
                {s.up ? <TrendingUp size={10} className="text-[#22c55e]" /> : <TrendingDown size={10} className="text-red-400" />}
                <span className="text-[9px] text-[#22c55e] font-semibold">{s.trend} today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-4">
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,.08)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: MessageSquare, label: "New Chat", color: "bg-green-50 text-green-600", action: () => onNav("inbox") },
              { icon: Users, label: "Add Lead", color: "bg-blue-50 text-blue-600", action: () => onNav("leads") },
              { icon: Zap, label: "Sequence", color: "bg-purple-50 text-purple-600", action: () => {} },
              { icon: BarChart3, label: "Reports", color: "bg-orange-50 text-orange-600", action: () => {} },
            ].map(({ icon: Icon, label, color, action }) => (
              <button key={label} onClick={action} className="flex flex-col items-center gap-1.5">
                <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
                <span className="text-[10px] font-semibold text-slate-600">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold text-slate-800">Recent Conversations</div>
          <button onClick={() => onNav("inbox")} className="text-[11px] font-bold text-[#16a34a]">See all</button>
        </div>
        <div className="space-y-2">
          {CONVERSATIONS.slice(0, 3).map(conv => (
            <button key={conv.id} onClick={() => onNav("chat")} className="w-full flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,.05)] text-left">
              <div className="relative shrink-0">
                <Avatar initials={conv.avatar} color="bg-slate-100 text-slate-700" />
                {conv.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />}
                <ChannelDot channel={conv.channel} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-800">{conv.name}</span>
                  <span className="text-[10px] text-slate-400">{conv.time}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMsg}</div>
              </div>
              {conv.unread > 0 && <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-[9px] font-bold text-white">{conv.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline snapshot */}
      <div className="px-4 mt-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold text-slate-800">Pipeline Today</div>
          <button onClick={() => onNav("leads")} className="text-[11px] font-bold text-[#16a34a]">View all</button>
        </div>
        <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,.05)] p-4">
          <div className="grid grid-cols-4 gap-1 mb-3">
            {[["New", "8", "bg-slate-200"], ["Contact", "12", "bg-blue-200"], ["Qualified", "6", "bg-purple-200"], ["Won", "3", "bg-green-200"]].map(([label, count, bar]) => (
              <div key={label} className="text-center">
                <div className={`h-1.5 rounded-full ${bar} mx-1 mb-1.5`} />
                <div className="text-[14px] font-bold text-slate-700">{count}</div>
                <div className="text-[9px] text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 text-center">₹3.2L total pipeline value</div>
        </div>
      </div>
    </div>
  );
}

function InboxScreen({ onChat }: { onChat: () => void }) {
  const [filter, setFilter] = useState<Channel>("all");
  const [search, setSearch] = useState("");

  const filtered = CONVERSATIONS.filter(c =>
    (filter === "all" || c.channel === filter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-bold text-slate-900">Inbox</div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"><Filter size={15} className="text-slate-600" /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]"><Plus size={15} className="text-white" /></button>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 mb-3">
          <Search size={14} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-400" placeholder="Search conversations…" />
        </div>
        {/* Channel tabs */}
        <div className="flex gap-1">
          {([["all", "All", "👥"], ["whatsapp", "WA", "💬"], ["instagram", "IG", "📸"], ["facebook", "FB", "👍"]] as const).map(([key, label, emoji]) => (
            <button key={key} onClick={() => setFilter(key)} className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${filter === key ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"}`}>
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.map(conv => (
          <button key={conv.id} onClick={onChat} className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 text-left transition">
            <div className="relative shrink-0">
              <Avatar initials={conv.avatar} color={conv.unread > 0 ? "bg-[#dcfce7] text-[#166534]" : "bg-slate-100 text-slate-600"} />
              {conv.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />}
              <ChannelDot channel={conv.channel} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[13px] ${conv.unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{conv.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{conv.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate">{conv.lastMsg}</span>
                {conv.unread > 0 && <span className="ml-2 shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#22c55e] px-1 text-[9px] font-bold text-white">{conv.unread}</span>}
              </div>
              {conv.tag && <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-600">{conv.tag}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ onBack }: { onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const [showAttach, setShowAttach] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#f0f4f8]">
      {/* Chat header */}
      <div className="bg-[#0f172a] px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white"><ArrowLeft size={20} /></button>
          <div className="relative">
            <Avatar initials="RS" size="md" color="bg-green-200 text-green-900" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#0f172a]" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-white">Rahul Sharma</div>
            <div className="text-[10px] text-green-400">Online · WhatsApp</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400"><Phone size={18} /></button>
            <button className="text-slate-400"><Video size={18} /></button>
            <button className="text-slate-400"><MoreVertical size={18} /></button>
          </div>
        </div>
      </div>

      {/* AI suggestion banner */}
      <div className="bg-[#f0fdf4] border-b border-green-100 px-4 py-2 flex items-center gap-2">
        <Zap size={13} className="text-[#22c55e] shrink-0" />
        <span className="text-[11px] text-[#166534] flex-1">AI Suggestion: <span className="font-semibold">"₹999/mo plan mein unlimited WA + AI reply milti hai"</span></span>
        <button className="text-[10px] font-bold text-[#16a34a]">Use</button>
        <button className="text-slate-400"><X size={12} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Date divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[9px] font-semibold text-slate-400 bg-[#f0f4f8] px-2">Today</span>
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

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
            {[0, 1, 2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      </div>

      {/* Attach options */}
      {showAttach && (
        <div className="bg-white border-t border-slate-100 px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            {[[Camera, "Photo", "bg-pink-50 text-pink-600"], [Image, "Gallery", "bg-purple-50 text-purple-600"], [FileText, "Document", "bg-blue-50 text-blue-600"], [Zap, "Template", "bg-green-50 text-green-600"]].map(([Icon, label, color]) => (
              <button key={label as string} onClick={() => setShowAttach(false)} className="flex flex-col items-center gap-1.5">
                <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
                <span className="text-[10px] font-semibold text-slate-600">{label as string}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAttach(s => !s)} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${showAttach ? "bg-[#22c55e] text-white" : "bg-slate-100 text-slate-500"}`}>
            <Paperclip size={16} />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-400" placeholder="Type a message…" />
            <button><Smile size={16} className="text-slate-400" /></button>
          </div>
          <button className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${msg ? "bg-[#22c55e]" : "bg-slate-200"}`}>
            {msg ? <Send size={16} className="text-white" /> : <Mic size={16} className="text-slate-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadsScreen() {
  const [filter, setFilter] = useState("All");

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-bold text-slate-900">Leads</div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]"><Plus size={15} className="text-white" /></button>
        </div>
        {/* Pipeline mini bar */}
        <div className="flex gap-1 mb-3 rounded-xl overflow-hidden h-2">
          <div className="bg-slate-300 flex-[2]" />
          <div className="bg-blue-400 flex-[3]" />
          <div className="bg-purple-400 flex-[2]" />
          <div className="bg-orange-400 flex-[1]" />
          <div className="bg-[#22c55e] flex-[1]" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["All", "New", "Contacted", "Qualified", "Proposal", "Won"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-xl px-3 py-1 text-[10px] font-bold transition ${filter === s ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Total value card */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Total Pipeline</div>
            <div className="text-[22px] font-bold text-white mt-0.5">₹1,55,500</div>
            <div className="text-[10px] text-[#22c55e] mt-1">↑ 23% this week</div>
          </div>
          <BarChart3 size={36} className="text-white/20" />
        </div>

        {LEADS.map(lead => (
          <div key={lead.id} className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,.05)] p-4">
            <div className="flex items-start gap-3">
              <Avatar initials={lead.avatar} color="bg-slate-100 text-slate-700" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{lead.name}</div>
                    <div className="text-[11px] text-slate-500">{lead.company}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold text-slate-800">{lead.value}</div>
                    <div className="text-[10px] text-slate-400">{lead.daysAgo === 0 ? "Today" : `${lead.daysAgo}d ago`}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${lead.stageColor}`}>{lead.stage}</span>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-green-50 text-green-600"><MessageSquare size={12} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-600"><Phone size={12} /></button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-500"><MoreVertical size={12} /></button>
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

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}><ArrowLeft size={20} className="text-slate-700" /></button>
          <div className="text-[18px] font-bold text-slate-900 flex-1">Notifications</div>
          <button className="text-[11px] font-bold text-[#16a34a]">Mark all read</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {NOTIFICATIONS.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-4 border-b border-slate-100 ${n.unread ? "bg-[#f0fdf4]" : "bg-white"}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${n.color}`}><Icon size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[12px] font-bold text-slate-800">{n.title}</div>
                  <div className="text-[10px] text-slate-400 shrink-0">{n.time}</div>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</div>
              </div>
              {n.unread && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-[#0f172a] px-4 pt-5 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}><ArrowLeft size={20} className="text-white" /></button>
          <div className="text-[16px] font-bold text-white flex-1">Profile & Settings</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 text-[20px] font-bold shadow-lg">AC</div>
          <div className="mt-3 text-[16px] font-bold text-white">Admin User</div>
          <div className="text-[12px] text-slate-400">admin@acmecorp.com</div>
          <div className="mt-2 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 px-3 py-1 text-[10px] font-bold text-[#22c55e]">Business Plan · Active</div>
        </div>
      </div>

      <div className="-mt-8 px-4">
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,.08)] overflow-hidden">
          {[
            [Settings, "Account Settings", "Profile, password, 2FA"],
            [Users, "Team Members", "4 members · 2 agents"],
            [Shield, "Security & Privacy", "Sessions, API keys"],
            [HelpCircle, "Help & Support", "Docs, chat, tickets"],
          ].map(([Icon, title, sub]) => (
            <button key={title as string} className="flex w-full items-center gap-3 border-b border-slate-50 px-5 py-4 hover:bg-slate-50 transition text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Icon size={17} /></div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-800">{title as string}</div>
                <div className="text-[10px] text-slate-400">{sub as string}</div>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          ))}
        </div>

        {/* Connected channels */}
        <div className="mt-4 rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,.05)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Connected Channels</div>
          <div className="space-y-2">
            {[
              ["💬", "WhatsApp", "+91 98765 43210", "Connected", "text-green-600"],
              ["📸", "Instagram", "@acmecorp", "Connected", "text-green-600"],
              ["👍", "Facebook", "Acme Corp Official", "Connected", "text-green-600"],
            ].map(([emoji, ch, detail, status, statusColor]) => (
              <div key={ch as string} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <span className="text-[18px]">{emoji}</span>
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-slate-700">{ch as string}</div>
                  <div className="text-[10px] text-slate-400">{detail as string}</div>
                </div>
                <span className={`text-[10px] font-bold ${statusColor}`}>{status as string}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-[13px] font-bold text-red-500">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────

function TabBar({ active, onNav, unreadCount }: { active: Screen; onNav: (s: Screen) => void; unreadCount: number }) {
  const tabs: [Screen, typeof Home, string][] = [
    ["home", Home, "Home"],
    ["inbox", MessageSquare, "Inbox"],
    ["leads", Users, "Leads"],
    ["notifications", Bell, "Alerts"],
  ];
  return (
    <div className="bg-white border-t border-slate-100 px-2 pt-2 pb-4 flex items-center justify-around safe-bottom">
      {tabs.map(([screen, Icon, label]) => {
        const isActive = active === screen || (screen === "inbox" && active === "chat");
        return (
          <button key={screen} onClick={() => onNav(screen)} className="relative flex flex-col items-center gap-0.5 min-w-[52px] py-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${isActive ? "bg-[#0f172a]" : ""}`}>
              <Icon size={19} className={isActive ? "text-[#22c55e]" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-bold transition-colors ${isActive ? "text-[#0f172a]" : "text-slate-400"}`}>{label}</span>
            {screen === "inbox" && unreadCount > 0 && (
              <span className="absolute -top-0.5 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ef4444] px-1 text-[8px] font-bold text-white">{unreadCount}</span>
            )}
            {screen === "notifications" && (
              <span className="absolute -top-0.5 right-1 h-2 w-2 rounded-full bg-[#ef4444]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Phone Frame ─────────────────────────────────────────────────────────────

function PhoneFrame({ children, screen, onNav }: { children: React.ReactNode; screen: Screen; onNav: (s: Screen) => void }) {
  const showTab = !["notifications", "profile"].includes(screen);
  const unreadCount = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="relative mx-auto" style={{ width: 375, height: 812 }}>
      {/* Phone shell */}
      <div className="absolute inset-0 rounded-[48px] bg-[#1a1a1a] shadow-[0_40px_80px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.08)] overflow-hidden">
        {/* Screen area */}
        <div className="absolute inset-[10px] rounded-[40px] overflow-hidden bg-[#f8fafc] flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-white shrink-0" style={{ paddingTop: 14 }}>
            <span className="text-[11px] font-semibold text-slate-900">9:41</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-5 w-[100px] rounded-full bg-[#1a1a1a]" />
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 items-end h-3"><div className="w-0.5 h-1 bg-slate-900 rounded" /><div className="w-0.5 h-1.5 bg-slate-900 rounded" /><div className="w-0.5 h-2 bg-slate-900 rounded" /><div className="w-0.5 h-3 bg-slate-900 rounded" /></div>
              <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2A8.5 8.5 0 0 1 13 4.3l1.2-1.2A10 10 0 0 0 7.5.5a10 10 0 0 0-6.7 2.6L2 4.3A8.5 8.5 0 0 1 7.5 2.2z" fill="#0f172a"/><path d="M7.5 5a5.5 5.5 0 0 1 3.6 1.3l1.2-1.2A7 7 0 0 0 7.5 3.3 7 7 0 0 0 3.7 5.1l1.2 1.2A5.5 5.5 0 0 1 7.5 5z" fill="#0f172a"/><circle cx="7.5" cy="9" r="1.5" fill="#0f172a"/></svg>
              <div className="flex items-center gap-0.5">
                <div className="h-3 w-5.5 rounded-[3px] border border-slate-900 p-px"><div className="h-full w-[80%] rounded-sm bg-[#22c55e]" /></div>
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

          {/* Tab bar */}
          {showTab && <TabBar active={screen} onNav={onNav} unreadCount={unreadCount} />}
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute left-[-3px] top-28 h-8 w-1 rounded-l-full bg-[#2a2a2a]" />
      <div className="absolute left-[-3px] top-40 h-12 w-1 rounded-l-full bg-[#2a2a2a]" />
      <div className="absolute left-[-3px] top-56 h-12 w-1 rounded-l-full bg-[#2a2a2a]" />
      <div className="absolute right-[-3px] top-36 h-16 w-1 rounded-r-full bg-[#2a2a2a]" />
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function MobileApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };

  const goBack = () => setScreen(prevScreen === screen ? "home" : prevScreen);

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen onNav={navigate} />;
      case "inbox": return <InboxScreen onChat={() => navigate("chat")} />;
      case "chat": return <ChatScreen onBack={() => navigate("inbox")} />;
      case "leads": return <LeadsScreen />;
      case "notifications": return <NotificationsScreen onBack={goBack} />;
      case "profile": return <ProfileScreen onBack={goBack} />;
      default: return <HomeScreen onNav={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center font-sans py-12">
      <div className="flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#22c55e]"><Zap size={16} fill="white" className="text-white" /></div>
            <span className="text-[18px] font-bold text-white">Connectly CRM</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">Mobile App</span>
          </div>
          <p className="text-[12px] text-slate-400">Tap the screens below to navigate between screens</p>
        </div>

        {/* Phone */}
        <PhoneFrame screen={screen} onNav={navigate}>
          {renderScreen()}
        </PhoneFrame>

        {/* Screen nav pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {([
            ["home", "🏠 Home"],
            ["inbox", "💬 Inbox"],
            ["chat", "🗨️ Chat"],
            ["leads", "📊 Leads"],
            ["notifications", "🔔 Alerts"],
            ["profile", "👤 Profile"],
          ] as [Screen, string][]).map(([s, label]) => (
            <button
              key={s}
              onClick={() => navigate(s)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${screen === s ? "bg-[#22c55e] text-white" : "bg-white/10 text-slate-400 hover:bg-white/15 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
