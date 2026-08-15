import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  FileCode2,
  FileText,
  FileType2,
  Filter,
  Globe2,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Sidebar, Topbar } from "./_shared/Sidebar";

type DocumentRecord = {
  id: number;
  name: string;
  kind: "PDF" | "DOCX" | "URL";
  size: string;
  chunks: number;
  added: string;
  status: "Trained" | "Processing" | "Needs review";
  tone: string;
};

const initialDocuments: DocumentRecord[] = [
  { id: 1, name: "Product knowledge base", kind: "PDF", size: "4.8 MB", chunks: 184, added: "Today, 10:42 AM", status: "Trained", tone: "bg-[#fce6dd] text-[#bc5b3e]" },
  { id: 2, name: "Pricing & plans — Q2", kind: "DOCX", size: "812 KB", chunks: 67, added: "Yesterday", status: "Trained", tone: "bg-[#dce9ff] text-[#4778be]" },
  { id: 3, name: "help.acmecrm.com/guide", kind: "URL", size: "Web page", chunks: 241, added: "May 18, 2024", status: "Trained", tone: "bg-[#e4defb] text-[#7058b0]" },
  { id: 4, name: "Customer onboarding notes", kind: "PDF", size: "2.1 MB", chunks: 0, added: "Just now", status: "Processing", tone: "bg-[#e6f1dc] text-[#568044]" },
  { id: 5, name: "Refund policy and exceptions", kind: "PDF", size: "1.3 MB", chunks: 32, added: "May 12, 2024", status: "Needs review", tone: "bg-[#f9edc9] text-[#ac7c18]" },
];

function FileIcon({ kind }: { kind: DocumentRecord["kind"] }) {
  if (kind === "URL") return <Globe2 size={17} />;
  if (kind === "DOCX") return <FileType2 size={17} />;
  return <FileText size={17} />;
}

