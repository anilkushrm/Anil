import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  Globe2,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

const features = [
  "AI-powered replies across WhatsApp, Instagram & Facebook",
  "Lead pipeline that updates itself",
  "Sequence messages up to 1 year",
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8cf2a7] text-[#0f172a] shadow-[0_8px_24px_rgba(140,242,167,.18)]">
        <Zap size={21} fill="currentColor" strokeWidth={2.5} />
      </div>
      <div>
        <div className="font-display text-[17px] font-bold tracking-[-.03em] text-white">
          Connectly <span className="text-[#8cf2a7]">CRM</span>
        </div>
        <div className="mt-0.5 text-[10px] tracking-[.06em] text-slate-400">
          Conversation OS for modern sales teams
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</span>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </label>
  );
}

function MiniPreview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_35px_rgba(15,23,42,.08)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-2.5 w-20 rounded-full bg-[#18263d]" />
        <div className="h-5 w-5 rounded-full bg-[#d4f8dd]" />
      </div>
      <div className="grid grid-cols-[62px_1fr] gap-2">
        <div className="space-y-1.5 rounded-md bg-[#101a2e] p-2">
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className={`h-1.5 rounded-full ${item === 2 ? "bg-[#7ce99d]" : "bg-slate-600"}`} />)}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-11 rounded-md bg-[#e7f9ed]" />
            <div className="h-11 rounded-md bg-[#fff0e7]" />
            <div className="h-11 rounded-md bg-[#e9f1ff]" />
          </div>
          <div className="h-16 rounded-md bg-[#f3f6f8]">
            <div className="flex items-end gap-1 px-2 pt-5">
              {[34, 47, 26, 55, 42, 66, 51, 73].map((height, i) => <div key={i} style={{ height }} className={`w-2 rounded-t-sm ${i > 4 ? "bg-[#55d77e]" : "bg-[#b7eac4]"}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPanel() {
  return (
    <section className="relative flex min-h-[720px] flex-1 overflow-hidden bg-[#0f172a] px-8 py-10 text-white lg:px-[clamp(32px,5vw,78px)]">
      <div className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ backgroundImage: "radial-gradient(#8fa0b9 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col">
        <Brand />
        <div className="my-auto py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#8cf2a7]/20 bg-[#8cf2a7]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#a9f5ba]">
            <Sparkles size={13} /> Built for conversations that convert
          </div>
          <h1 className="max-w-[470px] font-display text-[clamp(34px,4vw,54px)] font-bold leading-[1.03] tracking-[-.055em] text-white">
            Every conversation.<br /><span className="text-[#8cf2a7]">One clear next step.</span>
          </h1>
          <div className="mt-10 space-y-5">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-[14px] leading-6 text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8cf2a7]/15 text-[#8cf2a7]"><Check size={13} strokeWidth={3} /></span>
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.13em] text-slate-400">Trusted by 2,400+ businesses</div>
            <div className="mt-2 flex items-center gap-1 text-[#f6bd65]">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill="currentColor" />)}<span className="ml-1 text-[11px] text-slate-400">4.9 / 5</span></div>
          </div>
          <div className="flex -space-x-2">
            {["bg-[#f2c6ad] text-[#713b2a]", "bg-[#b9d6ee] text-[#244b71]", "bg-[#d7c1e8] text-[#593d6f]"].map((tone, i) => <div key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f172a] text-[10px] font-bold ${tone}`}>{["RK", "AM", "SJ"][i]}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <section className="flex min-h-[720px] flex-1 items-center justify-center bg-[#f6f8f7] px-6 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,.08)]">
        <div className="mb-8">
          <h2 className="font-display text-[27px] font-bold tracking-[-.04em] text-[#152238]">Welcome back</h2>
          <p className="mt-1 text-[13px] text-slate-500">Sign in to your workspace</p>
        </div>
        <button onClick={() => {}} className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-[13px] font-bold text-slate-700 transition hover:bg-slate-50">
          <span className="font-display text-[18px] font-bold text-[#4285f4]">G</span> Continue with Google
        </button>
        <div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.1em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or sign in with email<span className="h-px flex-1 bg-slate-200" /></div>
        <form onSubmit={(event) => { event.preventDefault(); }} className="space-y-4">
          <Field label="Work email" icon={Mail}><input type="email" required placeholder="you@company.com" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /></Field>
          <Field label="Password" icon={LockKeyhole}><input type={showPassword ? "text" : "password"} required placeholder="Enter your password" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={16} /></button></Field>
          <div className="flex justify-end"><button type="button" onClick={() => {}} className="text-[12px] font-bold text-[#159447] hover:underline">Forgot password?</button></div>
          <button type="submit" onClick={() => {}} className="h-11 w-full rounded-lg bg-[#22c55e] text-[13px] font-bold text-[#072313] transition hover:bg-[#1caf4e]">{false ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-7 text-center text-[12px] text-slate-500">Don&apos;t have an account? <button onClick={() => {}} className="font-bold text-[#159447] hover:underline">Start free trial <ArrowRight className="inline" size={13} /></button></p>
      </div>
    </section>
  );
}

function SignupPanel() {
  const [team, setTeam] = useState("6-20");
  const [continued, setContinued] = useState(false);
  return (
    <section className="relative flex min-h-[720px] flex-1 flex-col overflow-auto bg-[#f6f8f7] px-8 py-9 text-[#152238]">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-10 flex items-center justify-between">
          <div className="font-display text-[15px] font-bold tracking-[-.03em] text-[#152238]">Connectly <span className="text-[#159447]">CRM</span></div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.08em] text-slate-400"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d8f7df] text-[#159447]"><Check size={13} /></span> Account <span className="mx-1 h-px w-6 bg-slate-300" /><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e] text-[#062112]">2</span> <span className="text-slate-700">Company Setup</span> <span className="mx-1 h-px w-6 bg-slate-300" /><span>3&nbsp; Connect WhatsApp</span></div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_220px] lg:items-start lg:justify-center">
          <div>
            <h2 className="font-display text-[28px] font-bold tracking-[-.05em]">Set up your workspace</h2>
            <p className="mt-2 text-[13px] text-slate-500">Tell us about your company so we can personalize your CRM</p>
            <div className="mt-7 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.04)]">
              <Field label="Company name" icon={Users}><input defaultValue="Acme Corporation" className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-[13px] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /></Field>
              <Field label="Industry" icon={Globe2}><div className="relative"><select defaultValue="E-commerce" className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-[13px] outline-none focus:border-[#22c55e]"><option>E-commerce</option><option>SaaS</option><option>Education</option><option>Healthcare</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div></Field>
              <div><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Team size</span><div className="grid grid-cols-4 gap-2">{["1-5", "6-20", "21-100", "100+"].map((size) => <button key={size} type="button" onClick={() => setTeam(size)} className={`h-9 rounded-lg border text-[11px] font-bold transition ${team === size ? "border-[#22c55e] bg-[#e9faed] text-[#12843d]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{size}</button>)}</div></div>
              <Field label="WhatsApp Business number" icon={MessageCircle}><input placeholder="+91 98765 43210" className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /></Field>
              <Field label="Company website" icon={Globe2}><input placeholder="https://yourcompany.com" className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /></Field>
              <div className="grid grid-cols-2 gap-3"><Field label="Timezone" icon={Globe2}><select defaultValue="Asia/Kolkata (IST)" className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-2 text-[11px] outline-none"><option>Asia/Kolkata (IST)</option><option>Europe/London (GMT)</option><option>America/New_York (EST)</option></select></Field><Field label="Primary language" icon={Globe2}><select defaultValue="English" className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-2 text-[11px] outline-none"><option>English</option><option>Hindi</option></select></Field></div>
              <button onClick={() => setContinued(true)} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#22c55e] text-[13px] font-bold text-[#072313] hover:bg-[#1caf4e]">{continued ? "Workspace details saved" : "Continue to WhatsApp Setup"} <ArrowRight size={16} /></button>
              <button onClick={() => {}} className="flex w-full items-center justify-center gap-1 pt-1 text-[12px] font-bold text-slate-500 hover:text-slate-800"><ArrowLeft size={14} /> Back</button>
            </div>
          </div>
          <div className="mt-12 rounded-2xl border border-[#dbe8df] bg-[#edf7f0] p-4">
            <div className="mb-3 text-[11px] font-bold leading-4 text-[#315441]">Your workspace<br />will look like:</div>
            <MiniPreview />
            <div className="mt-3 flex items-center gap-1.5 text-[10px] leading-4 text-[#557261]"><ShieldCheck size={14} className="shrink-0 text-[#159447]" /> Private by default.<br />You control access.</div>
          </div>
        </div>
        <div className="mt-8 text-center text-[11px] font-semibold text-slate-400">Step 2 of 3 <span className="mx-2 text-slate-300">·</span> ~2 minutes remaining</div>
      </div>
    </section>
  );
}

export function AuthPages() {
  return <main className="flex min-h-[100dvh] w-full flex-col font-sans md:flex-row"><div className="flex min-w-0 flex-1 flex-col xl:flex-row"><LoginPanel /><LoginCard /></div><SignupPanel /></main>;
}