import { useState } from "react";
import {
  Zap, LayoutDashboard, Inbox, Users, TrendingUp, GitMerge, CheckSquare,
  MessageSquare, Instagram, Globe, Workflow, Repeat2, SlidersHorizontal,
  Bot, BookOpen, Megaphone, FileText, Clock, Webhook, Code2, FormInput,
  Building2, GraduationCap, BarChart3, UserCog, Settings, ChevronDown,
  ChevronRight, BellRing, Sparkles, CreditCard,
} from "lucide-react";

// ─── Nav structure ─────────────────────────────────────────────────────────────

type NavItem = { label: string; icon: React.ElementType; key: string; badge?: string };
type NavGroup = {
  section?: string;
  emoji?: string;
  icon?: React.ElementType;
  label?: string;
  key: string;
  single?: boolean;
  badge?: string;
  children?: NavItem[];
};

const NAV: NavGroup[] = [
  { key: "dashboard",  single: true,  icon: LayoutDashboard, label: "Dashboard" },
  { key: "inbox",      single: true,  icon: Inbox,           label: "Inbox", badge: "12" },
  {
    key: "crm", section: "CRM", emoji: "👥", icon: Users,
    children: [
      { label: "Contacts", icon: Users,       key: "contacts" },
      { label: "Leads",    icon: TrendingUp,  key: "leads" },
      { label: "Pipeline", icon: GitMerge,    key: "pipeline" },
      { label: "Tasks",    icon: CheckSquare, key: "tasks" },
    ],
  },
  {
    key: "channels", section: "Channels", emoji: "📱", icon: MessageSquare,
    children: [
      { label: "WhatsApp",  icon: MessageSquare, key: "whatsapp" },
      { label: "Instagram", icon: Instagram,     key: "instagram" },
      { label: "Facebook",  icon: Globe,         key: "facebook" },
    ],
  },
  {
    key: "automation", section: "Automation", emoji: "⚡", icon: Workflow,
    children: [
      { label: "Flows",     icon: Workflow,          key: "flows" },
      { label: "Sequences", icon: Repeat2,           key: "sequences" },
      { label: "Rules",     icon: SlidersHorizontal, key: "rules" },
    ],
  },
  {
    key: "ai", section: "AI", emoji: "🤖", icon: Bot,
    children: [
      { label: "Agents",         icon: Bot,      key: "agents" },
      { label: "Knowledge Base", icon: BookOpen, key: "knowledge" },
    ],
  },
  {
    key: "campaigns", section: "Campaigns", emoji: "📢", icon: Megaphone,
    children: [
      { label: "Broadcast",  icon: Megaphone, key: "broadcast" },
      { label: "Templates",  icon: FileText,  key: "templates" },
      { label: "Scheduled",  icon: Clock,     key: "scheduled" },
    ],
  },
  {
    key: "integrations", section: "Integrations", emoji: "🔗", icon: Webhook,
    children: [
      { label: "Webhooks", icon: Webhook,   key: "webhooks" },
      { label: "API",      icon: Code2,     key: "api" },
      { label: "Forms",    icon: FormInput, key: "forms" },
    ],
  },
  {
    key: "business", section: "Business Apps", emoji: "🏢", icon: Building2,
    children: [
      { label: "Academy", icon: GraduationCap, key: "academy" },
    ],
  },
  { key: "analytics", single: true, icon: BarChart3,  label: "Analytics" },
  { key: "team",      single: true, icon: UserCog,    label: "Team" },
  { key: "billing",   single: true, icon: CreditCard, label: "Billing & Wallet" },
  { key: "settings",  single: true, icon: Settings,   label: "Settings" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ active = "dashboard" }: { active?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  // Default open groups based on active item
  const defaultOpen = NAV
    .filter(g => !g.single && g.children?.some(c => c.key === active))
    .map(g => g.key);
  const [openGroups, setOpenGroups] = useState<string[]>(
    defaultOpen.length ? defaultOpen : ["crm"]
  );

  const toggleGroup = (key: string) =>
    setOpenGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const isActive = (key: string) => active === key;
  const groupHasActive = (g: NavGroup) => g.children?.some(c => c.key === active);

  return (
    <aside className={`${collapsed ? "w-[64px]" : "w-[220px]"} shrink-0 bg-[#0d1829] flex min-h-screen flex-col transition-all duration-200 border-r border-white/5`}>

      {/* Logo */}
      <div className={`h-[60px] border-b border-white/8 flex items-center shrink-0 ${collapsed ? "justify-center px-2" : "px-4"} gap-2.5`}>
        <div className="h-8 w-8 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
          <Zap size={16} fill="white" className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-[13px] font-extrabold text-white tracking-tight leading-tight">Ai Botflow <span className="text-[#4ade80]">CRM</span></div>
            <div className="text-[9px] font-bold text-slate-500 tracking-[.1em] uppercase">Communication OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "none" }}>
        {NAV.map(group => {
          if (group.single) {
            const Icon = group.icon!;
            const active_ = isActive(group.key);
            return (
              <button key={group.key} className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 mb-0.5 transition-all text-left ${active_ ? "bg-[#1b3b32] text-[#4ade80]" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
                <Icon size={16} strokeWidth={active_ ? 2.5 : 1.8} className="shrink-0" />
                {!collapsed && <span className="text-[12.5px] font-semibold flex-1">{group.label}</span>}
                {!collapsed && group.badge && (
                  <span className="rounded-md bg-[#ef4444] px-1.5 py-0.5 text-[9px] font-bold text-white">{group.badge}</span>
                )}
              </button>
            );
          }

          // Group with children
          const Icon = group.icon!;
          const isOpen = openGroups.includes(group.key);
          const hasActive = groupHasActive(group);

          return (
            <div key={group.key} className="mb-0.5">
              <button
                onClick={() => !collapsed && toggleGroup(group.key)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all text-left
                  ${hasActive ? "text-[#4ade80]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
              >
                <Icon size={16} strokeWidth={hasActive ? 2.5 : 1.8} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-[12.5px] font-semibold flex-1">{group.section}</span>
                    {isOpen
                      ? <ChevronDown size={13} className="shrink-0 text-slate-500" />
                      : <ChevronRight size={13} className="shrink-0 text-slate-500" />
                    }
                  </>
                )}
              </button>

              {/* Children */}
              {!collapsed && isOpen && (
                <div className="ml-3 pl-3 border-l border-white/8 mb-1 mt-0.5 space-y-0.5">
                  {group.children!.map(child => {
                    const CIcon = child.icon;
                    const active_ = isActive(child.key);
                    return (
                      <button key={child.key} className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all text-left
                        ${active_ ? "bg-[#1b3b32] text-[#4ade80]" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>
                        <CIcon size={14} strokeWidth={active_ ? 2.5 : 1.8} className="shrink-0" />
                        <span className="text-[12px] font-medium">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom — workspace card + collapse */}
      <div className="border-t border-white/8 p-2 shrink-0">
        {!collapsed && (
          <div className="rounded-xl bg-[#17253d] border border-white/5 p-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0">AC</div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-white truncate">Acme Corp</div>
                <div className="text-[9px] text-slate-500 truncate">acme.aibotflow.app</div>
              </div>
              <ChevronDown size={12} className="text-slate-500 shrink-0" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500">Growth Plan</span>
              <span className="text-[9px] font-bold text-[#4ade80]">● Active</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
        >
          {collapsed ? "→" : <><span>←</span><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function Avatar({ initials, tone = "bg-slate-200 text-slate-700" }: { initials: string; tone?: string }) {
  return (
    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${tone}`}>
      {initials}
    </div>
  );
}

export function ChannelIcon({ channel }: { channel: "WhatsApp" | "Instagram" | "Facebook" }) {
  const style =
    channel === "WhatsApp"  ? "bg-[#d9f7e4] text-[#139447]" :
    channel === "Instagram" ? "bg-[#fce1ef] text-[#d94685]" :
                              "bg-[#deebff] text-[#3375d2]";
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${style}`}>
      {channel === "WhatsApp" ? "W" : channel === "Instagram" ? "IG" : "f"}
    </span>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-[60px] px-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 h-8 w-52">
          <span className="text-[11px] text-slate-400">⌕</span>
          <input className="bg-transparent outline-none text-[11px] w-full text-slate-600" placeholder="Search anything..." />
        </div>
        <button className="relative h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <BellRing size={15} />
          <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-[#ef4444] text-[9px] text-white flex items-center justify-center px-1">3</span>
        </button>
        <button className="hidden sm:flex items-center gap-1.5 h-8 rounded-xl bg-[#22c55e] px-3 text-[11px] font-bold text-white hover:bg-[#16a34a]">
          <Sparkles size={12} /> Create Lead
        </button>
        <Avatar initials="RK" tone="bg-[#d8e8ff] text-[#245da8]" />
      </div>
    </header>
  );
}

export default Sidebar;
