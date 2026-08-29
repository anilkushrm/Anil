import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getGetSessionQueryKey, useGetWorkspace, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Bot, 
  FileText, 
  Megaphone, 
  BookOpen, 
  Share2, 
  Settings,
  CreditCard,
  Blocks,
  LogOut
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: workspace } = useGetWorkspace();
  const logout = useLogout();

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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inbox", href: "/inbox", icon: MessageSquare },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Flows", href: "/flows", icon: Bot },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Knowledge", href: "/knowledge", icon: BookOpen },
    { name: "Channels", href: "/channels", icon: Share2 },
    { name: "Team", href: "/team", icon: Users },
  ];

  const bottomItems = [
    { name: "Integrations", href: "/integrations", icon: Blocks },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="font-bold text-lg text-primary flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>Ai Botflow <span className="text-emerald-500">CRM</span></span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              {workspace?.name || "Workspace"}
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className="block">
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        isActive 
                          ? "bg-sidebar-primary/10 text-sidebar-primary" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      data-testid={`nav-${item.name.toLowerCase()}`}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary" : "text-muted-foreground")} />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className="block">
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-sidebar-primary/10 text-sidebar-primary" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Log out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-border flex items-center px-4 justify-between bg-card">
          <div className="font-bold text-primary flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span>Ai Botflow <span className="text-emerald-500">CRM</span></span>
          </div>
        </div>
        
        <main className="flex-1 overflow-auto bg-background p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
