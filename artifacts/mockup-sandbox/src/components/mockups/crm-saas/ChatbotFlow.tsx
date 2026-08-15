import { useState } from "react";
import {
  Bot, Check, ChevronDown, Clock3, GitBranch, MessageCircle,
  Minus, MousePointer2, Play, Plus, Redo2, Send, Settings2, Tag,
  Trash2, Undo2, UserRound, X, Zap, ZoomIn, ZoomOut,
} from "lucide-react";
import { Sidebar, Topbar } from "./_shared/Sidebar";

type NodeKey = "trigger" | "condition" | "message" | "replies" | "wait" | "variable" | "assign" | "end";

const flows = [
  ["Welcome & Qualify Lead", "Edited 12 min ago"],
  ["Abandoned Cart Recovery", "Edited yesterday"],
  ["Post-Purchase Follow-up", "Edited 3 days ago"],
  ["Support Ticket Triage", "Edited 6 days ago"],
  ["Re-engagement Campaign", "Edited 2 weeks ago"],
];

const nodePositions: Record<NodeKey, { top: number; left: number }> = {
  trigger: { top: 40, left: 440 },
  condition: { top: 160, left: 400 },
  message: { top: 300, left: 200 },
  replies: { top: 440, left: 200 },
  wait: { top: 580, left: 200 },
  variable: { top: 720, left: 200 },
  assign: { top: 860, left: 400 },
  end: { top: 1000, left: 440 },
};