export default function DocumentTraining() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => documents.filter((doc) => doc.name.toLowerCase().includes(query.toLowerCase())),
    [documents, query],
  );

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function addUpload(fileName: string) {
    const ext = fileName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF";
    const next: DocumentRecord = {
      id: Date.now(),
      name: fileName.replace(/\.(pdf|docx?)$/i, ""),
      kind: ext,
      size: "Uploading…",
      chunks: 0,
      added: "Just now",
      status: "Processing",
      tone: ext === "PDF" ? "bg-[#fce6dd] text-[#bc5b3e]" : "bg-[#dce9ff] text-[#4778be]",
    };
    setDocuments((current) => [next, ...current]);
    flash(`${fileName} is being processed`);
    window.setTimeout(() => {
      setDocuments((current) => current.map((doc) => doc.id === next.id ? { ...doc, status: "Trained", chunks: 48, size: "1.6 MB" } : doc));
    }, 2600);
  }

  function addUrl() {
    if (!url.trim()) return;
    const next: DocumentRecord = {
      id: Date.now(), name: url.replace(/^https?:\/\//, "").replace(/\/$/, ""), kind: "URL",
      size: "Web page", chunks: 0, added: "Just now", status: "Processing", tone: "bg-[#e4defb] text-[#7058b0]",
    };
    setDocuments((current) => [next, ...current]);
    setUrl("");
    setShowUrl(false);
    flash("Web page added to training queue");
    window.setTimeout(() => setDocuments((current) => current.map((doc) => doc.id === next.id ? { ...doc, status: "Trained", chunks: 96 } : doc)), 2600);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-800" style={{ fontFamily: "DM Sans, ui-sans-serif, sans-serif" }}>
      <Sidebar active="knowledge" />
      <main className="min-w-0 flex-1">
        <Topbar title="AI & Sequences" subtitle="Teach your AI what your team knows" />
        <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#7c63c5]"><Sparkles size={13} /> AI memory</div>
              <h2 className="font-display text-[27px] font-bold tracking-[-.035em] text-[#17233b]">Document training</h2>
              <p className="mt-1 text-sm text-slate-500">Give your AI a reliable source of truth for every conversation.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#d9e1ed] bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
              <BookOpen size={15} className="text-[#7c63c5]" /><span><b className="text-slate-800">{documents.filter((d) => d.status === "Trained").length}</b> trained sources</span><ChevronDown size={14} className="ml-3" />
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]">
            <div className={`rounded-2xl border-2 border-dashed bg-white p-7 transition-colors ${dragging ? "border-[#7c63c5] bg-[#faf8ff]" : "border-[#cbd5e1]"}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) addUpload(file.name); }}>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee9ff] text-[#755bc0]"><UploadCloud size={26} strokeWidth={1.8} /></div>
                <h3 className="font-display text-[17px] font-bold text-[#19253c]">Drop documents here to train your AI</h3>
                <p className="mt-1.5 max-w-[410px] text-xs leading-5 text-slate-500">Upload your playbooks, product docs, or policies. We’ll split them into searchable knowledge chunks.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => fileInput.current?.click()} className="flex h-9 items-center gap-2 rounded-lg bg-[#7058b0] px-4 text-xs font-bold text-white shadow-sm shadow-[#7058b0]/20 hover:bg-[#624aa4]"><Plus size={15} /> Upload files</button>
                  <button type="button" onClick={() => setShowUrl((v) => !v)} className="flex h-9 items-center gap-2 rounded-lg border border-[#d8ddea] bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"><Globe2 size={14} /> Paste a URL</button>
                </div>
                <input ref={fileInput} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) addUpload(file.name); e.currentTarget.value = ""; }} />
                <p className="mt-4 text-[10px] font-medium text-slate-400">PDF, DOC, DOCX · Max file size 25 MB</p>
              </div>
              {showUrl && <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5"><input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()} placeholder="https://your-website.com/help" className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-[#9279db]" /><button type="button" onClick={addUrl} className="rounded-lg bg-[#1b3b32] px-4 text-xs font-bold text-[#8cf2a7]">Add URL</button></div>}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[#18243b] p-6 text-white shadow-[0_12px_30px_rgba(23,35,59,.12)]">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#7c63c5]/30" /><div className="absolute -right-1 top-0 h-24 w-24 rounded-full border border-[#7c63c5]/20" />
              <div className="relative"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d405d] text-[#b8a6f1]"><Sparkles size={20} /></div><h3 className="font-display text-[16px] font-bold">How training works</h3><div className="mt-4 space-y-4">{[["01", "Upload or paste", "Add the sources your AI should know."], ["02", "We make it searchable", "Content is split into focused chunks."], ["03", "AI answers with context", "Your agent finds the right detail at reply time."]].map(([num, title, copy]) => <div className="flex gap-3" key={num}><span className="font-mono text-[10px] text-[#a99be2]">{num}</span><div><div className="text-xs font-bold">{title}</div><div className="mt-0.5 text-[11px] leading-4 text-slate-400">{copy}</div></div></div>)}</div><button type="button" onClick={() => flash("Opening training guide")} className="mt-6 flex items-center gap-1 text-[11px] font-bold text-[#bbaef0] hover:text-white">Read training guide <ArrowUpRight size={13} /></button></div>
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-[#e1e6ef] bg-white shadow-[0_5px_20px_rgba(30,43,70,.035)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div><h3 className="font-display text-[16px] font-bold text-[#19253c]">Trained documents</h3><p className="mt-0.5 text-[11px] text-slate-400">Sources available to your AI agent</p></div>
              <div className="flex gap-2"><label className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-400"><Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" className="w-32 bg-transparent outline-none placeholder:text-slate-400" /></label><button type="button" onClick={() => flash("Filters are up to date")} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-500"><Filter size={13} /> Filter</button></div>
            </div>
            <div className="divide-y divide-slate-100">
              {filtered.map((doc) => <div key={doc.id} className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-[#fafbfe]"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${doc.tone}`}><FileIcon kind={doc.kind} /></div><div className="min-w-[180px] flex-1"><div className="flex items-center gap-2 text-xs font-bold text-slate-700">{doc.name}{doc.status === "Processing" && <Loader2 size={13} className="animate-spin text-[#7c63c5]" />}</div><div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400"><span>{doc.kind}</span><span>•</span><span>{doc.size}</span><span>•</span><span>{doc.added}</span></div></div><div className="w-28 text-right">{doc.status === "Processing" ? <div className="text-[11px] font-semibold text-[#8068bd]">Processing…</div> : <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700">{doc.chunks} <span className="font-normal text-slate-400">chunks</span></div>}<div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold ${doc.status === "Trained" ? "text-[#36a05a]" : doc.status === "Processing" ? "text-[#8068bd]" : "text-[#b17c17]"}`}>{doc.status === "Trained" ? <Check size={11} /> : doc.status === "Processing" ? <Clock3 size={11} /> : <AlertCircle size={11} />}{doc.status}</div></div><button type="button" onClick={() => { setDocuments((current) => current.filter((item) => item.id !== doc.id)); flash(`${doc.name} removed`); }} aria-label={`Remove ${doc.name}`} className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button><button type="button" onClick={() => flash("More document actions")} aria-label="More actions" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600"><MoreHorizontal size={16} /></button></div>)}
              {filtered.length === 0 && <div className="px-5 py-14 text-center"><FileCode2 size={24} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No documents found</p><p className="mt-1 text-xs text-slate-400">Try another search or add a new source.</p></div>}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400"><span>Showing {filtered.length} of {documents.length} sources</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#43bf6b]" /> AI memory is active</span></div>
          </section>
        </div>
        {notice && <div className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-xl bg-[#18243b] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#78e59a]" />{notice}<button type="button" onClick={() => setNotice("")}><X size={14} className="ml-2 text-slate-400" /></button></div>}
      </main>
    </div>
  );
}