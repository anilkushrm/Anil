import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboard, useGetSession } from "@workspace/api-client-react";
import { ArrowUpRight, Bell, Clock3, MessageCircle, MoreHorizontal, Tag, TrendingUp, Users, Megaphone } from "lucide-react";

const STAGES = {
  new: { label: "New", color: "#3b82f6" },
  contacted: { label: "Contacted", color: "#eab308" },
  qualified: { label: "Qualified", color: "#8b5cf6" },
  proposal: { label: "Proposal", color: "#f97316" },
  won: { label: "Won", color: "#22c55e" },
  lost: { label: "Lost", color: "#ef4444" }
};

function SparkleIcon() {
  return (
    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center">
      <TrendingUp size={14} className="text-slate-500"/>
    </span>
  );
}

export default function Dashboard() {
  const { data: session } = useGetSession();
  const { data: dashboard, isLoading } = useGetDashboard();

  const userName = session?.user?.name ? session.user.name.split(" ")[0] : "User";

  if (isLoading) {
    return (
      <AppLayout title={`Good morning, ${userName}`} subtitle="Here's what's happening across your customer conversations.">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/60 rounded-xl border border-slate-200"></div>)}
          </div>
          <div className="grid xl:grid-cols-[1.45fr_1fr] gap-5">
             <div className="h-64 bg-white/60 rounded-xl border border-slate-200"></div>
             <div className="h-64 bg-white/60 rounded-xl border border-slate-200"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const metrics = dashboard?.metrics || { leads: 0, messages: 0, contacts: 0, campaigns: 0 };
  const pipeline = dashboard?.pipeline || [];
  const activity = dashboard?.recentActivity || [];

  const metricsData = [
    ["Total Leads", metrics.leads.toLocaleString(), "This week", TrendingUp, "#e7f8ed", "text-[#159447]"],
    ["Messages Sent", metrics.messages.toLocaleString(), "This week", MessageCircle, "#e2f4ff", "text-[#2188c9]"],
    ["Active Contacts", metrics.contacts.toLocaleString(), "This week", Users, "#f0eaff", "text-[#7950cc]"],
    ["Campaigns Running", metrics.campaigns.toLocaleString(), "Active", Bell, "#fff0dd", "text-[#d8871a]"]
  ] as const;

  const maxPipelineCount = Math.max(...pipeline.map(p => p.count), 1);

  return (
    <AppLayout title={`Good morning, ${userName}`} subtitle="Here's what's happening across your customer conversations.">
      <div className="space-y-6">
        
        {/* Metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metricsData.map(([name,num,delta,Icon,bg,color]) => (
            <div className="bg-white rounded-xl border border-slate-200 panel-shadow p-5 hover:border-slate-300 transition-colors" key={name as string}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{name as string}</span>
                <span style={{background:bg as string}} className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={16}/>
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="font-display font-bold text-2xl text-slate-900">{num as string}</div>
                  <div className={`mt-1 text-[11px] font-semibold ${name === "Campaigns Running" ? "text-amber-600" : "text-[#159447]"}`}>
                    <ArrowUpRight size={12} className="inline"/> {delta as string}
                  </div>
                </div>
                <div className="flex items-end gap-1 h-9 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                  {[12,17,14,22,18,27,25,34].map((h,i)=>
                    <i key={i} style={{height:h}} className={`w-1 rounded-full ${name === "Campaigns Running" ? "bg-amber-200" : "bg-[#9de8b8]"}`}/>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline & Channel Breakdown */}
        <div className="grid xl:grid-cols-[1.45fr_1fr] gap-5">
          <section className="bg-white border border-slate-200 rounded-xl panel-shadow overflow-hidden flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <div>
                <h2 className="font-display font-bold text-slate-900">Lead Pipeline Overview</h2>
                <p className="text-xs text-slate-500 mt-1">A live view of your lead movement</p>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-end min-h-[220px]">
              <div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-slate-100 pb-0 w-full">
                {pipeline.length === 0 ? (
                  <div className="w-full text-center text-sm text-slate-500 pb-6 flex items-center justify-center h-full">No pipeline data available.</div>
                ) : pipeline.map(p => {
                  const stageInfo = STAGES[p.stage as keyof typeof STAGES] || { label: p.stage, color: "#94a3b8" };
                  const height = (p.count / maxPipelineCount) * 125;
                  return (
                    <div className="flex-1 h-full flex flex-col justify-end items-center gap-2 group" key={p.stage}>
                      <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{p.count}</span>
                      <div style={{height: `${Math.max(4, height)}px`, background: stageInfo.color}} className="w-full max-w-[58px] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"/>
                      <span className="text-[10px] text-slate-500 mb-3 capitalize font-medium">{stageInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          <section className="bg-white border border-slate-200 rounded-xl panel-shadow p-5 flex flex-col">
            <div className="flex justify-between">
              <div>
                <h2 className="font-display font-bold text-slate-900">Channel Breakdown</h2>
                <p className="text-xs text-slate-500 mt-1">Conversations by source</p>
              </div>
              <MoreHorizontal size={18} className="text-slate-400"/>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center mt-5 py-6">
               <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                 <MessageCircle size={24} className="text-slate-300" />
               </div>
               <div className="text-sm font-semibold text-slate-700">No channel analytics</div>
               <div className="text-xs text-slate-400 mt-1">Data will appear here once connected.</div>
            </div>
          </section>
        </div>

        {/* Recent Activity & Right Column */}
        <div className="grid xl:grid-cols-[1.45fr_1fr] gap-5">
          
          <section className="bg-white border border-slate-200 rounded-xl panel-shadow overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-5 flex justify-between items-center">
              <h2 className="font-display font-bold text-slate-900">Recent Activity</h2>
            </div>
            <div className="overflow-x-auto flex-1 border-t border-slate-100">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-bold border-b border-slate-100">Activity</th>
                    <th className="px-5 py-3 font-bold border-b border-slate-100">Details</th>
                    <th className="px-5 py-3 font-bold border-b border-slate-100 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center">
                        <div className="text-sm text-slate-500">No recent activity</div>
                      </td>
                    </tr>
                  ) : activity.map(act => (
                    <tr className="border-b border-slate-50 text-xs hover:bg-slate-50/80 transition-colors" key={act.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                           <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <ArrowUpRight size={12} className="text-blue-500" />
                           </div>
                           <span className="font-semibold text-slate-700">{act.title}</span>
                        </div>
                      </td>
                      <td className="px-5 max-w-[250px] truncate text-slate-500">{act.detail}</td>
                      <td className="px-5 text-slate-400 text-right whitespace-nowrap">{new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-xl panel-shadow p-5">
              <div className="flex justify-between">
                <h2 className="font-display font-bold text-slate-900">Upcoming Follow-ups</h2>
                <Clock3 size={17} className="text-slate-400"/>
              </div>
              <div className="mt-3 flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <Clock3 size={24} className="text-slate-300 mb-2"/>
                <div className="text-sm font-semibold text-slate-700">No pending follow-ups</div>
                <div className="text-xs text-slate-400 mt-1">Your schedule is clear.</div>
              </div>
            </section>
            
            <section className="bg-white border border-slate-200 rounded-xl panel-shadow p-5">
              <h2 className="font-display font-bold text-slate-900">Campaign Performance</h2>
              <div className="mt-3 flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <Megaphone size={24} className="text-slate-300 mb-2" />
                <div className="text-sm font-semibold text-slate-700">No active campaigns</div>
                <div className="text-xs text-slate-400 mt-1">Create a broadcast to see stats here.</div>
              </div>
            </section>
          </div>
          
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5">
          <section className="rounded-xl border border-slate-200 bg-white panel-shadow p-5">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <SparkleIcon/><span>AI Reply Suggestions</span>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Not configured</span>
            </div>
            <div className="mt-4 text-xs text-slate-500 flex items-center justify-center py-5 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              Connect your knowledge base to enable automated reply suggestions across your channels.
            </div>
          </section>
          
          <section className="bg-white border border-slate-200 rounded-xl panel-shadow p-5">
            <h2 className="font-display font-bold text-sm text-slate-900">Top Tags</h2>
            <div className="flex flex-col items-center justify-center py-5 text-center mt-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <Tag size={20} className="text-slate-300 mb-2"/>
              <div className="text-xs text-slate-400">Apply tags to leads to see them here.</div>
            </div>
          </section>
        </div>

      </div>
    </AppLayout>
  );
}