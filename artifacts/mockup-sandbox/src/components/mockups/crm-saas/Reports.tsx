import { useMemo, useState, type ReactNode } from "react";
import { Download, FileBarChart2, Filter, Info, TrendingDown, TrendingUp } from "lucide-react";
import { Sidebar, Topbar } from "./_shared/Sidebar";

type Channel = "All Channels" | "WhatsApp" | "Instagram" | "Facebook";

const kpis = [
  { label: "Total Messages", value: "48,291", change: "12.5%", detail: "vs. previous period", color: "text-[#159447]", icon: TrendingUp },
  { label: "Leads Generated", value: "2,847", change: "8.2%", detail: "vs. previous period", color: "text-[#159447]", icon: TrendingUp },
  { label: "AI Replies Sent", value: "14,382", change: "31.4%", detail: "vs. previous period", color: "text-[#8c62d8]", icon: TrendingUp, purple: true },
  { label: "Avg Response Time", value: "1.8 min", change: "22%", detail: "faster than last period", color: "text-[#159447]", icon: TrendingDown },
  { label: "Revenue Attributed", value: "₹24,80,000", change: "18.7%", detail: "vs. previous period", color: "text-[#159447]", icon: TrendingUp },
];

const agentRows = [
  ["Rahul K.", "RK", "847", "821", "1.2m", "4.9", "bg-[#f8d778] text-[#72510c]"],
  ["Amara L.", "AL", "734", "698", "1.8m", "4.8", "bg-[#dbe4ec] text-[#526274]"],
  ["Meera T.", "MT", "612", "589", "2.1m", "4.7", "bg-[#e8c3a6] text-[#8c512b]"],
  ["Dev P.", "DP", "498", "461", "2.8m", "4.5", ""],
  ["Sofia K.", "SK", "387", "354", "3.2m", "4.3", ""],
];

const aiRows = [
  ["Priya Sharma", "What are your pricing plans?", "We have Starter ($29)...", "98%", "Lead Qualified", "bg-[#dcf6e6] text-[#168148]"],
  ["Noah W.", "Do you integrate with Shopify?", "Yes! We support...", "91%", "Continued", "bg-[#e5efff] text-[#316dbd]"],
  ["Aarav M.", "I need to cancel my order", "I'll connect you with...", "45%", "Human Takeover", "bg-[#fff0d9] text-[#ae6a16]"],
  ["Sofia L.", "What's your refund policy?", "Our refund policy...", "87%", "Resolved", "bg-[#dcf6e6] text-[#168148]"],
  ["Liam C.", "Can I see a demo?", "Absolutely! I'll...", "96%", "Demo Booked", "bg-[#eee7ff] text-[#7550b9]"],
];

