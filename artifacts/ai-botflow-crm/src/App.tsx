import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetSession } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import AcceptInvite from '@/pages/auth/AcceptInvite';
import Onboarding from '@/pages/onboarding/Onboarding';
import Dashboard from '@/pages/dashboard/Dashboard';
import Inbox from '@/pages/inbox/Inbox';
import Leads from '@/pages/leads/Leads';
import Contacts from '@/pages/contacts/Contacts';
import Pipeline from '@/pages/pipeline/Pipeline';
import Tasks from '@/pages/tasks/Tasks';
import Flows from '@/pages/flows/Flows';
import Sequences from '@/pages/automation/Sequences';
import Rules from '@/pages/automation/Rules';
import Templates from '@/pages/templates/Templates';
import Campaigns from '@/pages/campaigns/Campaigns';
import Knowledge from '@/pages/knowledge/Knowledge';
import Channels from '@/pages/channels/Channels';
import ChannelDetail from '@/pages/channels/ChannelDetail';
import Team from '@/pages/team/Team';
import Billing from '@/pages/billing/Billing';
import Integrations from '@/pages/integrations/Integrations';
import Settings from '@/pages/settings/Settings';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const isPublicRoute = location === "/" || location === "/login" || location.startsWith("/accept-invite/");

  if (isPublicRoute) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/accept-invite/:token" component={AcceptInvite} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    );
  }

  return (
    <RoutedErrorBoundary>
      <AuthGate>
        <Switch>
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/leads" component={Leads} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/flows" component={Flows} />
          <Route path="/sequences" component={Sequences} />
          <Route path="/rules" component={Rules} />
          <Route path="/templates" component={Templates} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/knowledge" component={Knowledge} />
          <Route path="/channels" component={Channels} />
          <Route path="/channels/:channel" component={ChannelDetail} />
          <Route path="/team" component={Team} />
          <Route path="/billing" component={Billing} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </AuthGate>
    </RoutedErrorBoundary>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = useGetSession();

  useEffect(() => {
    if (!isLoading && !session?.authenticated) {
      setLocation("/login");
    }
  }, [isLoading, session?.authenticated, setLocation]);

  if (isLoading || !session?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" aria-label="Loading workspace" />
      </div>
    );
  }

  return <>{children}</>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
