import { useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Send,
  SquareArrowOutUpRight,
  Tag,
  X,
  Users,
  Zap,
} from "lucide-react";
import { Sidebar, Topbar, ChannelIcon } from "./_shared/Sidebar";

type Status = "Active" | "Scheduled" | "Completed" | "Draft";
type Campaign = {
  name: string;
  channels: ("WhatsApp" | "Instagram" | "Facebook")[];
  status: Status;
  audience: string;
  metric: string;
  date: string;
};

const campaigns: Campaign[] = [
  { name: "Diwali Sale Offer 2025", channels: ["WhatsApp"], status: "Active", audience: "5,240 contacts", metric: "4,847 delivered · 3,421 read", date: "Oct 20" },
  { name: "Product Launch Announcement", channels: ["WhatsApp", "Instagram"], status: "Scheduled", audience: "3,180 contacts", metric: "Queued for delivery", date: "Nov 1" },
  { name: "Re-engagement Q4", channels: ["WhatsApp"], status: "Active", audience: "8,450 contacts", metric: "6,108 delivered · 2,789 read", date: "Ongoing" },
  { name: "New Feature Update", channels: ["WhatsApp"], status: "Completed", audience: "12,847 contacts", metric: "11,906 delivered · 7,284 read", date: "Oct 1" },
  { name: "Black Friday Early Access", channels: ["WhatsApp"], status: "Scheduled", audience: "6,300 contacts", metric: "Queued for delivery", date: "Nov 28" },
  { name: "Customer Survey", channels: ["WhatsApp", "Facebook"], status: "Draft", audience: "0 contacts", metric: "Not sent", date: "Not set" },
  { name: "Welcome Series Batch", channels: ["WhatsApp"], status: "Completed", audience: "2,100 contacts", metric: "1,988 delivered · 1,105 read", date: "Sep 15" },
];

const statusStyle: Record<Status, string> = {
  Active: "bg-[#e5f8ec] text-[#168044]",
  Scheduled: "bg-[#e8f1ff] text-[#3972c7]",
  Completed: "bg-[#eef1f4] text-[#667085]",
  Draft: "bg-[#fff4dc] text-[#a76708]",
};

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle[status]}`}>
    {status === "Active" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19a653]" />}
    {status === "Scheduled" && <Clock3 size={11} />}
    {status === "Completed" && <Check size={11} />}
    {status === "Draft" && <span className="h-1.5 w-1.5 rounded-full bg-[#d68b17]" />}
    {status}
  </span>;
}

function StatCard({ label, value, change, tone }: { label: string; value: string; change: string; tone: string }) {
  return <div className="rounded-xl border border-[#e4e9ef] bg-white px-4 py-3.5 shadow-[0_2px_12px_rgba(18,36,61,.035)]">
    <div className="flex items-start justify-between"><span className="text-[11px] font-semibold uppercase tracking-[.09em] text-[#8793a4]">{label}</span><span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tone}`}>{change}</span></div>
    <div className="mt-2 font-display text-[27px] font-bold tracking-tight text-[#142238]">{value}</div>
    <div className="mt-0.5 text-[10px] text-[#96a1af]">vs. last month</div>
  </div>;
}

function Funnel() {
  const items = [
    ["Targeted", "5,240", "100%", "bg-[#28435e]"], ["Sent", "5,198", "99.2%", "bg-[#4b7fa8]"],
    ["Delivered", "4,847", "93.3%", "bg-[#3fa879]"], ["Read", "3,421", "65.7%", "bg-[#ebae4c]"],
    ["Replied", "847", "16.3%", "bg-[#e47b62]"], ["Opted Out", "34", "0.7%", "bg-[#9da8b4]"],
  ];
  return <div className="mt-5"><div className="flex h-11 overflow-hidden rounded-lg">
    {items.map(([label, value, pct, color], i) => <div key={label} style={{ width: `${i === 0 ? 24 : i === 1 ? 22 : i === 2 ? 21 : i === 3 ? 17 : i === 4 ? 11 : 5}%` }} className={`${color} flex min-w-0 flex-col justify-center px-2 text-white ${i === 0 ? "rounded-l-lg" : ""}`}>
      <span className="truncate text-[9px] font-semibold opacity-80">{label}</span><span className="truncate text-[12px] font-bold">{value}</span>
    </div>)}
  </div><div className="mt-2 flex justify-between text-[10px] text-[#8290a0]">{items.map(([label, , pct]) => <span key={label} className="text-center">{pct}</span>)}</div></div>;
}