const campaigns = [
  ["Diwali Sale", "18,450", "17,982", "14,841", "2,193", "126", "384", "₹8,42,400"],
  ["Product Launch", "12,800", "12,564", "9,846", "1,472", "72", "218", "₹5,76,800"],
  ["Re-engagement", "8,240", "7,918", "5,228", "846", "98", "106", "₹2,93,600"],
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[#dfe6e1] bg-white panel-shadow ${className}`}>{children}</section>;
}

function LineChart() {
  const labels = ["Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9"];
  return (
    <div className="relative mt-5 h-[238px]">
      <div className="absolute right-0 top-0 flex items-center gap-4 text-[10px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#25ba63]" />WhatsApp</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#e05b9d]" />Instagram</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#4a88df]" />Facebook</span>
      </div>
      <svg viewBox="0 0 700 220" className="absolute inset-x-0 bottom-5 h-[205px] w-full overflow-visible" preserveAspectRatio="none" aria-label="Message volume line chart">
        {[28, 74, 120, 166, 212].map((y) => <line key={y} x1="42" y1={y} x2="682" y2={y} stroke="#edf1ee" strokeWidth="1" />)}
        <path d="M42 181 L96 158 L150 164 L204 131 L258 145 L312 101 L366 112 L420 79 L474 94 L528 57 L582 72 L636 42 L682 52 L682 212 L42 212 Z" fill="#25ba63" fillOpacity=".09" />
        <path d="M42 181 L96 158 L150 164 L204 131 L258 145 L312 101 L366 112 L420 79 L474 94 L528 57 L582 72 L636 42 L682 52" fill="none" stroke="#25ba63" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42 198 L96 191 L150 194 L204 178 L258 188 L312 166 L366 173 L420 147 L474 158 L528 137 L582 146 L636 124 L682 135 L682 212 L42 212 Z" fill="#e05b9d" fillOpacity=".06" />
        <path d="M42 198 L96 191 L150 194 L204 178 L258 188 L312 166 L366 173 L420 147 L474 158 L528 137 L582 146 L636 124 L682 135" fill="none" stroke="#e05b9d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 207 L96 202 L150 204 L204 195 L258 201 L312 188 L366 193 L420 181 L474 186 L528 173 L582 179 L636 167 L682 173" fill="none" stroke="#4a88df" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="212" x2="682" y2="212" stroke="#cfd9d3" />
        {labels.map((label, i) => <text key={label} x={42 + i * 160} y="232" fill="#87938e" fontSize="10" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{label}</text>)}
      </svg>
      <div className="absolute left-0 top-5 flex h-[183px] flex-col justify-between text-[9px] text-slate-400"><span>2.4k</span><span>1.8k</span><span>1.2k</span><span>600</span><span>0</span></div>
    </div>
  );
}

function Funnel() {
  const data = [
    ["Leads Received", "2,847", "100%", "w-full", "from-[#4f8ee7] to-[#76a9ef]"],
    ["Contacted", "2,180", "76.6%", "w-[76.6%]", "from-[#5b9ae6] to-[#88b8ee]"],
    ["Qualified", "1,240", "43.6%", "w-[43.6%]", "from-[#55a9bf] to-[#82c8d3]"],
    ["Proposal Sent", "687", "24.1%", "w-[24.1%]", "from-[#55b894] to-[#8dd8ab]"],
    ["Won / Closed", "312", "11%", "w-[11%]", "from-[#27b961] to-[#6cd389]"],
  ];
  return <div className="mt-4 space-y-3">{data.map(([label, number, percent, width, gradient]) => <div key={label}><div className="mb-1.5 flex items-center justify-between text-[11px]"><span className="font-medium text-slate-600">{label}</span><span className="font-semibold text-slate-800">{number} <em className="ml-1 not-italic font-normal text-slate-400">({percent})</em></span></div><div className="h-7 rounded-md bg-[#f1f5f2]"><div className={`h-full rounded-md bg-gradient-to-r ${gradient} ${width}`} /></div></div>)}<div className="mt-4 flex items-center gap-2 rounded-lg border border-[#f7d8d3] bg-[#fff7f5] px-3 py-2 text-[11px] text-[#c75d4c]"><span className="h-2 w-2 rounded-full bg-[#ee7965]" /><span className="font-medium">Lost</span><span className="ml-auto font-semibold">234 <span className="font-normal text-[#d58a7d]">(8.2%)</span></span></div></div>;
}

export function Reports() {
  const [range, setRange] = useState("30 Days");
  const [channel, setChannel] = useState<Channel>("All Channels");
  const [exported, setExported] = useState(false);
  const dateRanges = ["Today", "7 Days", "30 Days", "90 Days", "Custom"];
  const channelOptions: Channel[] = ["All Channels", "WhatsApp", "Instagram", "Facebook"];
  const totals = useMemo(() => ["39,490", "38,464", "29,915", "4,511", "296", "708", "₹17,12,800"], []);
  const handleExport = () => {
    const csv = "Campaign,Sent,Delivered,Read,Replied,Opt-outs,Conversions,Revenue\n" + campaigns.map((row) => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "connectly-campaign-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setExported(true);
    window.setTimeout(() => setExported(false), 2200);
  };
  return <div className="flex min-h-[100dvh] bg-[#f5f8f5] text-[#18241f]"><Sidebar active="Reports" /><main className="min-w-0 flex-1 overflow-y-auto"><Topbar title="Reports & Analytics" subtitle="Understand the conversations that move your business forward." /><div className="space-y-5 px-5 py-6 md:px-7">
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center"><div className="flex flex-wrap items-center gap-2"><div className="mr-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-slate-400"><Filter size={14} />Period</div>{dateRanges.map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg border px-3.5 py-2 text-[11px] font-semibold transition-colors ${range === item ? "border-[#b8e7c7] bg-[#ddf7e5] text-[#168148]" : "border-[#dfe6e1] bg-white text-slate-500 hover:bg-slate-50"}`}>{item}</button>)}</div><div className="flex flex-wrap items-center gap-2"><div className="flex flex-wrap rounded-lg border border-[#dfe6e1] bg-white p-1">{channelOptions.map((item) => <button key={item} onClick={() => setChannel(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${channel === item ? "bg-[#182c23] text-white" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}</div><button onClick={handleExport} className="flex h-9 items-center gap-2 rounded-lg border border-[#bfd7c6] bg-white px-3 text-[11px] font-bold text-[#1a7c46] hover:bg-[#f0faf3]"><Download size={14} />{exported ? "Exported" : "Export CSV"}</button></div></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{kpis.map(({ label, value, change, detail, color, icon: Icon, purple }) => <Card key={label} className={`relative overflow-hidden p-4 ${purple ? "bg-[#fbf9ff]" : ""}`}><div className="flex items-start justify-between"><span className="text-[11px] font-semibold text-slate-500">{label}</span><span className={`rounded-md p-1.5 ${purple ? "bg-[#eee7ff] text-[#855bd0]" : "bg-[#e8f8ec] text-[#239452]"}`}><Icon size={14} /></span></div><div className="mt-3 font-display text-[24px] font-bold tracking-tight text-slate-900">{value}</div><div className={`mt-1 flex items-center gap-1 text-[10px] font-bold ${color}`}>{Icon === TrendingDown ? "↓" : "↑"} {change}<span className="font-normal text-slate-400"> {detail}</span></div></Card>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]"><Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-[15px] font-bold text-slate-900">Message Volume Over Time</h2><p className="mt-1 text-[11px] text-slate-400">Daily inbound and outbound conversations</p></div><span className="rounded-md bg-[#f2f7f3] px-2 py-1 text-[10px] font-semibold text-[#4c7960]">{range}</span></div><LineChart /></Card><Card className="p-5"><h2 className="font-display text-[15px] font-bold text-slate-900">Channel Distribution</h2><p className="mt-1 text-[11px] text-slate-400">Share of average daily conversations</p><div className="flex items-center justify-center py-5"><div className="relative h-40 w-40 rounded-full" style={{ background: "conic-gradient(#25ba63 0 58%, #e05b9d 58% 85%, #4a88df 85% 100%)" }}><div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white"><strong className="font-display text-[20px] font-bold text-slate-900">2.8k</strong><span className="text-[10px] text-slate-400">total / day</span></div></div></div><div className="grid grid-cols-3 gap-2 border-t border-[#edf1ee] pt-4">{[["WhatsApp","58%","#25ba63"],["Instagram","27%","#e05b9d"],["Facebook","15%","#4a88df"]].map(([name, percent, color]) => <div key={name}><div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><i className="h-2 w-2 rounded-full" style={{ background: color }} />{name}</div><div className="mt-1 font-display text-[17px] font-bold text-slate-900">{percent}</div></div>)}</div></Card></div>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-[15px] font-bold text-slate-900">Lead Conversion Funnel</h2><p className="mt-1 text-[11px] text-slate-400">From first message to closed deal</p></div><Info size={15} className="text-slate-400" /></div><Funnel /></Card><Card className="overflow-hidden"><div className="p-5 pb-3"><h2 className="font-display text-[15px] font-bold text-slate-900">Top Agents — This Month</h2><p className="mt-1 text-[11px] text-slate-400">Ranked by resolved conversations</p></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[11px]"><thead className="border-y border-[#edf1ee] bg-[#f8faf8] text-[9px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-2.5">#</th><th className="py-2.5">Agent</th><th className="py-2.5">Handled</th><th className="py-2.5">Resolved</th><th className="py-2.5">Avg time</th><th className="py-2.5 pr-5">Rating</th></tr></thead><tbody>{agentRows.map(([name, initials, handled, resolved, time, rating, badge], i) => <tr key={name} className="border-b border-[#f0f3f1] last:border-0"><td className="px-5 py-3 font-semibold text-slate-400">{i + 1}</td><td className="py-3"><div className="flex items-center gap-2"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${badge || "bg-[#edf2ef] text-[#5d7566]"}`}>{initials}</span><span className="font-semibold text-slate-700">{name}</span></div></td><td className="py-3 text-slate-500">{handled}</td><td className="py-3"><div className="flex items-center gap-2"><span className="text-slate-700">{resolved}</span><span className="h-1.5 w-12 rounded-full bg-[#edf1ee]"><span className="block h-full rounded-full bg-[#46bf75]" style={{ width: `${Math.round(Number(resolved.replace(",", "")) / 847 * 100)}%` }} /></span></div></td><td className="py-3 text-slate-500">{time}</td><td className="py-3 pr-5 font-semibold text-[#bd8c22]">★{rating}</td></tr>)}</tbody></table></div></Card></div>
    <Card className="overflow-hidden"><div className="flex flex-col justify-between gap-4 border-b border-[#edf1ee] p-5 md:flex-row md:items-center"><div><h2 className="font-display text-[15px] font-bold text-slate-900">AI Agent Performance</h2><p className="mt-1 text-[11px] text-slate-400">How your AI handles the first response</p></div><div className="grid grid-cols-2 gap-x-7 gap-y-3 sm:grid-cols-4">{[["AI Replies Sent","14,382"],["Human Takeovers","1,247","8.7%"],["Avg Confidence","94.2%"],["Leads Qualified by AI","847"]].map(([label, value, extra]) => <div key={label}><div className="text-[10px] text-slate-400">{label}</div><div className="mt-1 font-display text-[17px] font-bold text-slate-900">{value} {extra && <span className="text-[10px] font-normal text-[#d27b48]">({extra})</span>}</div></div>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[11px]"><thead className="bg-[#f8faf8] text-[9px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Contact</th><th>Question</th><th>AI response (preview)</th><th>Confidence</th><th className="pr-5">Outcome</th></tr></thead><tbody>{aiRows.map(([contact, question, response, confidence, outcome, tone]) => <tr key={contact} className="border-t border-[#edf1ee]"><td className="px-5 py-3 font-semibold text-slate-700">{contact}</td><td className="max-w-[190px] truncate text-slate-500">{question}</td><td className="text-slate-500">{response}</td><td className={`font-semibold ${confidence === "45%" ? "text-[#d27b48]" : "text-[#1c9b51]"}`}>{confidence}</td><td className="pr-5"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${tone}`}>{outcome}</span></td></tr>)}</tbody></table></div></Card>
    <Card className="overflow-hidden"><div className="flex items-center justify-between p-5"><div><h2 className="font-display text-[15px] font-bold text-slate-900">Campaign Performance Summary</h2><p className="mt-1 text-[11px] text-slate-400">Delivery and revenue outcomes across campaigns</p></div><FileBarChart2 size={18} className="text-[#4d8c64]" /></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-[11px]"><thead className="border-y border-[#edf1ee] bg-[#f8faf8] text-[9px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Campaign</th><th>Sent</th><th>Delivered</th><th>Read</th><th>Replied</th><th>Opt-outs</th><th>Conversions</th><th className="pr-5">Revenue</th></tr></thead><tbody>{campaigns.map((row) => <tr key={row[0]} className="border-b border-[#edf1ee] last:border-0"><td className="px-5 py-3 font-semibold text-slate-700">{row[0]}</td>{row.slice(1).map((cell, i) => <td key={`${row[0]}-${i}`} className={`py-3 ${i === 6 ? "pr-5 font-bold text-[#168148]" : "text-slate-500"}`}>{cell}</td>)}</tr>)}<tr className="bg-[#f8faf8] font-bold text-slate-800"><td className="px-5 py-3">Totals</td>{totals.map((cell, i) => <td key={cell} className={`py-3 ${i === 6 ? "pr-5 text-[#168148]" : ""}`}>{cell}</td>)}</tr></tbody></table></div></Card>
  </div></main></div>;
}