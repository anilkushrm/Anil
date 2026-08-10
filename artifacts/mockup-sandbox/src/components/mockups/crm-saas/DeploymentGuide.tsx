import { useState } from "react";
import {
  Server, Terminal, Database, Shield, Globe, Zap, CheckCircle2,
  Circle, Copy, ChevronDown, ChevronRight, AlertTriangle, Package,
  RefreshCw, Lock, Cpu, HardDrive, Wifi, ArrowRight, Check,
  FileText, Settings, Play, Star,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Step {
  id: number;
  title: string;
  duration: string;
  commands?: string[];
  notes?: string;
  warning?: string;
  tip?: string;
}
interface Phase {
  id: string;
  icon: typeof Server;
  color: string;
  bg: string;
  border: string;
  title: string;
  subtitle: string;
  steps: Step[];
}

// ─── Data ────────────────────────────────────────────────────────────────────
const PHASES: Phase[] = [
  {
    id: "vps", icon: Server, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
    title: "VPS Setup", subtitle: "Ubuntu 22.04 + SSH access",
    steps: [
      {
        id: 1, title: "Hostinger se VPS order karo", duration: "5 min",
        notes: "KVM 2 plan lo · Singapore location · Ubuntu 22.04 LTS · 24-month plan",
        tip: "Order ke baad 2–5 min mein VPS ready hoti hai. Email mein IP address aata hai.",
      },
      {
        id: 2, title: "SSH se VPS mein connect karo", duration: "2 min",
        commands: ["ssh root@YOUR_VPS_IP"],
        notes: "Password Hostinger dashboard mein milega. Pehli baar connect karte waqt 'yes' type karo.",
      },
      {
        id: 3, title: "System update karo", duration: "3 min",
        commands: [
          "apt update && apt upgrade -y",
          "apt install -y curl wget git build-essential ufw",
        ],
      },
      {
        id: 4, title: "Firewall setup karo", duration: "2 min",
        commands: [
          "ufw allow OpenSSH",
          "ufw allow 80",
          "ufw allow 443",
          "ufw enable",
        ],
        tip: "UFW firewall sirf HTTP, HTTPS aur SSH allow karega. Baaki sab band.",
      },
      {
        id: 5, title: "New user banao (root mat use karo)", duration: "3 min",
        commands: [
          "adduser connectly",
          "usermod -aG sudo connectly",
          "su - connectly",
        ],
        warning: "Production mein kabhi root user se app mat chalao. Security risk hai.",
      },
    ],
  },
  {
    id: "node", icon: Package, color: "text-green-600", bg: "bg-green-50", border: "border-green-200",
    title: "Node.js + PM2", subtitle: "App runtime aur process manager",
    steps: [
      {
        id: 1, title: "Node.js 20 LTS install karo", duration: "3 min",
        commands: [
          "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
          "sudo apt install -y nodejs",
          "node --version   # v20.x.x dikhna chahiye",
          "npm --version",
        ],
      },
      {
        id: 2, title: "PM2 install karo", duration: "1 min",
        commands: [
          "sudo npm install -g pm2",
          "pm2 --version",
        ],
        tip: "PM2 app ko background mein chalata hai aur crash hone pe auto-restart karta hai.",
      },
      {
        id: 3, title: "pnpm install karo", duration: "1 min",
        commands: [
          "sudo npm install -g pnpm",
          "pnpm --version",
        ],
      },
    ],
  },
  {
    id: "mongo", icon: Database, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    title: "MongoDB Setup", subtitle: "Database self-hosted on same VPS",
    steps: [
      {
        id: 1, title: "MongoDB 7.0 install karo", duration: "5 min",
        commands: [
          'curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor',
          'echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list',
          "sudo apt update && sudo apt install -y mongodb-org",
          "sudo systemctl start mongod",
          "sudo systemctl enable mongod",
        ],
      },
      {
        id: 2, title: "MongoDB admin user banao", duration: "3 min",
        commands: [
          "mongosh",
          "use admin",
          'db.createUser({ user: "connectlyadmin", pwd: "YOUR_STRONG_PASSWORD", roles: ["root"] })',
          "exit",
        ],
        warning: "Password strong rakhna — uppercase + lowercase + numbers + symbols. Example: C0nn3ctly@2025!",
      },
      {
        id: 3, title: "MongoDB auth enable karo", duration: "2 min",
        commands: [
          'sudo nano /etc/mongod.conf',
          "# security: section mein yeh add karo:",
          "# security:",
          "#   authorization: enabled",
          "sudo systemctl restart mongod",
        ],
      },
      {
        id: 4, title: "Database create karo", duration: "2 min",
        commands: [
          'mongosh "mongodb://connectlyadmin:YOUR_PASSWORD@localhost:27017/admin"',
          "use connectlycrm",
          'db.createCollection("tenants")',
          "exit",
        ],
      },
    ],
  },
  {
    id: "redis", icon: Zap, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200",
    title: "Redis Setup", subtitle: "Sessions, queues aur caching",
    steps: [
      {
        id: 1, title: "Redis install karo", duration: "2 min",
        commands: [
          "sudo apt install -y redis-server",
          "sudo systemctl enable redis-server",
          "sudo systemctl start redis-server",
          "redis-cli ping   # PONG aana chahiye",
        ],
      },
      {
        id: 2, title: "Redis password set karo", duration: "2 min",
        commands: [
          "sudo nano /etc/redis/redis.conf",
          "# requirepass YOUR_REDIS_PASSWORD  ← uncomment karo",
          "sudo systemctl restart redis-server",
        ],
      },
    ],
  },
  {
    id: "app", icon: Play, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",
    title: "App Deploy", subtitle: "Next.js app upload aur configure karo",
    steps: [
      {
        id: 1, title: "GitHub se code clone karo", duration: "2 min",
        commands: [
          "cd /var/www",
          "sudo mkdir connectlycrm && sudo chown connectly:connectly connectlycrm",
          "cd connectlycrm",
          "git clone https://github.com/YOUR_USERNAME/connectlycrm.git .",
        ],
        tip: "Agar private repo hai toh GitHub Personal Access Token use karo.",
      },
      {
        id: 2, title: "Dependencies install karo", duration: "3 min",
        commands: [
          "pnpm install",
        ],
      },
      {
        id: 3, title: ".env.production file banao", duration: "5 min",
        commands: [
          "nano .env.production",
          "",
          "# Yeh variables set karo:",
          "NODE_ENV=production",
          "MONGODB_URI=mongodb://connectlyadmin:PASSWORD@localhost:27017/connectlycrm",
          "REDIS_URL=redis://:REDIS_PASSWORD@localhost:6379",
          "NEXTAUTH_SECRET=your-super-secret-32-char-key",
          "NEXTAUTH_URL=https://yourdomain.com",
          "OPENAI_API_KEY=sk-...",
          "META_APP_ID=485920384756",
          "META_APP_SECRET=your-meta-app-secret",
          "SESSION_SECRET=another-32-char-secret",
        ],
        warning: ".env file ko kabhi GitHub pe push mat karo. .gitignore mein add karo.",
      },
      {
        id: 4, title: "App build karo", duration: "5–10 min",
        commands: [
          "pnpm run build",
          "# Build successful honi chahiye — .next folder banega",
        ],
      },
      {
        id: 5, title: "PM2 se app start karo", duration: "2 min",
        commands: [
          'pm2 start "pnpm start" --name "connectlycrm" --env production',
          "pm2 save",
          "pm2 startup   # auto-start on VPS reboot",
          "pm2 status    # running dikhna chahiye",
          "pm2 logs connectlycrm   # logs dekhne ke liye",
        ],
      },
    ],
  },
  {
    id: "nginx", icon: Globe, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200",
    title: "Nginx + SSL", subtitle: "Reverse proxy aur free HTTPS",
    steps: [
      {
        id: 1, title: "Nginx install karo", duration: "2 min",
        commands: [
          "sudo apt install -y nginx",
          "sudo systemctl enable nginx",
          "sudo systemctl start nginx",
        ],
      },
      {
        id: 2, title: "Nginx config banao", duration: "5 min",
        commands: [
          "sudo nano /etc/nginx/sites-available/connectlycrm",
          "",
          "server {",
          "  listen 80;",
          "  server_name yourdomain.com www.yourdomain.com;",
          "",
          "  location / {",
          "    proxy_pass http://localhost:3000;",
          "    proxy_http_version 1.1;",
          "    proxy_set_header Upgrade $http_upgrade;",
          "    proxy_set_header Connection 'upgrade';",
          "    proxy_set_header Host $host;",
          "    proxy_cache_bypass $http_upgrade;",
          "  }",
          "}",
          "",
          "sudo ln -s /etc/nginx/sites-available/connectlycrm /etc/nginx/sites-enabled/",
          "sudo nginx -t   # config test",
          "sudo systemctl reload nginx",
        ],
      },
      {
        id: 3, title: "Free SSL certificate lagao", duration: "3 min",
        commands: [
          "sudo apt install -y certbot python3-certbot-nginx",
          "sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com",
          "# Email dalo, terms accept karo",
          "# Auto-renewal test:",
          "sudo certbot renew --dry-run",
        ],
        tip: "SSL certificate 90 din mein expire hota hai — Certbot automatically renew karta hai.",
      },
    ],
  },
  {
    id: "cloudflare", icon: Shield, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200",
    title: "Cloudflare", subtitle: "Free CDN + DDoS protection",
    steps: [
      {
        id: 1, title: "Cloudflare account banao", duration: "5 min",
        notes: "cloudflare.com pe free account banao. Domain add karo. Cloudflare nameservers Hostinger ke domain settings mein lagao.",
      },
      {
        id: 2, title: "DNS Records set karo", duration: "2 min",
        commands: [
          "A record  →  yourdomain.com    →  YOUR_VPS_IP  (Proxied: ON ☁️)",
          "A record  →  www               →  YOUR_VPS_IP  (Proxied: ON ☁️)",
        ],
        tip: "Proxied (orange cloud) ON rakhna — Cloudflare IP hide karta hai, DDoS se bachata hai.",
      },
      {
        id: 3, title: "SSL/TLS mode set karo", duration: "1 min",
        notes: "Cloudflare Dashboard → SSL/TLS → Mode: Full (Strict) select karo.",
      },
    ],
  },
];

const CHECKLIST = [
  { label: "VPS IP set hai", done: true },
  { label: "Domain DNS Cloudflare se point ho raha hai", done: true },
  { label: "HTTPS kaam kar raha hai (https://)", done: true },
  { label: "MongoDB auth enabled hai", done: true },
  { label: "PM2 app running hai", done: true },
  { label: ".env file secured hai (chmod 600)", done: false },
  { label: "MongoDB daily backup schedule karo", done: false },
  { label: "Monitoring setup karo (Better Uptime free)", done: false },
  { label: "Test signup karo — full flow verify karo", done: false },
];

// ─── Code Block ──────────────────────────────────────────────────────────────
function CodeBlock({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const code = lines.filter(l => l !== "").join("\n");
  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mt-3 rounded-xl bg-[#0f172a] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition">
          {copied ? <><Check size={11} className="text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy size={11} />Copy</>}
        </button>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        {lines.filter(l => l !== "").map((line, i) => (
          <div key={i} className={`font-mono text-[11px] leading-relaxed ${line.startsWith("#") ? "text-slate-500 italic" : line.startsWith("NODE_ENV") || line.startsWith("MONGODB") || line.startsWith("REDIS") || line.startsWith("NEXT") || line.startsWith("OPENAI") || line.startsWith("META") || line.startsWith("SESSION") ? "text-[#93c5fd]" : "text-[#86efac]"}`}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Phase Card ──────────────────────────────────────────────────────────────
function PhaseCard({ phase, phaseIndex }: { phase: Phase; phaseIndex: number }) {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const Icon = phase.icon;

  return (
    <div className={`rounded-2xl border ${phase.border} bg-white overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,.06)]`}>
      <div className={`flex items-center gap-4 ${phase.bg} border-b ${phase.border} px-6 py-4`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${phase.color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${phase.color} opacity-70`}>Phase {phaseIndex + 1}</span>
          </div>
          <h2 className="text-[15px] font-bold text-slate-800">{phase.title}</h2>
          <p className="text-[11px] text-slate-500">{phase.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <span>{phase.steps.length} steps</span>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {phase.steps.map((step, idx) => (
          <div key={step.id}>
            <button
              onClick={() => setOpenStep(openStep === idx ? null : idx)}
              className="flex w-full items-center gap-3 px-6 py-3.5 text-left hover:bg-slate-50 transition"
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${phase.bg} ${phase.color}`}>
                {idx + 1}
              </div>
              <span className="flex-1 text-[13px] font-semibold text-slate-700">{step.title}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1"><Settings size={10} />{step.duration}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${openStep === idx ? "rotate-180" : ""}`} />
            </button>

            {openStep === idx && (
              <div className="px-6 pb-5">
                {step.notes && (
                  <p className="mb-2 text-[12px] text-slate-600 leading-relaxed">📌 {step.notes}</p>
                )}
                {step.commands && step.commands.length > 0 && (
                  <CodeBlock lines={step.commands} />
                )}
                {step.warning && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-[11px] text-red-700">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
                    <span>{step.warning}</span>
                  </div>
                )}
                {step.tip && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 text-[11px] text-blue-700">
                    <Star size={13} className="mt-0.5 shrink-0 text-blue-500" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function DeploymentGuide() {
  const [checkItems, setCheckItems] = useState(CHECKLIST);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const done = checkItems.filter(c => c.done).length;

  const toggleCheck = (i: number) => {
    setCheckItems(items => items.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));
  };

  const visiblePhases = activePhase ? PHASES.filter(p => p.id === activePhase) : PHASES;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22c55e] text-[#092314] shadow-md shadow-green-200">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800">Connectly CRM — Deployment Guide</div>
              <div className="text-[10px] text-slate-400">Hostinger KVM 2 · Ubuntu 22.04 · Next.js + MongoDB</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="h-1.5 w-24 rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-[#22c55e] transition-all" style={{ width: `${(done / checkItems.length) * 100}%` }} />
              </div>
              <span className="text-[11px] font-bold text-slate-600">{done}/{checkItems.length} done</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Phase filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActivePhase(null)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${!activePhase ? "bg-[#0f172a] text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}
          >
            All Phases
          </button>
          {PHASES.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(activePhase === p.id ? null : p.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold transition ${activePhase === p.id ? "bg-[#0f172a] text-white" : `bg-white border ${p.border} ${p.color} hover:${p.bg}`}`}
              >
                <Icon size={11} /> {p.title}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main phases */}
          <div className="col-span-2 space-y-5">
            {visiblePhases.map((phase, i) => (
              <div key={phase.id}>
                {!activePhase && i > 0 && (
                  <div className="my-3 flex items-center justify-center gap-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <ArrowRight size={14} className="text-slate-300" />
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                )}
                <PhaseCard phase={phase} phaseIndex={activePhase ? PHASES.findIndex(p => p.id === phase.id) : i} />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Go-live checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,.04)]">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#22c55e]" />
                <h3 className="text-[13px] font-bold text-slate-800">Go-Live Checklist</h3>
              </div>
              <div className="space-y-2">
                {checkItems.map((item, i) => (
                  <button key={i} onClick={() => toggleCheck(i)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50">
                    {item.done
                      ? <CheckCircle2 size={14} className="shrink-0 text-[#22c55e]" />
                      : <Circle size={14} className="shrink-0 text-slate-300" />}
                    <span className={`text-[11px] font-medium ${item.done ? "line-through text-slate-400" : "text-slate-600"}`}>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#f0fdf4] border border-green-100 px-3 py-2.5 text-center">
                <div className="text-[20px] font-bold text-[#16a34a]">{done}/{checkItems.length}</div>
                <div className="text-[10px] text-slate-500">tasks complete</div>
              </div>
            </div>

            {/* Cost summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,.04)]">
              <h3 className="mb-3 text-[13px] font-bold text-slate-800">💰 Monthly Cost</h3>
              <div className="space-y-2">
                {[
                  ["Hostinger KVM 2", "$8.99"],
                  ["MongoDB (self-hosted)", "$0"],
                  ["Redis (self-hosted)", "$0"],
                  ["Cloudflare CDN + SSL", "$0"],
                  ["Let's Encrypt SSL", "$0"],
                  ["Resend Email (3K free)", "$0"],
                  ["OpenAI API (starter)", "~$15"],
                ].map(([label, cost]) => (
                  <div key={label} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-bold ${cost === "$0" ? "text-green-500" : "text-slate-700"}`}>{cost}</span>
                  </div>
                ))}
                <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-700">Total</span>
                  <span className="text-[16px] font-bold text-[#0f172a]">~$24/mo</span>
                </div>
              </div>
            </div>

            {/* Time estimate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,.04)]">
              <h3 className="mb-3 text-[13px] font-bold text-slate-800">⏱️ Time Estimate</h3>
              <div className="space-y-2">
                {[
                  ["VPS Setup", "15 min"],
                  ["Node.js + PM2", "5 min"],
                  ["MongoDB", "15 min"],
                  ["Redis", "5 min"],
                  ["App Deploy", "20 min"],
                  ["Nginx + SSL", "10 min"],
                  ["Cloudflare", "10 min"],
                ].map(([phase, time]) => (
                  <div key={phase} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{phase}</span>
                    <span className="font-semibold text-slate-700">{time}</span>
                  </div>
                ))}
                <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-700">Total</span>
                  <span className="text-[14px] font-bold text-[#16a34a]">~80 min</span>
                </div>
              </div>
            </div>

            {/* Useful commands */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,.04)]">
              <h3 className="mb-3 text-[13px] font-bold text-slate-800">🔧 Useful Commands</h3>
              <div className="space-y-2">
                {[
                  ["App restart", "pm2 restart connectlycrm"],
                  ["App logs", "pm2 logs connectlycrm"],
                  ["App status", "pm2 status"],
                  ["Nginx restart", "sudo systemctl restart nginx"],
                  ["MongoDB shell", "mongosh -u connectlyadmin -p"],
                  ["Disk space", "df -h"],
                  ["RAM usage", "free -m"],
                ].map(([label, cmd]) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-700">{cmd}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-2xl bg-[#0f172a] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={16} className="text-[#22c55e]" fill="currentColor" />
            <span className="text-[14px] font-bold text-white">Connectly CRM — Live on Hostinger!</span>
          </div>
          <p className="text-[12px] text-slate-400">Sab steps complete hone ke baad <span className="text-[#65e58c] font-semibold">https://yourdomain.com</span> pe app accessible hoga.</p>
          <div className="mt-4 flex justify-center gap-3">
            {["Next.js 14", "MongoDB 7", "Redis 7", "Nginx", "PM2", "Cloudflare", "Let's Encrypt"].map(tag => (
              <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-300">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
