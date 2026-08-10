import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Webhook,
  X,
} from "lucide-react";
import { Sidebar, Topbar } from "./_shared/Sidebar";

type Day = { name: string; start: string; end: string; active: boolean };

const navGroups = [
  { title: "Workspace", items: ["Company Profile", "Team Members", "Roles & Permissions", "Billing & Plans"] },
  { title: "Integrations", items: ["WhatsApp Business API", "Instagram & Facebook", "AI Configuration", "Webhooks & API Keys"] },
  { title: "Notifications", items: ["Notification Preferences", "Email Alerts"] },
  { title: "Security", items: ["Login & Security", "Audit Logs"] },
];

const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50";

function Field({ label, value, multiline = false, pencil = false, onChange }: { label: string; value: string; multiline?: boolean; pencil?: boolean; onChange?: (value: string) => void }) {
  return <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</span>
    <span className="relative block">
      {multiline ? <textarea value={value} onChange={(event) => onChange?.(event.target.value)} className={`${inputClass} h-[88px] resize-none py-2.5 leading-relaxed`} /> : <input value={value} onChange={(event) => onChange?.(event.target.value)} className={`${inputClass} ${pencil ? "pr-10" : ""}`} />}
      {pencil && <Edit3 size={14} className="absolute right-3 top-3 text-slate-400" />}
    </span>
  </label>;
}

