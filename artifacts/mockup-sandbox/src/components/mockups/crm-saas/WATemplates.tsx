import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  Ellipsis,
  FileText,
  Image as ImageIcon,
  Info,
  MessageCircle,
  Plus,
  Search,
  Send,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Sidebar, Topbar } from "./_shared/Sidebar";

type Status = "Approved" | "Pending" | "Rejected";
type Category = "MARKETING" | "UTILITY" | "AUTHENTICATION";

const templates: Array<{
  name: string;
  category: Category;
  language: string;
  status: Status;
  edited: string;
  reason?: string;
}> = [
  { name: "Welcome Message", category: "MARKETING", language: "English", status: "Approved", edited: "2 days ago" },
  { name: "Order Confirmation", category: "UTILITY", language: "English", status: "Approved", edited: "5 days ago" },
  { name: "Demo Booking Reminder", category: "MARKETING", language: "English", status: "Approved", edited: "1 week ago" },
  { name: "OTP Verification", category: "AUTHENTICATION", language: "English", status: "Approved", edited: "2 weeks ago" },
  { name: "Re-engagement Offer", category: "MARKETING", language: "Hindi", status: "Pending", edited: "1 hour ago" },
  { name: "Invoice Ready", category: "UTILITY", language: "English", status: "Pending", edited: "3 hours ago" },
  { name: "Flash Sale Alert", category: "MARKETING", language: "English", status: "Rejected", edited: "3 days ago", reason: "Contains prohibited content" },
  { name: "Subscription Renewal", category: "UTILITY", language: "English", status: "Approved", edited: "1 month ago" },
];

