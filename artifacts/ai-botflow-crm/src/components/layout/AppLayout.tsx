import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getGetSessionQueryKey, useGetWorkspace, useLogout, useGetSession } from "@workspace/api-client-react";
import {
  Zap, LayoutDashboard, Inbox, Users, TrendingUp, GitMerge, CheckSquare,
  MessageSquare, Instagram, Globe, Workflow, Repeat2, SlidersHorizontal,
  Bot, BookOpen, Megaphone, FileText, Clock, Webhook, Code2, FormInput,
  Building2, GraduationCap, BarChart3, UserCog, Settings, ChevronDown,
  ChevronRight, BellRing, Sparkles, CreditCard, LogOut, Menu, Search
} from "lucide-react";

// Nav structure
const NAV = [
  { key: "dashboard", href: "/dashboard", single: true, icon: LayoutDashboard, label: "Dashboard" },
  { key: "inbox", href: "/inbox", single: true, icon: Inbox, label: "Inbox", badge: "12" },
  {
    key: "crm", section: "CRM", icon: Users,
    children: [
      { label: "Contacts", icon: Users, key: "contacts", href: "/contacts" },
      { label: "Leads", icon: TrendingUp, key: "leads", href: "/leads" },
      { label: "Pipeline", icon: GitMerge, key: "pipeline", href: "/pipeline" },
      { label: "Tasks", icon: CheckSquare, key: "tasks", href: "/tasks" },
    ],
  },
  {
    key: "channels", section: "Channels", icon: MessageSquare,
    children: [
      { label: "WhatsApp", icon: MessageSquare, key: "whatsapp", href: "/channels/whatsapp" },
      { label: "Instagram", icon: Instagram, key: "instagram", href: "/channels/instagram" },
      { label: "Facebook", icon: Globe, key: "facebook", href: "/channels/facebook" },
    ],
  },
  {
    key: "automation", section: "Automation", icon: Workflow,
    children: [
      { label: "Flows", icon: Bot, key: "flows", href: "/flows" },
      { label: "Sequences", icon: Repeat2, key: "sequences", href: "/sequences" },
      { label: "Rules", icon: SlidersHorizontal, key: "rules", href: "/rules" },
    ],
  },
  {
    key: "ai", section: "AI", icon: Bot,
    children: [
      { label: "Knowledge Base", icon: BookOpen, key: "knowledge", href: "/knowledge" },
    ],
  },
  {
    key: "campaigns", section: "Campaigns", icon: Megaphone,
    children: [
      { label: "Broadcasts", icon: Megaphone, key: "campaigns_list", href: "/campaigns" },
      { label: "Templates", icon: FileText, key: "templates", href: "/templates" },
    ],
  },
  {
    key: "integrations", section: "Integrations", icon: Webhook,
    children: [
      { label: "Webhooks", icon: Webhook, key: "webhooks", href: "/integrations" },
    ],
  },
  { key: "team", href: "/team", single: true, icon: UserCog, label: "Team" },
  { key: "billing", href: "/billing", single: true, icon: CreditCard, label: "Billing & Wallet" },
  { key: "settings", href: "/settings", single: true, icon: Settings, label: "Settings" },
];

