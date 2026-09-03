import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListKnowledgeSourcesQueryKey, useCreateKnowledgeSource,
  useDeleteKnowledgeSource, useListKnowledgeSources,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BookOpen, Check, FileText, Filter, Globe2, Loader2, Plus, Search,
  Sparkles, Trash2, UploadCloud, X,
} from "lucide-react";

export default function Knowledge() {
  const { data: sources = [], isLoading } = useListKnowledgeSources();
  const createSource = useCreateKnowledgeSource();
  const deleteSource = useDeleteKnowledgeSource();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready">("all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListKnowledgeSourcesQueryKey() });
  const filtered = useMemo(() => sources.filter((source) => (statusFilter === "all" || source.status === "ready") && `${source.title} ${source.content}`.toLowerCase().includes(query.toLowerCase())), [sources, query, statusFilter]);
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const importFile = (file: File) => {
    const supported = ["text/plain", "text/markdown", "text/csv", "application/json"].includes(file.type) || /\.(txt|md|csv|json)$/i.test(file.name);
    if (!supported) {
      flash("PDF/DOCX extraction is not connected yet; choose a text file or paste content.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = String(reader.result ?? "").slice(0, 20000);
      createSource.mutate({ data: { title: file.name.replace(/\.[^.]+$/, ""), content: fileContent } }, { onSuccess: () => { refresh(); flash(`${file.name} trained successfully`); } });
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout title="AI Training & Knowledge" subtitle="Train your AI agent with verified business documents and answers.">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white panel-shadow">
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><UploadCloud size={20} /></span><div><h2 className="font-display text-base font-extrabold text-slate-900">Add training content</h2><p className="mt-1 text-[11px] text-slate-400">Create verified text sources for your AI memory.</p></div></div>
              <button onClick={() => fileInput.current?.click()} className="mt-5 flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center transition hover:border-green-400 hover:bg-green-50/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm"><Plus size={20} /></span>
                <span className="mt-3 text-xs font-extrabold text-slate-700">Drop a document or add verified content</span>
                <span className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">Text, Markdown, CSV and JSON files train instantly. PDFs/DOCX can be added after extraction is connected.</span>
              </button>
              <input ref={fileInput} type="file" className="hidden" accept=".txt,.md,.csv,.json,.pdf,.doc,.docx" onChange={(event) => { const file = event.target.files?.[0]; if (file) importFile(file); event.target.value = ""; }} />
            </div>
            <div className="bg-gradient-to-br from-[#17233a] to-[#223756] p-6 text-white">
              <Sparkles size={20} className="text-green-300" />
              <h3 className="mt-4 font-display text-lg font-extrabold">AI memory is active</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">Every ready source is available to your workspace AI runtime and inbound test console.</p>
              <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-extrabold">{sources.length}</p><p className="mt-1 text-[10px] text-slate-400">Trained sources</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-extrabold">{sources.reduce((sum, source) => sum + source.content.split(/\s+/).length, 0).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-400">Knowledge words</p></div></div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white panel-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-display text-sm font-extrabold text-slate-900">Trained documents</h2><p className="mt-1 text-[11px] text-slate-400">Sources available to your AI agent</p></div>
            <div className="flex gap-2"><label className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="w-36 bg-transparent outline-none placeholder:text-slate-400" /></label><button onClick={() => setStatusFilter(statusFilter === "all" ? "ready" : "all")} className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold ${statusFilter === "ready" ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 text-slate-500"}`}><Filter size={13} /> {statusFilter === "all" ? "Filter" : "Ready only"}</button></div>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((source, index) => (
              <div key={source.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${index % 3 === 0 ? "bg-red-50 text-red-500" : index % 3 === 1 ? "bg-blue-50 text-blue-500" : "bg-violet-50 text-violet-500"}`}>{index % 3 === 2 ? <Globe2 size={17} /> : <FileText size={17} />}</span>
                <div className="min-w-[220px] flex-1"><p className="text-xs font-extrabold text-slate-700">{source.title}</p><p className="mt-1 line-clamp-1 text-[10px] text-slate-400">{source.content}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-slate-700">{source.content.split(/\s+/).length} <span className="font-normal text-slate-400">words</span></p><p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-green-600"><Check size={11} /> Trained</p></div>
                <button disabled={deleteSource.isPending} onClick={() => deleteSource.mutate({ id: source.id }, { onSuccess: () => { refresh(); flash("Knowledge source removed"); } })} aria-label={`Remove ${source.title}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
            {isLoading && <div className="flex items-center justify-center py-12 text-xs text-slate-400"><Loader2 size={16} className="mr-2 animate-spin" />Loading knowledge…</div>}
            {!isLoading && !filtered.length && <div className="flex flex-col items-center py-14 text-center"><BookOpen size={25} className="text-slate-300" /><p className="mt-3 text-xs font-bold text-slate-600">No trained sources found</p><p className="mt-1 text-[11px] text-slate-400">Add verified content or try another search.</p></div>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400"><span>Showing {filtered.length} of {sources.length} sources</span><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-green-500" /> AI memory is active</span></div>
        </section>
      </div>

      {showEditor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add knowledge source">
        <form className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl" onSubmit={(event) => { event.preventDefault(); createSource.mutate({ data: { title, content } }, { onSuccess: () => { setTitle(""); setContent(""); setShowEditor(false); refresh(); flash("Knowledge source trained"); } }); }}>
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">New source</p><h2 className="mt-1 font-display text-xl font-extrabold text-slate-900">Train your AI</h2></div><button type="button" onClick={() => setShowEditor(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><X size={15} /></button></div>
          <label className="mt-5 block text-xs font-bold text-slate-600">Source title<input required minLength={2} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Pricing and plan details" className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-green-400" /></label>
          <label className="mt-4 block text-xs font-bold text-slate-600">Verified content<textarea required maxLength={20000} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste the FAQ, document text, policies, or product information…" className="mt-2 min-h-44 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-green-400" /></label>
          <button disabled={createSource.isPending || !title.trim() || !content.trim()} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] text-sm font-bold text-white disabled:opacity-50">{createSource.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}Train source</button>
        </form>
      </div>}
      {notice && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17233a] px-4 py-3 text-xs font-bold text-white shadow-xl"><Check size={14} className="text-green-300" />{notice}</div>}
    </AppLayout>
  );
}