function FlowNode({
  node, title, subtitle, icon: Icon, tone, children, selected, onClick,
}: {
  node: NodeKey; title: string; subtitle?: string; icon: typeof Bot; tone: string;
  children?: React.ReactNode; selected: boolean; onClick: () => void;
}) {
  const position = nodePositions[node];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-10 w-52 rounded-xl border bg-[#172238] p-3 text-left shadow-xl shadow-slate-950/30 transition-all hover:-translate-y-0.5 ${tone} ${selected ? "ring-2 ring-green-300 ring-offset-2 ring-offset-slate-900" : ""}`}
      style={{ top: position.top, left: position.left }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white"><Icon size={15} /></span>
        <span className="font-display text-[12px] font-semibold leading-tight text-slate-100">{title}</span>
      </div>
      {subtitle && <p className="text-[11px] leading-4 text-slate-400">{subtitle}</p>}
      {children}
    </button>
  );
}

function ConnectorSvg() {
  return (
    <svg className="pointer-events-none absolute left-0 top-0 z-[1] h-[1200px] w-[900px]" viewBox="0 0 900 1200" aria-hidden="true">
      <defs>
        <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#4ade80" />
        </marker>
      </defs>
      <g fill="none" stroke="#4ade80" strokeWidth="2" markerEnd="url(#flow-arrow)" opacity=".9">
        <path d="M544 102 C544 125 504 132 504 160" />
        <path d="M400 208 C340 232 304 258 304 300" />
        <path d="M304 392 C304 415 304 420 304 440" />
        <path d="M304 532 C304 555 304 560 304 580" />
        <path d="M304 672 C304 695 304 700 304 720" />
        <path d="M408 766 C480 790 504 815 504 860" />
        <path d="M504 952 C504 975 544 978 544 1000" />
        <path d="M608 208 C680 300 680 810 504 860" />
      </g>
      <g fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="600">
        <rect x="326" y="226" width="27" height="18" rx="9" fill="#172238" stroke="#4ade80" strokeWidth="1" />
        <text x="340" y="238" fill="#86efac" textAnchor="middle">Yes</text>
        <rect x="655" y="273" width="25" height="18" rx="9" fill="#172238" stroke="#fbbf24" strokeWidth="1" />
        <text x="667" y="285" fill="#fde68a" textAnchor="middle">No</text>
      </g>
    </svg>
  );
}

export function ChatbotFlow() {
  const [flowName, setFlowName] = useState("Welcome & Qualify Lead");
  const [selected, setSelected] = useState<NodeKey>("message");
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState("Saved just now");
  const [deleted, setDeleted] = useState<NodeKey[]>([]);
  const [message, setMessage] = useState("Hi {{name}}! Welcome to Acme Corp. How can I help you today?");

  const isVisible = (node: NodeKey) => !deleted.includes(node);
  const saveDraft = () => setSaved("Saved just now");
  const publish = () => setSaved("Published just now");

  return (
    <div className="flex min-h-[100dvh] bg-[#f4f7fb] text-slate-900">
      <Sidebar active="flows" />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Chatbot Flows" subtitle="Automations that keep every conversation moving" />
        <div className="flex min-h-16 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <div className="mr-auto flex min-w-[245px] items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d9f7e4] text-[#139447]"><Bot size={16} /></div>
            <div>
              <input value={flowName} onChange={(e) => setFlowName(e.target.value)} className="w-56 bg-transparent font-display text-sm font-bold outline-none focus:border-b focus:border-green-500" />
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{saved}</div>
            </div>
            <span className="rounded-full bg-[#e1f8e8] px-2.5 py-1 text-[10px] font-bold text-[#168347]">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSaved("Test run started")} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Play size={13} />Test Flow</button>
            <button type="button" onClick={saveDraft} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Check size={13} />Save Draft</button>
            <button type="button" onClick={publish} className="flex h-9 items-center gap-2 rounded-lg bg-[#22c55e] px-3.5 text-xs font-bold text-[#082113] hover:bg-[#1dae51]"><Zap size={13} fill="currentColor" />Publish</button>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button type="button" onClick={() => setZoom(Math.max(50, zoom - 10))} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><Minus size={15} /></button>
            <span className="w-10 text-center text-[11px] font-semibold text-slate-500">{zoom}%</span>
            <button type="button" onClick={() => setZoom(Math.min(150, zoom + 10))} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><Plus size={15} /></button>
            <button type="button" className="ml-2 rounded-md p-2 text-slate-400 hover:bg-slate-100"><Undo2 size={15} /></button>
            <button type="button" className="rounded-md p-2 text-slate-400 hover:bg-slate-100"><Redo2 size={15} /></button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-4 lg:w-[200px] lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between"><div><p className="font-display text-xs font-bold text-slate-800">Your flows</p><p className="mt-0.5 text-[10px] text-slate-400">5 automations</p></div><Settings2 size={15} className="text-slate-400" /></div>
            <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1.5">
              {flows.map(([name, edited], index) => <button type="button" key={name} onClick={() => index === 0 && setFlowName(name)} className={`min-w-[170px] rounded-lg p-2.5 text-left lg:w-full ${index === 0 ? "bg-[#eaf8ef] ring-1 ring-[#b9ebc8]" : "hover:bg-slate-50"}`}><div className={`text-[11px] font-semibold ${index === 0 ? "text-[#167c40]" : "text-slate-600"}`}>{name}</div><div className="mt-1 text-[9px] text-slate-400">{edited}</div></button>)}
            </div>
            <button type="button" onClick={() => setSaved("New flow draft created")} className="mt-4 flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-[11px] font-semibold text-slate-500 hover:border-green-400 hover:text-green-600"><Plus size={14} />New Flow</button>
          </aside>

          <section className="relative min-h-[620px] min-w-0 flex-1 overflow-hidden bg-slate-900">
            <div className="absolute inset-0 overflow-auto bg-[radial-gradient(#64748b_0.8px,transparent_0.8px)] bg-[size:22px_22px]">
              <div className="relative h-[1200px] w-[900px]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
                <ConnectorSvg />
                {isVisible("trigger") && <FlowNode node="trigger" title="WhatsApp Message Received" subtitle="Any incoming message" icon={MessageCircle} tone="border-teal-400/80" selected={selected === "trigger"} onClick={() => setSelected("trigger")} />}
                {isVisible("condition") && <FlowNode node="condition" title="Check: Is New Contact?" subtitle="Contact status equals new" icon={GitBranch} tone="border-orange-400/80" selected={selected === "condition"} onClick={() => setSelected("condition")} />}
                {isVisible("message") && <FlowNode node="message" title="Send Welcome Message" subtitle="Hi {{name}}! Welcome to Acme Corp. How can I help you today?" icon={Send} tone="border-green-400/90" selected={selected === "message"} onClick={() => setSelected("message")} />}
                {isVisible("replies") && <FlowNode node="replies" title="Quick Reply" subtitle="Choose a response" icon={MessageCircle} tone="border-blue-400/80" selected={selected === "replies"} onClick={() => setSelected("replies")}><div className="mt-2 space-y-1"><span className="block rounded border border-blue-300/25 bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">View Products</span><span className="block rounded border border-blue-300/25 bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">Get a Quote</span><span className="block rounded border border-blue-300/25 bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">Talk to Agent</span></div></FlowNode>}
                {isVisible("wait") && <FlowNode node="wait" title="Wait for Reply" subtitle="Timeout: 24 hours" icon={Clock3} tone="border-purple-400/80" selected={selected === "wait"} onClick={() => setSelected("wait")} />}
                {isVisible("variable") && <FlowNode node="variable" title="Set Lead Stage = New" subtitle="Update contact property" icon={Tag} tone="border-slate-400/80" selected={selected === "variable"} onClick={() => setSelected("variable")} />}
                {isVisible("assign") && <FlowNode node="assign" title="Assign to: Sales Team" subtitle="Round robin assignment" icon={UserRound} tone="border-amber-400/80" selected={selected === "assign"} onClick={() => setSelected("assign")} />}
                {isVisible("end") && <FlowNode node="end" title="End Flow" subtitle="Conversation complete" icon={X} tone="border-red-400/80" selected={selected === "end"} onClick={() => setSelected("end")} />}
                <div className="absolute left-[535px] top-[112px] z-10 flex items-center gap-1 text-[9px] font-semibold text-slate-500"><MousePointer2 size={11} /> drag to connect</div>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-[10px] text-slate-400 sm:block">Scroll to explore flow <span className="ml-2 text-slate-600">•</span> Click a node to edit</div>
            <div className="absolute right-4 top-4 flex gap-1 rounded-lg border border-white/10 bg-slate-800/90 p-1"><button type="button" onClick={() => setZoom(Math.max(50, zoom - 10))} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><ZoomOut size={14} /></button><button type="button" onClick={() => setZoom(100)} className="px-1.5 text-[10px] font-semibold text-slate-400 hover:text-white">Reset</button><button type="button" onClick={() => setZoom(Math.min(150, zoom + 10))} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><ZoomIn size={14} /></button></div>
          </section>

          <aside className="w-full shrink-0 overflow-y-auto border-t border-slate-200 bg-white lg:w-[310px] lg:border-l lg:border-t-0">
            <div className="border-b border-slate-100 p-5"><div className="flex items-start justify-between"><div><p className="font-display text-sm font-bold text-slate-900">Node Settings</p><span className="mt-2 inline-flex rounded-md bg-[#e1f8e8] px-2 py-1 text-[10px] font-bold text-[#168347]">Send Message</span></div><Settings2 size={16} className="text-slate-400" /></div></div>
            <div className="space-y-5 p-5">
              <label className="block"><span className="mb-2 block text-[11px] font-bold text-slate-700">Message Content</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" /></label>
              <div><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold text-slate-700">Variables</span><button type="button" className="text-[10px] font-semibold text-green-600 hover:text-green-700">+ Add Variable</button></div><div className="flex flex-wrap gap-1.5">{["{{name}}", "{{phone}}", "{{company}}"].map((variable) => <span key={variable} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-600">{variable}</span>)}</div></div>
              <fieldset><legend className="mb-2 text-[11px] font-bold text-slate-700">Message Type</legend><div className="grid grid-cols-2 gap-2">{["Text", "Image", "Document", "Template"].map((type, i) => <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-[11px] ${i === 0 ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 text-slate-500"}`}><input type="radio" name="messageType" defaultChecked={i === 0} className="accent-green-600" />{type}</label>)}</div></fieldset>
              <label className="block"><span className="mb-2 block text-[11px] font-bold text-slate-700">Delay before sending</span><div className="flex items-center gap-2"><input defaultValue="0" type="number" className="h-9 w-20 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-green-400" /><span className="text-[11px] text-slate-400">seconds</span></div></label>
              <label className="block"><span className="mb-2 block text-[11px] font-bold text-slate-700">On Failure</span><div className="relative"><select className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none"><option>Skip to Next Node</option><option>Stop Flow</option><option>Retry once</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" /></div></label>
              <div className="border-t border-slate-100 pt-5"><p className="mb-3 text-[11px] font-bold text-slate-700">Node Stats</p><div className="space-y-2.5 text-[11px]"><div className="flex justify-between"><span className="text-slate-400">Triggered</span><span className="font-semibold text-slate-700">1,284 times</span></div><div className="flex justify-between"><span className="text-slate-400">Success rate</span><span className="font-semibold text-green-600">94.2%</span></div><div className="flex justify-between"><span className="text-slate-400">Avg response</span><span className="font-semibold text-slate-700">2.3s</span></div></div></div>
              <button type="button" onClick={() => { setDeleted((items) => items.includes(selected) ? items : [...items, selected]); setSelected("message"); }} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100"><Trash2 size={14} />Delete Node</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}