export function Avatar({ initials, tone = "bg-slate-200 text-slate-700" }: { initials: string; tone?: string }) {
  return (
    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${tone}`}>
      {initials}
    </div>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data: session } = useGetSession();
  const initials = session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="h-[60px] px-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-[18px] font-display font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 h-8 w-52">
          <Search size={14} className="text-slate-400" />
          <input className="bg-transparent outline-none text-[11px] w-full text-slate-600" placeholder="Search anything..." />
        </div>
        <button className="relative h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <BellRing size={15} />
          <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-[#ef4444] text-[9px] text-white flex items-center justify-center px-1">3</span>
        </button>
        <Link href="/leads" className="hidden sm:flex items-center gap-1.5 h-8 rounded-xl bg-[#22c55e] px-3 text-[11px] font-bold text-white hover:bg-[#16a34a] transition-colors">
          <Sparkles size={12} /> Create Lead
        </Link>
        <Avatar initials={initials} tone="bg-[#d8e8ff] text-[#245da8]" />
      </div>
    </header>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: workspace } = useGetWorkspace();
  const logout = useLogout();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultOpen = NAV.filter(g => !g.single && g.children?.some(c => location.startsWith(c.href))).map(g => g.key);
  const [openGroups, setOpenGroups] = useState<string[]>(defaultOpen.length ? defaultOpen : ["crm"]);

  const toggleGroup = (key: string) =>
    setOpenGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetSessionQueryKey(), {
          authenticated: false,
          user: null,
          workspace: null,
        });
        queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] !== getGetSessionQueryKey()[0] });
        setLocation("/login");
      }
    });
  };

  // Close mobile sidebar on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const workspaceInitials = workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : "WS";
  const routeTitles: Record<string, [string, string]> = {
    "/inbox": ["Inbox", "Keep every customer conversation moving."],
    "/leads": ["Leads", "Manage your pipeline and track deals."],
    "/flows": ["Flows", "Automate the conversations your team repeats."],
    "/templates": ["Message Templates", "Create reusable, categorized message copy."],
    "/campaigns": ["Campaigns", "Prepare campaign drafts and audiences."],
    "/knowledge": ["Knowledge Base", "Give your AI agents the context they need."],
    "/channels": ["Channels", "Connect the places your customers reach you."],
    "/team": ["Team", "Manage workspace members and permissions."],
    "/billing": ["Billing & Wallet", "Review your plan, wallet ledger, and pricing."],
    "/integrations": ["Integrations", "Connect webhooks and developer tools."],
    "/settings": ["Settings", "Keep your workspace profile up to date."],
  };
  const matchedTitle = Object.entries(routeTitles).find(([route]) => location.startsWith(route));
  const resolvedTitle = title || matchedTitle?.[1]?.[0] || "Ai Botflow CRM";
  const resolvedSubtitle = subtitle || matchedTitle?.[1]?.[1];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f8fb] text-slate-800">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-screen bg-[#0d1829] transition-all duration-200 border-r border-white/5 shrink-0",
        collapsed ? "w-[64px]" : "w-[220px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className={cn("h-[60px] border-b border-white/8 flex items-center shrink-0 gap-2.5", collapsed ? "justify-center px-2" : "px-4")}>
          <div className="h-8 w-8 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
            <Zap size={16} fill="white" className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[13px] font-extrabold text-white tracking-tight leading-tight whitespace-nowrap">Ai Botflow <span className="text-[#4ade80]">CRM</span></div>
              <div className="text-[9px] font-bold text-slate-500 tracking-[.1em] uppercase whitespace-nowrap">Communication OS</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "none" }}>
          {NAV.map(group => {
            if (group.single) {
              const Icon = group.icon!;
              const isActive = location.startsWith(group.href!);
              return (
                <Link key={group.key} href={group.href!} className={cn(
                  "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 mb-0.5 transition-all text-left group",
                  isActive ? "bg-[#1b3b32] text-[#4ade80]" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
                  {!collapsed && <span className="text-[12.5px] font-semibold flex-1 truncate">{group.label}</span>}
                  {!collapsed && group.badge && (
                    <span className="rounded-md bg-[#ef4444] px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">{group.badge}</span>
                  )}
                </Link>
              );
            }

            // Group with children
            const Icon = group.icon!;
            const isOpen = openGroups.includes(group.key);
            const hasActive = group.children!.some(c => location.startsWith(c.href));

            return (
              <div key={group.key} className="mb-0.5">
                <button
                  onClick={() => {
                    if (collapsed) setCollapsed(false);
                    toggleGroup(group.key);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all text-left group",
                    hasActive ? "text-[#4ade80]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Icon size={16} strokeWidth={hasActive ? 2.5 : 1.8} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-[12.5px] font-semibold flex-1 truncate">{group.section}</span>
                      {isOpen
                        ? <ChevronDown size={13} className="shrink-0 text-slate-500 group-hover:text-slate-400" />
                        : <ChevronRight size={13} className="shrink-0 text-slate-500 group-hover:text-slate-400" />
                      }
                    </>
                  )}
                </button>

                {/* Children */}
                {!collapsed && isOpen && (
                  <div className="ml-3 pl-3 border-l border-white/8 mb-1 mt-0.5 space-y-0.5 overflow-hidden">
                    {group.children!.map(child => {
                      const CIcon = child.icon;
                      const isActive = location.startsWith(child.href);
                      return (
                        <Link key={child.key} href={child.href} className={cn(
                          "w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all text-left",
                          isActive ? "bg-[#1b3b32] text-[#4ade80]" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                        )}>
                          <CIcon size={14} strokeWidth={isActive ? 2.5 : 1.8} className="shrink-0" />
                          <span className="text-[12px] font-medium truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 p-2 shrink-0">
          {!collapsed && (
            <div className="rounded-xl bg-[#17253d] border border-white/5 p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {workspaceInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white truncate">{workspace?.name || "Workspace"}</div>
                  <div className="text-[9px] text-slate-500 truncate">{workspace?.slug ? `${workspace.slug}.aibotflow.app` : "aibotflow.app"}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 capitalize">{workspace?.plan || "Growth"} Plan</span>
                <span className="text-[9px] font-bold text-[#4ade80]">● Active</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] text-slate-400 hover:text-red-400 hover:bg-white/5 transition mb-1",
              collapsed && "justify-center"
            )}
          >
            <LogOut size={14} className="shrink-0" />
            {!collapsed && <span className="font-medium">Log out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
          >
            {collapsed ? "→" : <><span>←</span><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white shrink-0">
          <div className="font-display font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            <span>Ai Botflow <span className="text-emerald-500">CRM</span></span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -mr-2">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Desktop Topbar */}
        <div className="hidden md:block">
          <Topbar title={resolvedTitle} subtitle={resolvedSubtitle} />
        </div>
        
        <main className="flex-1 overflow-auto bg-[#f5f8fb] w-full">
          <div className="p-4 md:p-7 max-w-[1600px] mx-auto w-full">
            {/* Mobile Title */}
            <div className="md:hidden mb-6">
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900">{resolvedTitle}</h1>
              {resolvedSubtitle && <p className="text-xs text-slate-500 mt-1">{resolvedSubtitle}</p>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}