function SelectField({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</span><span className="relative block"><select defaultValue={value} className={`${inputClass} appearance-none pr-8`}><option>{value}</option><option>Not specified</option><option>English</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" /></span></label>;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#159447] hover:text-[#0b7134]" onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button>;
}

function SecretRow({ label, value, regenerate = false }: { label: string; value: string; regenerate?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="grid gap-2 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[175px_1fr_auto] sm:items-center">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <code className="truncate rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">{visible ? value : "••••••••••••••••••••••"}</code>
    <div className="flex items-center gap-3">
      <button className="text-slate-500 hover:text-slate-800" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide secret" : "Reveal secret"}>{visible ? <EyeOff size={14} /> : <Eye size={14} />}</button>
      {regenerate && <button className="text-[11px] font-semibold text-[#159447] hover:text-[#0b7134]" onClick={() => {}}>Regenerate</button>}
    </div>
  </div>;
}

function ConnectionRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[175px_1fr_auto] sm:items-center"><span className="text-xs font-semibold text-slate-500">{label}</span><code className="truncate rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">{value}</code><CopyButton value={value} /></div>;
}

export function Settings() {
  const [activeNav, setActiveNav] = useState("Company Profile");
  const [saved, setSaved] = useState(false);
  const [metaOpen, setMetaOpen] = useState(true);
  const [hoursEnabled, setHoursEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState(["Production API Key", "Staging API Key"]);
  const [days, setDays] = useState<Day[]>([
    { name: "Mon–Fri", start: "9:00 AM", end: "7:00 PM", active: true },
    { name: "Sat", start: "10:00 AM", end: "5:00 PM", active: true },
    { name: "Sun", start: "—", end: "—", active: false },
  ]);
  const [companyName, setCompanyName] = useState("Acme Corporation");
  const [description, setDescription] = useState("We are a leading e-commerce company helping people discover products they love.");

  const toggleDay = (index: number) => setDays((current) => current.map((day, itemIndex) => itemIndex === index ? { ...day, active: !day.active } : day));

  return <div className="flex min-h-[100dvh] bg-[#f4f7f9] text-slate-900">
    <Sidebar active="Settings" />
    <div className="min-w-0 flex-1">
      <Topbar title="Settings" subtitle="Manage your workspace, integrations and security" />
      <main className="mx-auto flex max-w-[1480px] flex-col gap-7 p-5 lg:flex-row lg:p-8">
        <aside className="w-full shrink-0 lg:w-[220px]">
          <div className="sticky top-5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,.03)]">
            {navGroups.map((group) => <div key={group.title} className="mb-4 last:mb-1">
              <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{group.title}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => <button key={item} onClick={() => setActiveNav(item)} className={`w-full rounded-md px-3 py-2 text-left text-[12px] transition ${activeNav === item ? "bg-[#e9f8ee] font-bold text-[#148a40]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{item}</button>)}
              </div>
            </div>)}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,.03)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div><h2 className="font-display text-[20px] font-bold tracking-tight text-slate-900">Company Profile</h2><p className="mt-1 text-xs text-slate-500">Keep your workspace details accurate for customers and teammates.</p></div>
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">Last saved: 2 minutes ago</span>
            </div>
            <div className="grid gap-8 p-5 sm:p-7 xl:grid-cols-2">
              <div className="space-y-5">
                <Field label="Company Name" value={companyName} pencil onChange={setCompanyName} />
                <Field label="Company Display Name (shown to contacts)" value="Acme Corp" />
                <SelectField label="Industry" value="E-commerce" />
                <SelectField label="Company Size" value="6-20 employees" />
                <Field label="Website" value="https://acmecorp.com" />
                <Field label="Company Description" value={description} multiline onChange={setDescription} />
                <div className="grid gap-5 sm:grid-cols-2"><SelectField label="Primary Language" value="English" /><SelectField label="Secondary Language" value="Hindi" /></div>
              </div>
              <div className="space-y-5">
                <div><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Company Logo</span><div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#d7f6df] font-display text-lg font-bold text-[#13863b]">AC</div><div className="min-w-0"><div className="flex gap-2"><button className={buttonClass} onClick={() => {}}><Upload size={14} /> Upload</button><button className="px-2 text-xs font-semibold text-slate-500 hover:text-red-600" onClick={() => {}}>Remove</button></div><p className="mt-2 text-[10px] text-slate-400">Max 2MB, PNG/JPG</p></div></div></div>
                <div><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Brand Color</span><div className="flex gap-2"><div className="h-10 w-10 rounded-lg border border-slate-200 bg-[#22c55e] p-1"><input type="color" defaultValue="#22c55e" className="h-full w-full cursor-pointer opacity-0" /></div><input defaultValue="#22c55e" className={`${inputClass} font-mono`} /></div></div>
                <SelectField label="Timezone" value="Asia/Kolkata (IST)" />
                <div><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Business Hours</span><button onClick={() => setHoursEnabled(!hoursEnabled)} className={`relative h-5 w-9 rounded-full transition ${hoursEnabled ? "bg-[#22c55e]" : "bg-slate-300"}`} aria-label="Toggle business hours"><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${hoursEnabled ? "left-[18px]" : "left-0.5"}`} /></button></div><div className={`overflow-hidden rounded-lg border border-slate-200 ${!hoursEnabled ? "opacity-50" : ""}`}>{days.map((day, index) => <div key={day.name} className="grid grid-cols-[70px_1fr_1fr_28px] items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-0"><span className="text-xs font-semibold text-slate-600">{day.name}</span><select disabled={!hoursEnabled || !day.active} value={day.start} onChange={() => {}} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600"><option>{day.start}</option></select><select disabled={!hoursEnabled || !day.active} value={day.end} onChange={() => {}} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600"><option>{day.end}</option></select><button onClick={() => toggleDay(index)} className={`h-4 w-4 rounded-full border-2 ${day.active ? "border-[#22c55e] bg-[#22c55e]" : "border-slate-300 bg-white"}`} aria-label={`Toggle ${day.name}`} /></div>)}</div></div>
                <Field label="Outside hours message" value="We are currently closed. Our business hours are Mon-Fri 9AM-7PM IST. We'll reply soon!" multiline />
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 sm:px-7"><button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22c55e] py-2.5 text-xs font-bold text-[#082113] transition hover:bg-[#1dae51]"><Save size={14} />{saved ? "Changes saved" : "Save Company Profile"}</button></div>
          </section>

          <section><div className="mb-4 flex items-end justify-between"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#159447]">Connected channels</p><h2 className="font-display text-[20px] font-bold tracking-tight">WhatsApp Business API</h2></div><span className="text-xs text-slate-400">Integration settings</span></div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,.03)]"><div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d9f7e4] text-[#159447]"><Webhook size={18} /></div><div><h3 className="text-sm font-bold">WhatsApp Business API Connection</h3><p className="mt-0.5 text-[11px] text-slate-500"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#22c55e]" />Connected · +91 98765 43210 · Acme Corp · Account ID: 112847392</p></div></div><div className="px-5 sm:px-7"><ConnectionRow label="Phone Number ID" value="1234567890" /><ConnectionRow label="WhatsApp Business Account ID" value="112847392" /><SecretRow label="Access Token" value="EAAJ2xQ3secureToken" regenerate /><ConnectionRow label="Webhook URL" value="https://connectlycrm.app/webhook/wa/acme" /><SecretRow label="Webhook Verify Token" value="wh_acme_2025_secure" regenerate /></div>
              <div className="mx-5 border-t border-slate-100 sm:mx-7"><button onClick={() => setMetaOpen(!metaOpen)} className="flex w-full items-center justify-between py-4 text-left text-xs font-bold text-slate-700"><span className="flex items-center gap-2"><ChevronDown size={15} className={`transition ${metaOpen ? "" : "-rotate-90"}`} />Meta App Settings</span><span className="text-[11px] font-normal text-slate-400">{metaOpen ? "Hide details" : "Show details"}</span></button>{metaOpen && <div className="border-t border-slate-100 pb-3"><ConnectionRow label="App ID" value="485920384756" /><SecretRow label="App Secret" value="meta-app-secret" /></div>}</div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4 sm:px-7"><button className={buttonClass} onClick={() => {}}><RefreshCw size={14} />Test Connection</button><button className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={() => {}}><X size={14} />Disconnect</button><button className="inline-flex items-center gap-2 rounded-lg bg-[#22c55e] px-3 py-2 text-xs font-bold text-[#082113] hover:bg-[#1dae51]" onClick={() => {}}><Link2 size={14} />Reconnect via Meta Embedded Signup</button></div>
              <div className="mx-5 mb-5 flex items-center gap-2 rounded-lg bg-[#effaf2] px-3 py-2.5 text-[11px] font-medium text-[#147a39] sm:mx-7"><ShieldCheck size={15} />Webhook verified and receiving messages · Last message received: 2 minutes ago</div>
            </div>
          </section>

          <section><div className="mb-4"><p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#159447]">Developer tools</p><h2 className="font-display text-[20px] font-bold tracking-tight">External Integrations & API Keys</h2></div><div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.03)]"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold">Your API Keys</h3><p className="mt-1 text-[11px] text-slate-500">Use keys to connect external tools to Connectly.</p></div><KeyRound size={18} className="text-slate-400" /></div><div className="overflow-x-auto"><table className="w-full min-w-[530px] text-left"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-bold">Key Name</th><th className="pb-2 font-bold">Key</th><th className="pb-2 font-bold">Created</th><th className="pb-2 font-bold">Last Used</th><th /></tr></thead><tbody>{apiKeys.map((key, index) => <tr key={key} className="border-b border-slate-100 text-[11px] last:border-0"><td className="py-3 font-semibold text-slate-700">{key}</td><td className="py-3 font-mono text-slate-500">{index ? "sk_test_••••••9c2d" : "sk_live_••••••3f8a"}</td><td className="py-3 text-slate-500">{index ? "Feb 5, 2025" : "Jan 1, 2025"}</td><td className="py-3 text-slate-500">{index ? "5 days ago" : "2 min ago"}</td><td className="py-3"><div className="flex gap-2"><CopyButton value={key} /><button onClick={() => setApiKeys((current) => current.filter((item) => item !== key))} className="text-red-500 hover:text-red-700" aria-label={`Revoke ${key}`}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div><button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#e9f8ee] px-3 py-2 text-xs font-bold text-[#148a40] hover:bg-[#d9f3e2]" onClick={() => setApiKeys((current) => [...current, `New API Key ${current.length + 1}`])}><Plus size={14} />Generate New API Key</button><a href="#" onClick={(event) => event.preventDefault()} className="ml-4 text-xs font-semibold text-slate-500 hover:text-[#148a40]">View API Documentation <ChevronRight size={13} className="inline" /></a></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.03)]"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold">Incoming Webhooks</h3><p className="mt-1 text-[11px] text-slate-500">Events delivered to your configured endpoints.</p></div><Webhook size={18} className="text-slate-400" /></div><div className="space-y-1">{[["Lead Form – Website", "https://connectlycrm.app/wh/lead/acme", "847 events", "bg-[#22c55e]"], ["Shopify Orders", "https://connectlycrm.app/wh/shopify/acme", "1,204 events", "bg-[#22c55e]"], ["Custom CRM Sync", "https://connectlycrm.app/wh/custom/acme", "34 events", "bg-amber-400"]].map(([name, url, events, color]) => <div key={name} className="group rounded-lg border border-slate-100 p-3 transition hover:border-slate-200"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${color}`} /><span className="text-xs font-bold text-slate-700">{name}</span><span className="ml-auto text-[10px] text-slate-400">{events}</span><button className="text-slate-400 opacity-0 transition group-hover:opacity-100" onClick={() => {}}><MoreHorizontal size={15} /></button></div><p className="mt-1 truncate pl-4 text-[10px] text-slate-400">{url}</p><div className="mt-2 flex gap-3 pl-4 text-[10px] font-semibold text-slate-500"><button onClick={() => {}}>Test</button><button onClick={() => {}}>Edit</button><button onClick={() => {}} className="text-red-500">Delete</button></div></div>)}</div><button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#e9f8ee] px-3 py-2 text-xs font-bold text-[#148a40] hover:bg-[#d9f3e2]" onClick={() => {}}><Plus size={14} />Add Webhook</button></div>
          </div></section>
        </div>
      </main>
    </div>
  </div>;
}