function NewCampaign({ onClose }: { onClose: () => void }) {
  const [channels, setChannels] = useState(["WhatsApp"]);
  const toggle = (channel: string) => setChannels((current) => current.includes(channel) ? current.filter((x) => x !== channel) : [...current, channel]);
  return <div className="absolute inset-y-0 right-0 z-20 w-full max-w-[420px] overflow-y-auto border-l border-[#dce3eb] bg-[#fbfcfd] shadow-[-18px_0_48px_rgba(20,34,56,.16)]">
    <div className="flex items-center justify-between border-b border-[#e4e9ef] bg-white px-6 py-5"><div><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#1e9a52]">Step 1 of 3</div><h2 className="mt-1 font-display text-xl font-bold text-[#142238]">Choose Audience</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[#8290a0] hover:bg-[#f0f3f6]"><X size={18} /></button></div>
    <div className="space-y-6 p-6">
      <label className="block"><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Campaign name</span><input defaultValue="Black Friday Campaign" className="h-10 w-full rounded-lg border border-[#dce3eb] bg-white px-3 text-sm outline-none focus:border-[#29a65a]" /></label>
      <div><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Channel</span><div className="flex gap-2">{["WhatsApp", "Instagram", "Facebook"].map((channel) => <button key={channel} onClick={() => toggle(channel)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${channels.includes(channel) ? "border-[#8bd5a4] bg-[#eaf9ef] text-[#168044]" : "border-[#dce3eb] bg-white text-[#718094]"}`}><ChannelIcon channel={channel as "WhatsApp" | "Instagram" | "Facebook"} />{channel}</button>)}</div></div>
      <label className="block"><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Approved template</span><div className="relative"><select className="h-10 w-full appearance-none rounded-lg border border-[#dce3eb] bg-white px-3 text-sm text-[#455468] outline-none"><option>Black Friday — Early Access</option><option>Diwali Sale Template</option><option>Product Launch Announcement</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-[#8290a0]" /></div></label>
      <div><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-[#3d4a5d]">Include contacts with tags</span><button className="text-xs font-bold text-[#168044]">+ Add</button></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#e9f5ff] px-2.5 py-1 text-[11px] font-semibold text-[#3470ab]">Hot Lead</span><span className="rounded-full bg-[#e9f5ff] px-2.5 py-1 text-[11px] font-semibold text-[#3470ab]">Qualified</span></div></div>
      <div><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Include stages</span><div className="space-y-2">{["New", "Contacted", "Qualified"].map((stage, i) => <label key={stage} className="flex items-center gap-2 text-xs text-[#536174]"><input type="checkbox" defaultChecked={i > 0} className="accent-[#21a45a]" />{stage}</label>)}</div></div>
      <div><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Exclude</span><div className="flex gap-2"><span className="rounded-full bg-[#fbe9e8] px-2.5 py-1 text-[11px] font-semibold text-[#be675c]">Opted out</span><span className="rounded-full bg-[#fbe9e8] px-2.5 py-1 text-[11px] font-semibold text-[#be675c]">Lost</span></div></div>
      <label className="block"><span className="mb-2 block text-xs font-bold text-[#3d4a5d]">Date filter</span><select className="h-10 w-full rounded-lg border border-[#dce3eb] bg-white px-3 text-sm text-[#455468]"><option>Added in last 90 days</option></select></label>
      <div className="rounded-xl border border-[#bde7cb] bg-[#effaf2] p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#168044]"><Users size={15} />Estimated audience</div><div className="mt-1 font-display text-xl font-bold text-[#143d25]">3,240 contacts</div></div>
      <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#22a653] text-sm font-bold text-white shadow-sm hover:bg-[#168b45]">Next: Schedule <SquareArrowOutUpRight size={15} /></button>
    </div>
  </div>;
}

export function Campaigns() {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [paused, setPaused] = useState(false);
  const filtered = useMemo(() => filter === "All" ? campaigns : campaigns.filter((campaign) => campaign.status === filter), [filter]);
  const bars = [25, 18, 14, 21, 100, 53, 31, 24, 36, 48, 68, 39, 58, 44, 82, 57, 38, 29, 20, 17, 14, 10, 7];
  return <div className="flex min-h-[100dvh] bg-[#f4f7fa] text-[#142238]"><Sidebar active="broadcast" /><main className="min-w-0 flex-1"><Topbar title="Campaigns" subtitle="Broadcasts, automation and audience reach" /><div className="relative p-5 md:p-7">
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Total Campaigns" value="47" change="+8.2%" tone="bg-[#e7f8ed] text-[#168044]" /><StatCard label="Active" value="12" change="+3" tone="bg-[#e7f8ed] text-[#168044]" /><StatCard label="Scheduled" value="8" change="+2" tone="bg-[#e8f1ff] text-[#3972c7]" /><StatCard label="Completed" value="27" change="+14.6%" tone="bg-[#fff2dd] text-[#a76708]" /></div>
    <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="min-w-0 rounded-xl border border-[#e1e7ed] bg-white shadow-[0_2px_12px_rgba(18,36,61,.035)]"><div className="flex items-center justify-between border-b border-[#edf0f3] px-4 py-4"><h2 className="font-display text-[15px] font-bold">Broadcasts & Campaigns</h2><button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-lg bg-[#22a653] px-2.5 py-2 text-[10px] font-bold text-white hover:bg-[#168b45]"><Plus size={13} /> New Campaign</button></div>
        <div className="flex gap-1 overflow-x-auto border-b border-[#edf0f3] px-3 pt-3">{["All", "Active", "Scheduled", "Completed", "Draft"].map((tab) => <button key={tab} onClick={() => setFilter(tab)} className={`whitespace-nowrap border-b-2 px-2 pb-3 text-[11px] font-bold ${filter === tab ? "border-[#20a255] text-[#168044]" : "border-transparent text-[#8390a1]"}`}>{tab}{tab !== "All" && <span className="ml-1 text-[10px] font-medium text-[#9ca8b5]">({tab === "Active" ? 12 : tab === "Scheduled" ? 8 : tab === "Completed" ? 27 : 5})</span>}</button>)}</div>
        <div className="divide-y divide-[#eef1f4]">{filtered.map((campaign) => { const index = campaigns.indexOf(campaign); return <button key={campaign.name} onClick={() => setSelected(index)} className={`group w-full p-4 text-left transition-colors ${selected === index ? "bg-[#f0faf3]" : "hover:bg-[#fafcfd]"}`}><div className="flex items-start justify-between gap-2"><span className="truncate text-[13px] font-bold text-[#27364a]">{campaign.name}</span><MoreHorizontal size={16} className="shrink-0 text-[#a3adba] opacity-0 group-hover:opacity-100" /></div><div className="mt-2 flex items-center gap-1">{campaign.channels.map((channel) => <ChannelIcon channel={channel} key={channel} />)}<StatusBadge status={campaign.status} /><span className="ml-auto text-[10px] font-semibold text-[#8592a2]">{campaign.date}</span></div><div className="mt-2 flex items-center justify-between text-[10px] text-[#7c8998]"><span className="font-semibold">{campaign.audience}</span><span className="truncate pl-2">{campaign.metric}</span></div></button>; })}</div>
      </section>
      <section className="min-w-0 space-y-5"><div className="rounded-xl border border-[#e1e7ed] bg-white p-5 shadow-[0_2px_12px_rgba(18,36,61,.035)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-[22px] font-bold tracking-tight">Diwali Sale Offer 2025</h2><StatusBadge status={paused ? "Completed" : "Active"} /></div><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#708094]"><span className="flex items-center gap-1.5"><ChannelIcon channel="WhatsApp" /> WhatsApp Business</span><span className="flex items-center gap-1.5"><Tag size={13} /> Template: <a href="#template" className="font-bold text-[#21874c] underline underline-offset-2">Diwali Sale Template</a></span></div></div><div className="flex gap-2"><button onClick={() => setPaused(!paused)} className="flex items-center gap-1.5 rounded-lg border border-[#dce3eb] px-3 py-2 text-xs font-bold text-[#526174] hover:bg-[#f5f7f9]">{paused ? <Send size={14} /> : <Pause size={14} />}{paused ? "Resume" : "Pause"}</button><button className="rounded-lg border border-[#f0c7c2] px-3 py-2 text-xs font-bold text-[#bf665a] hover:bg-[#fff5f3]">Stop</button></div></div><div className="mt-5 grid gap-3 border-t border-[#edf0f3] pt-4 text-xs sm:grid-cols-2"><div><span className="text-[#98a3b0]">Scheduled</span><div className="mt-1 font-semibold text-[#435166]">Oct 20, 2025 · 10:00 AM IST</div></div><div><span className="text-[#98a3b0]">Sent by</span><div className="mt-1 font-semibold text-[#435166]">Rahul K.</div></div></div><Funnel /></div>
        <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-xl border border-[#e1e7ed] bg-white p-5 shadow-[0_2px_12px_rgba(18,36,61,.035)]"><div className="flex items-center justify-between"><h3 className="font-display text-[15px] font-bold">Audience Filters Applied</h3><Users size={16} className="text-[#7a899a]" /></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-[#8793a2]">Tag</span><span className="rounded-full bg-[#e9f5ff] px-2 py-1 font-semibold text-[#3470ab]">Diwali-prospects</span></div><div className="flex justify-between gap-3"><span className="text-[#8793a2]">Stage</span><span className="text-right font-semibold text-[#4e5d70]">Qualified, Proposal Sent</span></div><div className="flex justify-between"><span className="text-[#8793a2]">Last active</span><span className="font-semibold text-[#4e5d70]">Within 90 days</span></div><div className="flex justify-between"><span className="text-[#8793a2]">Excluded</span><span className="text-right font-semibold text-[#bf665a]">Opted out, Lost</span></div></div><div className="mt-5 border-t border-[#edf0f3] pt-4"><span className="text-[11px] text-[#8793a2]">Total matched</span><div className="mt-1 font-display text-xl font-bold text-[#142238]">5,240 <span className="font-sans text-xs font-medium text-[#8793a2]">contacts</span></div></div></div>
          <div className="rounded-xl border border-[#e1e7ed] bg-white p-5 shadow-[0_2px_12px_rgba(18,36,61,.035)]"><div className="flex items-center justify-between"><h3 className="font-display text-[15px] font-bold">Send Timeline</h3><span className="text-[10px] font-semibold text-[#8793a2]">Messages / hour</span></div><div className="mt-4 flex h-[126px] items-end gap-1 border-b border-l border-[#e3e8ed] pl-3 pr-1">{bars.map((height, i) => <div key={i} className="group relative flex-1"><div style={{ height: `${height}%` }} className={`w-full rounded-t-sm ${i === 4 ? "bg-[#1fa45a]" : i === 14 ? "bg-[#65bc83]" : "bg-[#b8dec6]"}`} /></div>)}</div><div className="mt-2 flex justify-between pl-3 text-[9px] text-[#97a3af]"><span>8am</span><span>10am</span><span>12pm</span><span>2pm</span><span>4pm</span><span>6pm</span><span>8pm</span></div><div className="mt-2 flex gap-4 text-[10px] text-[#8793a2]"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#1fa45a]" /> Peak 1,200</span><span>Avg. 408 / hr</span></div></div></div>
        <div className="overflow-hidden rounded-xl border border-[#e1e7ed] bg-white shadow-[0_2px_12px_rgba(18,36,61,.035)]"><div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-4"><div><h3 className="font-display text-[15px] font-bold">Reply Tracking</h3><p className="mt-0.5 text-[10px] text-[#8995a3]">847 replies captured from this campaign</p></div><button className="flex items-center gap-1 text-xs font-bold text-[#21874c]">View all <SquareArrowOutUpRight size={13} /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f8fafb] text-[10px] uppercase tracking-[.08em] text-[#95a0ad]"><tr><th className="px-5 py-3 font-bold">Contact</th><th className="px-3 py-3 font-bold">Replied</th><th className="px-3 py-3 font-bold">Reply content</th><th className="px-3 py-3 font-bold">Stage</th><th className="px-5 py-3 font-bold">Action taken</th></tr></thead><tbody className="divide-y divide-[#eef1f4]">{[["Priya Sharma","Yes!","I want the Diwali offer","Qualified","Assigned to Rahul"],["Noah Williams","Price?","What is the discount?","Contacted","AI replied"],["Aarav Mehta","Not interested","Please don't message","Lost","Opted out"],["Sofia Laurent","Tell me more","What products?","New","AI replied"],["Liam Chen","Book demo","Can we do a call?","Proposal","Demo scheduled"]].map((row) => <tr key={row[0]} className="hover:bg-[#fbfcfd]"><td className="whitespace-nowrap px-5 py-3 font-bold text-[#344258]">{row[0]}</td><td className="whitespace-nowrap px-3 py-3 font-semibold text-[#168044]">{row[1]}</td><td className="px-3 py-3 text-[#677589]">{row[2]}</td><td className="px-3 py-3"><span className="rounded-full bg-[#eef3f7] px-2 py-1 text-[10px] font-semibold text-[#566579]">{row[3]}</span></td><td className="whitespace-nowrap px-5 py-3 text-[#677589]">{row[4]}</td></tr>)}</tbody></table></div></div>
      </section>
    </div>
    {showNew && <NewCampaign onClose={() => setShowNew(false)} />}
  </div></main></div>;
}