const bodyCopy = "Hi {{1}}, thank you for reaching out to {{2}}! We're excited to connect with you.\n\nOur team is here to help you with:\n✅ Product information\n✅ Pricing & plans\n✅ Demo scheduling\n\nHow can we assist you today?";

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    Approved: "bg-[#e4f8eb] text-[#168447]",
    Pending: "bg-[#fff2d8] text-[#a86b06]",
    Rejected: "bg-[#fde7e5] text-[#c9483e]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${styles[status]}`}>
      {status === "Approved" ? <Check size={11} strokeWidth={3} /> : status === "Pending" ? <Clock3 size={11} /> : <X size={11} strokeWidth={3} />}
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const styles = {
    MARKETING: "bg-[#e9e6ff] text-[#6256b3]",
    UTILITY: "bg-[#e1f1fb] text-[#26729b]",
    AUTHENTICATION: "bg-[#fce9dc] text-[#b45d2d]",
  };
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-[.08em] ${styles[category]}`}>{category}</span>;
}

export function WATemplates() {
  const [selected, setSelected] = useState("Welcome Message");
  const [tab, setTab] = useState<"All" | Status>("All");
  const [query, setQuery] = useState("");
  const [body, setBody] = useState(bodyCopy);
  const [footer, setFooter] = useState("Reply STOP to unsubscribe");
  const [header, setHeader] = useState("Welcome to {{1}}! 🎉");
  const [notice, setNotice] = useState("");

  const visibleTemplates = useMemo(
    () => templates.filter((item) => (tab === "All" || item.status === tab) && item.name.toLowerCase().includes(query.toLowerCase())),
    [query, tab],
  );

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f4f7fb] text-slate-800">
      <Sidebar active="WhatsApp Templates" />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar title="WhatsApp Templates" subtitle="Create, manage, and submit message templates for approval" />
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:p-5">
          <section className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white panel-shadow lg:w-[420px]">
            <div className="border-b border-slate-100 px-5 pb-4 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-[17px] font-bold tracking-tight text-slate-900">WhatsApp Templates</p>
                  <p className="mt-1 text-[11px] text-slate-400">24 templates in your workspace</p>
                </div>
                <button onClick={() => showNotice("Create Template wizard is ready to open")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#20b957] px-3 text-[11px] font-bold text-[#062713] shadow-sm hover:bg-[#19a94d]">
                  <Plus size={15} /> Create Template
                </button>
              </div>
              <div className="mt-5 flex gap-1 border-b border-slate-100">
                {(["All", "Approved", "Pending", "Rejected"] as const).map((item) => (
                  <button key={item} onClick={() => setTab(item)} className={`relative px-2 pb-3 text-[11px] font-semibold ${tab === item ? "text-[#168447]" : "text-slate-400 hover:text-slate-700"}`}>
                    {item} <span className="ml-0.5 text-[10px] text-slate-300">{item === "All" ? 24 : item === "Approved" ? 18 : item === "Pending" ? 4 : 2}</span>
                    {tab === item && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[#20b957]" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#fafbfd] px-3">
                <Search size={14} className="text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder="Search templates..." />
              </div>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
              {visibleTemplates.map((item) => (
                <button key={item.name} onClick={() => setSelected(item.name)} className={`group relative mb-1 w-full rounded-lg border p-3 text-left transition-all ${selected === item.name ? "border-[#54b9ee] bg-[#f1f9fe] shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13px] font-bold text-slate-800">{item.name}</p>
                    <Ellipsis size={16} className="shrink-0 text-slate-300 group-hover:text-slate-500" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CategoryBadge category={item.category} />
                    <span className="text-[10px] text-slate-400">{item.language}</span>
                    <span className="ml-auto"><StatusBadge status={item.status} /></span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Last edited {item.edited}</span>
                    {item.reason && <span title={item.reason} className="text-[#c9483e]">Reason available</span>}
                  </div>
                  {item.reason && <p className="mt-2 border-t border-[#f6d9d6] pt-2 text-[10px] text-[#b85b53]">{item.reason}</p>}
                </button>
              ))}
              {visibleTemplates.length === 0 && <div className="px-5 py-12 text-center text-xs text-slate-400">No templates match your filters.</div>}
            </div>
          </section>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white panel-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5f7eb] text-[#14934a]"><FileText size={18} /></div>
                <div><div className="flex items-center gap-2"><h2 className="font-display text-[17px] font-bold text-slate-900">{selected}</h2><StatusBadge status="Approved" /></div><p className="mt-1 text-[10px] text-slate-400">MARKETING&nbsp; · &nbsp;English&nbsp; · &nbsp;Created Jan 15, 2025</p></div>
              </div>
              <button onClick={() => showNotice("Template is now in edit mode")} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Edit3 size={13} /> Edit</button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
              <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r">
                <EditorSection title="HEADER">
                  <div className="flex flex-wrap gap-1.5">
                    {(["None", "Text", "Image", "Video", "Document"] as const).map((type) => <button key={type} onClick={() => showNotice(`${type} header selected`)} className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold ${type === "Text" ? "border-[#4ab2e7] bg-[#eaf7fd] text-[#1679a7]" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{type === "Image" && <ImageIcon size={12} className="mr-1 inline" />}{type === "Video" && <Video size={12} className="mr-1 inline" />}{type === "Document" && <FileText size={12} className="mr-1 inline" />}{type}</button>)}
                  </div>
                  <input value={header} onChange={(event) => setHeader(event.target.value)} className="mt-3 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none ring-[#42aee4] focus:ring-2" />
                </EditorSection>
                <EditorSection title="BODY">
                  <textarea value={body} onChange={(event) => setBody(event.target.value)} className="h-[174px] w-full resize-none rounded-lg border border-slate-200 p-3 text-xs leading-5 outline-none ring-[#42aee4] focus:ring-2" />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Variables:</span><span className="rounded bg-[#eef3f7] px-2 py-1 text-[10px] font-mono text-slate-600">{"{{1}}"} = customer_name</span><span className="rounded bg-[#eef3f7] px-2 py-1 text-[10px] font-mono text-slate-600">{"{{2}}"} = company_name</span><button onClick={() => showNotice("Variable added")} className="text-[10px] font-bold text-[#138a49] hover:underline"><Plus size={11} className="mr-0.5 inline" /> Add Variable</button>
                  </div>
                  <div className="mt-2 text-right text-[10px] text-slate-400">{body.length}/1024</div>
                </EditorSection>
                <EditorSection title="FOOTER">
                  <input value={footer} onChange={(event) => setFooter(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none ring-[#42aee4] focus:ring-2" />
                </EditorSection>
                <EditorSection title="BUTTONS">
                  <div className="mb-3 flex border-b border-slate-100"><button className="border-b-2 border-[#20b957] px-2 pb-2 text-[11px] font-bold text-[#168447]">Quick Reply</button><button onClick={() => showNotice("Call to action buttons selected")} className="px-3 pb-2 text-[11px] font-semibold text-slate-400">Call to Action</button></div>
                  {["View Products", "Get a Quote", "Talk to Agent"].map((button, index) => <div key={button} className="mb-2 flex items-center gap-2"><span className="w-5 text-[10px] text-slate-400">{index + 1}</span><input defaultValue={button} className="h-8 flex-1 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-[#42aee4]" /><button onClick={() => showNotice(`${button} removed`)} aria-label={`Remove ${button}`} className="text-slate-300 hover:text-[#cf554c]"><X size={14} /></button></div>)}
                  <button onClick={() => showNotice("Maximum of 3 buttons reached")} className="mt-1 text-[11px] font-bold text-[#138a49] hover:underline"><Plus size={12} className="mr-1 inline" /> Add Button <span className="font-normal text-slate-400">(max 3)</span></button>
                </EditorSection>
                <div className="mt-7 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button onClick={() => showNotice("Submitted for approval")} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f3b63f] px-3.5 text-[11px] font-bold text-[#5c3b05] hover:bg-[#e8a92d]"><Send size={13} /> Submit for Approval</button><button onClick={() => showNotice("Template duplicated")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Copy size={13} /> Duplicate</button><button onClick={() => showNotice("Delete confirmation requested")} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[11px] font-semibold text-[#c9483e] hover:bg-[#fff3f1]"><Trash2 size={13} /> Delete</button></div>
              </div>
              <div className="bg-[#f8fafc] p-5">
                <div className="flex items-center justify-between"><div><h3 className="font-display text-[15px] font-bold text-slate-900">Preview</h3><p className="mt-0.5 text-[10px] text-slate-400">How it looks on WhatsApp</p></div><MessageCircle size={19} className="text-[#20b957]" /></div>
                <div className="mx-auto mt-5 w-full max-w-[252px] rounded-[28px] border-[6px] border-[#263143] bg-[#101923] p-1 shadow-xl">
                  <div className="overflow-hidden rounded-[21px] bg-[#e8ded4]">
                    <div className="flex items-center gap-2 bg-[#168c61] px-3 py-3 text-white"><div className="h-7 w-7 rounded-full bg-[#c7e4d2] text-center text-[10px] font-bold leading-7 text-[#246747]">AC</div><div><p className="text-[11px] font-bold">Acme Corp <Check size={11} className="ml-0.5 inline text-[#bdebd0]" /></p><p className="text-[8px] opacity-75">Business account</p></div><ChevronDown size={14} className="ml-auto rotate-[-90deg] opacity-70" /></div>
                    <div className="min-h-[330px] bg-[radial-gradient(#d2c6ba_1px,transparent_1px)] bg-[length:12px_12px] p-2.5"><div className="max-w-[216px] rounded-lg rounded-tl-sm bg-white px-2.5 py-2.5 shadow-sm"><p className="text-[10px] font-bold leading-4 text-slate-800">{header.replace("{{1}}", "Acme Corp")}</p><p className="mt-2 whitespace-pre-line text-[9px] leading-[1.45] text-slate-700">{body.replace("{{1}}", "there").replace("{{2}}", "Acme Corp")}</p><p className="mt-2 text-[8px] text-slate-400">{footer}</p><p className="mt-1 text-right text-[8px] text-slate-400">10:42 AM <CheckCheck size={11} className="ml-0.5 inline text-[#3fa3cf]" /></p></div><div className="mt-1.5 max-w-[216px] space-y-1">{["View Products", "Get a Quote", "Talk to Agent"].map((item) => <button onClick={() => showNotice(`${item} clicked in preview`)} key={item} className="w-full rounded-md bg-white py-1.5 text-[9px] font-semibold text-[#178cc1] shadow-sm">{item}</button>)}</div></div>
                  </div>
                </div>
                <div className="mx-auto mt-4 max-w-[252px] text-center text-[10px] text-slate-500">Character count: <b className="text-slate-700">{body.length}</b> | Variables: <b className="text-slate-700">2</b> | Buttons: <b className="text-slate-700">3</b></div>
                <div className="mx-auto mt-3 flex max-w-[252px] items-start gap-2 rounded-lg border border-[#f2dfb3] bg-[#fff9e9] p-2.5 text-[10px] leading-4 text-[#926a1e]"><Info size={13} className="mt-0.5 shrink-0" /> Approval time: typically 24–48 hours</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      {notice && <div className="fixed bottom-5 right-5 z-30 rounded-lg bg-[#16263c] px-4 py-3 text-xs font-semibold text-white shadow-xl">{notice}</div>}
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-5 first:mt-0"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-[#39b968]" />{title}</div>{children}</section>;
}