import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Megaphone, Target, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const metrics = dashboard?.metrics || { leads: 0, messages: 0, contacts: 0, campaigns: 0 };
  const pipeline = dashboard?.pipeline || [];
  const activity = dashboard?.recentActivity || [];

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your workspace today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.leads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.contacts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.messages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.campaigns}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipeline.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No pipeline data yet. Create leads to populate.
                  </div>
                ) : (
                  pipeline.map((stage) => (
                    <div key={stage.stage} className="flex items-center">
                      <div className="w-32 text-sm font-medium capitalize">{stage.stage}</div>
                      <div className="flex-1 px-4">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.max(10, Math.min(100, (stage.count / Math.max(...pipeline.map(p => p.count))) * 100))}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm text-muted-foreground">
                        ${stage.value.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent activity.
                  </div>
                ) : (
                  activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{act.title}</p>
                        <p className="text-sm text-muted-foreground">{act.detail}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
