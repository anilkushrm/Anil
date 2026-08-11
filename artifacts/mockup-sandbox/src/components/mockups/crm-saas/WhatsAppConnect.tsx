import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  LockKeyhole,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Zap,
} from "lucide-react";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8cf2a7] text-[#0f172a] shadow-[0_8px_24px_rgba(140,242,167,.18)]">
        <Zap size={21} fill="currentColor" strokeWidth={2.5} />
      </div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-.03em] text-white">
          Ai Botflow <span className="text-[#8cf2a7]">CRM</span>
        </div>
        <div className="mt-0.5 text-[10px] tracking-[.06em] text-slate-400">Conversation OS for modern sales teams</div>
      </div>
    </div>
  );
}

function MetaMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1877f2] text-white">
      <span className="text-[21px] font-bold leading-none">∞</span>
    </span>
  );
}

function Step({ number, label, active, done }: { number: string; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${done ? "bg-[#8cf2a7] text-[#102118]" : active ? "bg-[#22c55e] text-[#072313]" : "border border-slate-600 text-slate-500"}`}>
        {done ? <Check size={13} strokeWidth={3} /> : number}
      </span>
      <span className={`text-[11px] font-semibold ${active ? "text-white" : done ? "text-slate-300" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

function ConnectionIllustration({ connected }: { connected: boolean }) {
  return (
    <div className="relative mt-10 flex h-[198px] items-center justify-center overflow-hidden rounded-2xl border border-[#24344b] bg-[#121f34]">
      <div className="absolute inset-0 opacity-[.2]" style={{ backgroundImage: "radial-gradient(#9aabc0 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative flex items-center gap-8">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-[#52667e] bg-[#1b2c43] shadow-[0_10px_24px_rgba(0,0,0,.18)]">
          <MetaMark />
        </div>
        <div className="relative w-[74px]">
          <div className="h-px w-full bg-[#52667e]" />
          <div className={`absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border ${connected ? "border-[#8cf2a7] bg-[#193a2b] text-[#8cf2a7]" : "border-[#52667e] bg-[#1b2c43] text-slate-400"}`}>
            {connected ? <Check size={15} strokeWidth={3} /> : <ChevronRight size={15} />}
          </div>
        </div>
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-[#8cf2a7]/40 bg-[#193a2b] text-[#8cf2a7] shadow-[0_10px_24px_rgba(75,210,120,.12)]">
          <MessageCircle size={35} fill="currentColor" strokeWidth={1.8} />
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{connected ? "Business account connected" : "Secure Meta connection"}</div>
    </div>
  );
}

export function WhatsAppConnect() {
  const [connected, setConnected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("+91 98765 43210");

  return (
    <main className="flex min-h-[100dvh] w-full flex-col bg-[#f4f7f5] font-sans text-[#18263d] md:flex-row">
      <section className="relative flex min-h-[560px] flex-1 overflow-hidden bg-[#0f172a] px-8 py-9 text-white lg:min-h-[720px] lg:px-[clamp(36px,6vw,88px)]">
        <div className="pointer-events-none absolute inset-0 opacity-[.15]" style={{ backgroundImage: "radial-gradient(#8fa0b9 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative mx-auto flex w-full max-w-[580px] flex-col">
          <Brand />
          <div className="my-auto py-14">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#8cf2a7]/20 bg-[#8cf2a7]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#a9f5ba]">
              <Sparkles size={13} /> One last connection
            </div>
            <h1 className="max-w-[490px] font-[family-name:var(--font-display)] text-[clamp(36px,4.7vw,60px)] font-bold leading-[1.02] tracking-[-.06em] text-white">
              Bring every reply<br /><span className="text-[#8cf2a7]">into one place.</span>
            </h1>
            <p className="mt-7 max-w-[390px] text-[14px] leading-6 text-slate-400">Connect your WhatsApp Business account through Meta. Your existing number, catalog and customer history stay yours.</p>
            <div className="mt-9 space-y-4">
              {[
                ["ShieldCheck", "Official Meta connection", "No passwords are shared with Ai Botflow."],
                ["MessageCircle", "Reply from your team inbox", "Keep the conversation moving, together."],
                ["Clock3", "Ready in about 2 minutes", "We’ll send a test message before you finish."],
              ].map(([icon, title, detail]) => {
                const Icon = icon === "ShieldCheck" ? ShieldCheck : icon === "MessageCircle" ? MessageCircle : Clock3;
                return <div key={title} className="flex items-start gap-3"><Icon size={17} className="mt-0.5 shrink-0 text-[#8cf2a7]" /><div><div className="text-[12px] font-bold text-slate-200">{title}</div><div className="mt-0.5 text-[11px] leading-4 text-slate-500">{detail}</div></div></div>;
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-slate-700/70 pt-5">
            <Step number="1" label="Workspace" done /><Step number="2" label="Team" done /><Step number="3" label="WhatsApp" active />
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-[#f4f7f5] px-5 py-8 sm:px-10 lg:px-16">
        <div className="w-full max-w-[560px]">
          <div className="mb-7 flex items-center justify-between">
            <div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#159447]">Step 3 of 3</div><h2 className="mt-1 font-[family-name:var(--font-display)] text-[29px] font-bold tracking-[-.045em] text-[#18263d]">Connect WhatsApp</h2></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9e6dd] bg-white text-[#159447]"><MessageCircle size={20} /></div>
          </div>

          <div className="rounded-[22px] border border-[#dce7df] bg-white p-5 shadow-[0_18px_50px_rgba(40,75,54,.08)] sm:p-7">
            <div className="flex items-start gap-3">
              <MetaMark />
              <div className="flex-1"><div className="text-[14px] font-bold text-[#18263d]">Connect with Meta</div><p className="mt-1 text-[12px] leading-5 text-slate-500">Use Meta Embedded Signup to securely link your WhatsApp Business account.</p></div>
              {connected && <CheckCircle2 size={19} className="text-[#16a34a]" />}
            </div>
            <ConnectionIllustration connected={connected} />
            {!connected ? (
              <div className="mt-5">
                <button onClick={() => setConnected(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1877f2] text-[13px] font-bold text-white transition hover:bg-[#1265d0]"><MetaMark /> Continue with Meta <ArrowRight size={15} /></button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400"><LockKeyhole size={12} /> You’ll be redirected to Meta for secure authorization</div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#ccebd5] bg-[#effaf2] p-3.5"><div className="flex items-center gap-2 text-[12px] font-bold text-[#176b35]"><CheckCircle2 size={16} /> WhatsApp Business account connected</div><div className="mt-1 pl-6 text-[11px] text-[#558163]">Ai Botflow Demo Business · +91 98765 43210</div></div>
            )}

            {connected && <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4 flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5f7e9] text-[#159447]"><Smartphone size={13} /></span><div className="text-[13px] font-bold text-[#18263d]">Verify your business number</div></div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">WhatsApp number</label>
              <div className="flex gap-2"><div className="relative flex-1"><Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-[13px] outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10" /></div><button onClick={() => setVerified(true)} className={`h-10 rounded-lg px-4 text-[12px] font-bold ${verified ? "bg-[#e7f8eb] text-[#159447]" : "bg-[#18263d] text-white hover:bg-[#263952]"}`}>{verified ? "Verified" : "Send code"}</button></div>
              <div className={`mt-5 rounded-xl border p-3.5 ${verified ? "border-[#ccebd5] bg-[#effaf2]" : "border-[#e6edf0] bg-[#f8faf9]"}`}><div className="flex items-start gap-2"><Info size={15} className={`mt-0.5 ${verified ? "text-[#159447]" : "text-slate-400"}`} /><div className="text-[11px] leading-5 text-slate-500">{verified ? "Number verified. Send a message to make sure your team is ready to reply." : "We’ll send a one-time verification code to this number."}</div></div></div>
              {verified && <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#dce7df] bg-[#fbfdfb] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff6e6] text-[#159447]"><Send size={16} /></div><div className="flex-1"><div className="text-[12px] font-bold text-[#18263d]">Send a test message</div><div className="mt-0.5 text-[10px] text-slate-500">Check that messages arrive in your inbox.</div></div><button onClick={() => setSent(true)} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${sent ? "bg-[#e7f8eb] text-[#159447]" : "bg-[#22c55e] text-[#072313]"}`}>{sent ? "Sent" : "Send test"}</button></div>}
            </div>}
          </div>
          <div className="mt-5 flex items-center justify-between"><button onClick={() => setConnected(false)} className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-[#18263d]"><ArrowLeft size={14} /> Back</button><button onClick={() => {}} className="flex items-center gap-2 rounded-lg bg-[#22c55e] px-5 py-2.5 text-[12px] font-bold text-[#072313] shadow-[0_7px_18px_rgba(34,197,94,.18)] hover:bg-[#1caf4e]">Finish setup <ArrowRight size={14} /></button></div>
          <div className="mt-7 flex items-center justify-center gap-1.5 text-[10px] text-slate-400"><ShieldCheck size={13} className="text-[#159447]" /> Your data is encrypted and private by default</div>
        </div>
      </section>
    </main>
  );
}