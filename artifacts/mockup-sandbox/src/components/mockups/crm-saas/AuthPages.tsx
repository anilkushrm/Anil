import { useState } from "react";
import {
  Building2, Check, Eye, EyeOff, LockKeyhole, Mail, Phone,
  Sparkles, Star, User, Zap,
} from "lucide-react";

const features = [
  { text: "WhatsApp, Instagram & Facebook — ek inbox mein" },
  { text: "AI chatbot jo khud leads qualify karta hai" },
  { text: "Sequence messages — 1 saal tak auto-follow-up" },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8cf2a7] text-[#0f172a] shadow-[0_8px_24px_rgba(140,242,167,.25)]">
        <Zap size={21} fill="currentColor" strokeWidth={2.5} />
      </div>
      <div>
        <div className="text-[17px] font-bold tracking-tight text-white">
          Ai Botflow <span className="text-[#8cf2a7]">CRM</span>
        </div>
        <div className="text-[10px] tracking-widest text-slate-400 uppercase">Communication OS</div>
      </div>
    </div>
  );
}

/* ─── Left panel (dark brand side) ─── */
function LeftPanel() {
  return (
    <div className="relative hidden lg:flex flex-col w-[420px] shrink-0 bg-[#0d1929] px-10 py-10 overflow-hidden">
      {/* dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[.12]"
        style={{ backgroundImage: "radial-gradient(#7fa5c8 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
      {/* glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#22c55e]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#3b82f6]/10 blur-3xl" />

      <div className="relative">
        <Brand />
      </div>

      {/* headline */}
      <div className="relative mt-auto mb-auto pt-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8cf2a7]/20 bg-[#8cf2a7]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#a9f5ba] mb-6">
          <Sparkles size={11} /> Conversations that convert
        </div>
        <h2 className="text-[clamp(28px,3.2vw,42px)] font-bold leading-[1.08] tracking-tight text-white">
          Har conversation ka<br />
          <span className="text-[#8cf2a7]">ek clear next step.</span>
        </h2>
        <div className="mt-8 space-y-4">
          {features.map((f) => (
            <div key={f.text} className="flex items-start gap-3 text-[13px] leading-6 text-slate-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8cf2a7]/15 text-[#8cf2a7]">
                <Check size={12} strokeWidth={3} />
              </span>
              {f.text}
            </div>
          ))}
        </div>

        {/* mini dashboard preview */}
        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {["bg-red-400","bg-yellow-400","bg-green-400"].map(c=>(
                <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
              ))}
            </div>
            <div className="text-[10px] text-slate-400">Live Dashboard</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[["2,847","Leads","bg-emerald-500/10 border-emerald-500/20 text-emerald-300"],
              ["48k","Messages","bg-blue-500/10 border-blue-500/20 text-blue-300"],
              ["₹24L","Revenue","bg-purple-500/10 border-purple-500/20 text-purple-300"]].map(([v,l,cls])=>(
              <div key={l} className={`rounded-lg border p-2 ${cls}`}>
                <div className="text-[15px] font-bold">{v}</div>
                <div className="text-[9px] opacity-70">{l}</div>
              </div>
            ))}
          </div>
          <div className="h-14 rounded-md bg-white/5 flex items-end gap-1 px-2 pb-1">
            {[35,52,28,68,45,72,58,80,62,74].map((h,i)=>(
              <div key={i} style={{height:h*0.6}} className={`flex-1 rounded-sm ${i>6?"bg-[#55d77e]":"bg-[#55d77e]/30"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* social proof */}
      <div className="relative flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">2,400+ businesses trust us</div>
          <div className="mt-1.5 flex items-center gap-1 text-[#f6bd65]">
            {[1,2,3,4,5].map(i=><Star key={i} size={11} fill="currentColor" />)}
            <span className="ml-1 text-[11px] text-slate-400">4.9 / 5</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[["RK","bg-emerald-200 text-emerald-900"],["AM","bg-blue-200 text-blue-900"],["SJ","bg-purple-200 text-purple-900"]].map(([init,cls])=>(
            <div key={init} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0d1929] text-[10px] font-bold ${cls}`}>{init}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Login form ─── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="w-full">
      <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Welcome back 👋</h2>
      <p className="mt-1 text-[13px] text-slate-500">Apne workspace mein sign in karein</p>

      {/* Google */}
      <button className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Google se continue karein
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-100" />or<span className="h-px flex-1 bg-slate-100" />
      </div>

      <form className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Email</span>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" placeholder="you@company.com" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
          </div>
        </label>
        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</span>
            <button type="button" className="text-[12px] font-semibold text-[#22c55e] hover:underline">Bhool gaye?</button>
          </div>
          <div className="relative">
            <LockKeyhole size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type={showPwd ? "text" : "password"} placeholder="••••••••" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>
        <button type="submit" className="h-11 w-full rounded-xl bg-[#22c55e] text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(34,197,94,.3)] hover:bg-[#16a34a] transition">
          Sign In →
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-slate-500">
        Account nahi hai?{" "}
        <button onClick={onSwitch} className="font-bold text-[#22c55e] hover:underline">Free mein banayein</button>
      </p>
    </div>
  );
}

/* ─── Signup form ─── */
function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="w-full">
      <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Free account banayein 🚀</h2>
      <p className="mt-1 text-[13px] text-slate-500">14-day free trial · Credit card nahi chahiye</p>

      {/* Google */}
      <button className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Google se continue karein
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-100" />or<span className="h-px flex-1 bg-slate-100" />
      </div>

      <form className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">First Name</span>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Rahul" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Last Name</span>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Kumar" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
            </div>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Business Name</span>
          <div className="relative">
            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Acme Corp" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Work Email</span>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" placeholder="you@company.com" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone</span>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="tel" placeholder="+91 98765 43210" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</span>
          <div className="relative">
            <LockKeyhole size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type={showPwd ? "text" : "password"} placeholder="Min 8 characters" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-[13px] text-slate-800 outline-none focus:border-[#22c55e] focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition placeholder:text-slate-400" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>
        <button type="submit" className="h-11 w-full rounded-xl bg-[#22c55e] text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(34,197,94,.3)] hover:bg-[#16a34a] transition">
          Free Account Banayein →
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Sign up karne se aap hamare{" "}
          <span className="text-[#22c55e] cursor-pointer hover:underline">Terms</span> aur{" "}
          <span className="text-[#22c55e] cursor-pointer hover:underline">Privacy Policy</span> se agree karte hain
        </p>
      </form>

      <p className="mt-4 text-center text-[13px] text-slate-500">
        Already account hai?{" "}
        <button onClick={onSwitch} className="font-bold text-[#22c55e] hover:underline">Sign in karein</button>
      </p>
    </div>
  );
}

/* ─── Main export ─── */
export function AuthPages() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f5f8fb]">
      <LeftPanel />

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand />
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex rounded-2xl bg-slate-100 p-1">
            {(["login","signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,.07)]">
            {tab === "login"
              ? <LoginForm onSwitch={() => setTab("signup")} />
              : <SignupForm onSwitch={() => setTab("login")} />}
          </div>
        </div>
      </div>
    </div>
  );
}
