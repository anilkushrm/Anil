import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type Mode = "login" | "signup";
type SignupStep = 1 | 2 | 3;

const benefits = [
  "One shared view for every customer conversation",
  "Automations that still sound like your team",
  "A calm pipeline your whole team can trust",
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e] text-[#241d2a] shadow-[0_7px_18px_rgba(34,197,94,.24)]">
        <Zap size={18} fill="currentColor" strokeWidth={2.5} />
      </div>
      <div className="font-semibold tracking-[-.04em] text-[#f0fdf4]">
        Connectly <span className="text-[#22c55e]">CRM</span>
      </div>
    </div>
  );
}

function Rail() {
  return (
    <aside className="relative hidden min-h-[760px] w-[42%] shrink-0 overflow-hidden bg-[#0f172a] px-10 py-10 text-[#f0fdf4] lg:flex lg:flex-col xl:px-14">
      <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-[#22c55e]/20" />
      <div className="absolute -right-10 top-34 h-52 w-52 rounded-full border border-[#22c55e]/15" />
      <div className="absolute bottom-[-120px] left-[-80px] h-80 w-80 rounded-full bg-[#16a34a]/20 blur-3xl" />
      <div className="relative z-10">
        <Logo />
        <div className="mt-20 max-w-[390px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/25 bg-[#22c55e]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#86efac]">
            <Sparkles size={13} /> A better first hello
          </div>
          <h1 className="font-display text-[clamp(38px,4vw,60px)] font-bold leading-[.98] tracking-[-.065em]">
            Start with the<br /><span className="text-[#22c55e]">conversation.</span>
          </h1>
          <p className="mt-6 max-w-[340px] text-[14px] leading-6 text-[#cfc6d7]">
            Your team is already talking to customers. Connectly gives those conversations a place to go next.
          </p>
          <div className="mt-10 space-y-4">
            {benefits.map((benefit, index) => (
              <div key={benefit} className="flex items-start gap-3 text-[13px] leading-5 text-[#e6dfea]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-[#0f172a]">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span><b className="mr-1 text-[#86efac]">0{index + 1}</b> {benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-auto flex items-end justify-between border-t border-white/10 pt-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#aaa0b4]">The quiet advantage</div>
          <div className="mt-1 text-[12px] text-[#e8ddeb]">Made for teams who follow through.</div>
        </div>
        <div className="flex -space-x-2">
          {["NA", "JL", "PK"].map((initials, index) => (
            <div key={initials} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f172a] text-[9px] font-bold ${["bg-[#f2c6ad] text-[#713b2a]", "bg-[#b9d6ee] text-[#244b71]", "bg-[#d7c1e8] text-[#593d6f]"][index]}`}>{initials}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Input({ label, icon: Icon, type = "text", placeholder, value, onChange }: {
  label: string; icon: typeof Mail; type?: string; placeholder: string; value: string; onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.1em] text-[#756b79]">{label}</span>
      <span className="relative block">
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a49aa7]" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required className="h-12 w-full rounded-xl border border-[#ded5da] bg-[#ffffff] pl-11 pr-10 text-[13px] text-[#302735] outline-none transition focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 placeholder:text-[#ada5ac]" />
      </span>
    </label>
  );
}

function SignupFields({ step, setStep }: { step: SignupStep; setStep: (step: SignupStep) => void }) {
  const [company, setCompany] = useState("");
  const [team, setTeam] = useState("6–20");
  const [phone, setPhone] = useState("");
  if (step === 1) return (
    <div className="space-y-5">
      <Input label="Your work email" icon={Mail} type="email" placeholder="you@company.com" value={company} onChange={setCompany} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" icon={Users} placeholder="Maya" value={company} onChange={setCompany} />
        <Input label="Last name" icon={Users} placeholder="Patel" value={company} onChange={setCompany} />
      </div>
      <button onClick={() => setStep(2)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-[13px] font-bold text-[#ffffff] transition hover:bg-[#15803d]">Create my workspace <ArrowRight size={16} /></button>
      <p className="text-center text-[11px] leading-5 text-[#948b93]">By continuing, you agree to Connectly&apos;s terms and privacy policy.</p>
    </div>
  );
  if (step === 2) return (
    <div className="space-y-5">
      <Input label="Company name" icon={Users} placeholder="Northstar Studio" value={company} onChange={setCompany} />
      <div>
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.1em] text-[#756b79]">How big is your team?</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{["Just me", "2–5", "6–20", "21+"].map((size) => <button key={size} onClick={() => setTeam(size)} className={`h-11 rounded-xl border text-[12px] font-bold transition ${team === size ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]" : "border-[#ded5da] text-[#776c78] hover:border-[#c4b8bf]"}`}>{size}</button>)}</div>
      </div>
      <button onClick={() => setStep(3)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-[13px] font-bold text-[#ffffff] transition hover:bg-[#15803d]">Continue <ArrowRight size={16} /></button>
      <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-1 text-[12px] font-bold text-[#837782]"><ChevronLeft size={14} /> Back</button>
    </div>
  );
  return (
    <div className="space-y-5">
      <Input label="WhatsApp Business number" icon={MessageCircle} placeholder="+1 (415) 555-0182" value={phone} onChange={setPhone} />
      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-[12px] leading-5 text-[#166534]"><b className="text-[#15803d]">One last step.</b> We&apos;ll send a test message after you connect Meta, so your team can see the flow before going live.</div>
      <button onClick={() => setStep(1)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-[13px] font-bold text-[#ffffff] transition hover:bg-[#15803d]">Finish setup <Check size={16} /></button>
      <button onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-1 text-[12px] font-bold text-[#837782]"><ChevronLeft size={14} /> Back</button>
    </div>
  );
}

export function AuthPagesVariant() {
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); setNotice("You’re in. Loading your workspace…"); };
  return (
    <main className="flex min-h-[100dvh] w-full bg-[#f8fafc] font-sans">
      <Rail />
      <section className="flex min-w-0 flex-1 flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:hidden"><Logo /><span className="text-[11px] font-bold uppercase tracking-[.12em] text-[#978c96]">Connectly CRM</span></div>
        <div className="mx-auto flex w-full max-w-[470px] flex-1 flex-col justify-center py-10">
          <div className="mb-9 flex rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
            <button onClick={() => { setMode("login"); setNotice(""); }} className={`h-10 flex-1 rounded-lg text-[12px] font-bold transition ${mode === "login" ? "bg-[#0f172a] text-[#f0fdf4] shadow-sm" : "text-[#827682]"}`}>Sign in</button>
            <button onClick={() => { setMode("signup"); setNotice(""); }} className={`h-10 flex-1 rounded-lg text-[12px] font-bold transition ${mode === "signup" ? "bg-[#0f172a] text-[#f0fdf4] shadow-sm" : "text-[#827682]"}`}>Create account</button>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#16a34a]">{mode === "login" ? "Welcome back" : `Getting started · 0${step} of 03`}</p>
            <h2 className="font-display text-[34px] font-bold leading-none tracking-[-.06em] text-[#302735]">{mode === "login" ? "Pick up where you left off." : step === 1 ? "Make room for better follow-up." : step === 2 ? "Shape your workspace." : "Connect your first channel."}</h2>
            <p className="mt-3 text-[13px] leading-5 text-[#827782]">{mode === "login" ? "Your conversations are waiting." : "A few details now. A clearer sales day later."}</p>
          </div>
          {mode === "login" ? (
            <form onSubmit={submit} className="space-y-5">
              <button type="button" onClick={() => setNotice("Google sign-in is ready for your workspace.")} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#ded5da] bg-[#ffffff] text-[13px] font-bold text-[#514653] transition hover:border-[#c4b8bf]"><span className="font-display text-[18px] font-bold text-[#db7145]">G</span> Continue with Google</button>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#a89da5]"><span className="h-px flex-1 bg-[#ded5da]" />or use email<span className="h-px flex-1 bg-[#ded5da]" /></div>
              <Input label="Work email" icon={Mail} type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
              <label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#756b79]">Password</span><button type="button" onClick={() => setNotice("Password reset link requested.")} className="text-[11px] font-bold text-[#16a34a]">Forgot password?</button></div><span className="relative block"><LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a49aa7]" /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required className="h-12 w-full rounded-xl border border-[#ded5da] bg-[#ffffff] pl-11 pr-11 text-[13px] outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c929b]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
              <button type="submit" className="h-12 w-full rounded-xl bg-[#16a34a] text-[13px] font-bold text-[#ffffff] transition hover:bg-[#15803d]">Sign in to Connectly <ArrowRight className="ml-1 inline" size={15} /></button>
            </form>
          ) : <SignupFields step={step} setStep={setStep} />}
          {notice && <div className="mt-5 rounded-xl border border-[#d8e6d6] bg-[#edf7eb] px-4 py-3 text-[12px] font-semibold text-[#3e7044]">{notice}</div>}
          <p className="mt-9 text-center text-[12px] text-[#948b93]">{mode === "login" ? "New to Connectly?" : "Already have an account?"} <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-bold text-[#16a34a] hover:underline">{mode === "login" ? "Start a free workspace" : "Sign in instead"}</button></p>
        </div>
        <div className="mx-auto flex w-full max-w-[470px] items-center justify-between border-t border-[#e3d9d4] pt-4 text-[10px] font-semibold uppercase tracking-[.1em] text-[#a398a0]"><span>Private by default</span><span className="flex items-center gap-1"><LockKeyhole size={11} /> SOC2-ready infrastructure</span></div>
      </section>
    </main>
  );
}