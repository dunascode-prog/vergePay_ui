import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Check,
  FileText,
  History,
  LayoutGrid,
  LineChart,
  Mail,
  PiggyBank,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Product previews for the landing page, drawn in code so they stay crisp at
// any size and match the real app. The figures are illustrative.

const BARS = [
  { m: "May", in: 52, out: 30 },
  { m: "Jun", in: 61, out: 38 },
  { m: "Jul", in: 48, out: 35 },
  { m: "Aug", in: 74, out: 41 },
  { m: "Sep", in: 69, out: 37 },
  { m: "Oct", in: 88, out: 44 },
];

function MiniBars({ dark = false, labels = false, className }: { dark?: boolean; labels?: boolean; className?: string }) {
  return (
    <div className={cn("flex gap-2.5", className)}>
      {BARS.map((b) => (
        <div key={b.m} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-[3px]">
            <span className="w-full max-w-3 rounded-t-[4px] bg-(--vp-accent)" style={{ height: `${b.in}%` }} />
            <span className={cn("w-full max-w-3 rounded-t-[4px]", dark ? "bg-white/20" : "bg-zinc-300")} style={{ height: `${b.out}%` }} />
          </div>
          {labels && <span className={cn("text-[10px]", dark ? "text-white/45" : "text-zinc-500")}>{b.m}</span>}
        </div>
      ))}
    </div>
  );
}

/** Hero: the dashboard in a dark frame, fading out at the bottom. */
export function HeroDashboardMock() {
  const rail = [LayoutGrid, Wallet, ArrowLeftRight, FileText, Users, PiggyBank, LineChart, Settings];
  return (
    <div className="relative mx-auto w-full max-w-5xl" role="img" aria-label="The VergePay dashboard: total balance, quick actions, invoices collected this month, cash flow, wallets and recent activity">
      {/* the glow behind the frame */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-(--vp-accent) opacity-25 blur-[80px]" />
      <div className="relative rounded-[28px] border border-white/10 bg-[#0d0d0d] p-2 sm:p-2.5 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <div className="flex h-[460px] overflow-hidden rounded-[20px] bg-white sm:h-[560px]">
          {/* side rail */}
          <div className="hidden w-20 shrink-0 flex-col items-center gap-5 bg-[#0d0d0d] py-6 sm:flex">
            <Image src="/final_vergepay_logoc.svg" alt="" width={32} height={32} />
            <div className="mt-2 flex flex-col items-center gap-3">
              {rail.map((Icon, i) => (
                <span key={i} className={cn("flex size-11 items-center justify-center rounded-full", i === 0 ? "bg-(--vp-accent) text-[#050505]" : "text-white/40")}>
                  <Icon className="size-5" />
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 bg-gradient-to-b from-white to-zinc-100 p-4 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Good morning, Kemi</p>
                <p className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">Dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                  <Bell className="size-4" />
                  <span className="absolute top-2 right-2.5 size-2 rounded-full bg-red-500" />
                </span>
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white">KA</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr] lg:grid-cols-[1.25fr_1fr_1.1fr]">
              {/* balance card */}
              <div className="rounded-2xl bg-[#0d0d0d] p-5 text-white">
                <div className="flex items-center justify-between">
                  <Image src="/final_vergepay_logoc.svg" alt="" width={28} height={28} />
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80">All wallets</span>
                </div>
                <p className="mt-6 text-xs text-white/55">Total balance</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">₦4,820,500.00</p>
                <div className="mt-4 flex gap-5 text-[11px] text-white/55">
                  <span>
                    Personal <span className="block font-mono text-xs text-white">••983</span>
                  </span>
                  <span>
                    Business <span className="block font-mono text-xs text-white">••005</span>
                  </span>
                </div>
              </div>

              {/* quick actions */}
              <div className="hidden grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white sm:grid">
                {[
                  { icon: Plus, label: "Add money" },
                  { icon: Send, label: "Send" },
                  { icon: FileText, label: "Invoice" },
                  { icon: History, label: "History" },
                ].map(({ icon: Icon, label }, i) => (
                  <span key={label} className={cn("flex flex-col items-center justify-center gap-2 py-4 text-xs font-medium text-zinc-700", i % 2 === 0 && "border-r border-zinc-100", i < 2 && "border-b border-zinc-100")}>
                    <Icon className="size-5 text-zinc-900" />
                    {label}
                  </span>
                ))}
              </div>

              {/* collected this month */}
              <div className="hidden rounded-2xl border border-zinc-200/80 bg-white p-5 lg:block">
                <p className="text-sm font-semibold text-zinc-900">Invoices this month</p>
                <p className="mt-4 text-xl font-semibold tracking-tight text-zinc-950 tabular-nums">₦1,250,000.00</p>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>collected of ₦1,600,000.00</span>
                  <span className="font-semibold text-zinc-900">78%</span>
                </div>
                <div className="mt-4 h-8 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full w-[78%] rounded-full bg-(--vp-accent)" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr] lg:grid-cols-[1.25fr_1fr_1.1fr]">
              <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">Cash flow</p>
                  <span className="text-[11px] text-zinc-500">Last 6 months</span>
                </div>
                <MiniBars labels className="mt-4 h-40" />
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                <p className="text-sm font-semibold text-zinc-900">Wallets</p>
                {[
                  { name: "Personal", amount: "₦1,240,000.00", no: "1000 761 983" },
                  { name: "Business", amount: "₦3,580,500.00", no: "7692 554 005" },
                ].map((w) => (
                  <div key={w.name} className="mt-3 rounded-xl bg-zinc-50 p-3">
                    <p className="text-[11px] font-medium text-zinc-500">{w.name}</p>
                    <p className="text-sm font-semibold text-zinc-900 tabular-nums">{w.amount}</p>
                    <p className="font-mono text-[10px] text-zinc-400">{w.no}</p>
                  </div>
                ))}
              </div>
              <div className="hidden rounded-2xl border border-zinc-200/80 bg-white p-5 lg:block">
                <p className="text-sm font-semibold text-zinc-900">Recent activity</p>
                <p className="mt-3 text-xs text-zinc-500">Today</p>
                {[
                  { who: "Northwind Studio", what: "paid INV-0042", amt: "+₦350,000", inflow: true },
                  { who: "Ada Obi", what: "sent you money", amt: "+₦75,000", inflow: true },
                  { who: "Tunde Bakare", what: "you sent", amt: "−₦20,000", inflow: false },
                ].map((a) => (
                  <div key={a.who} className="mt-3 flex items-center gap-3">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", a.inflow ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600")}>
                      {a.inflow ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="block truncate font-semibold text-zinc-900">{a.who}</span>
                      <span className="text-zinc-500">{a.what}</span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 tabular-nums">{a.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- dark minis

/** A tile inside a dark card, for the small previews. */
function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-white/[0.07] bg-[#171717] p-3", className)}>{children}</div>;
}

/** Step 1: an email and a password. */
export function StepSignUpMock() {
  return (
    <div className="space-y-2" aria-hidden>
      <Tile>
        <p className="text-[11px] text-white/45">Email</p>
        <p className="text-sm text-white">kemi@studio.ng</p>
      </Tile>
      <Tile>
        <p className="text-[11px] text-white/45">Password</p>
        <p className="text-sm tracking-[0.3em] text-white">••••••••••</p>
      </Tile>
    </div>
  );
}

/** Step 2: verified by BVN, two wallets opened. */
export function StepVerifyMock() {
  return (
    <div className="space-y-2" aria-hidden>
      <Tile className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-(--vp-accent)/15 text-(--vp-accent)">
          <ShieldCheck className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-medium text-white">Identity verified</span>
          <span className="block text-[11px] text-white/45">BVN ••••4471</span>
        </span>
      </Tile>
      <div className="grid grid-cols-2 gap-2">
        <Tile>
          <p className="text-[11px] text-white/45">Personal</p>
          <p className="font-mono text-xs text-white">1000 761 983</p>
        </Tile>
        <Tile>
          <p className="text-[11px] text-white/45">Business</p>
          <p className="font-mono text-xs text-white">7692 554 005</p>
        </Tile>
      </div>
    </div>
  );
}

/** Step 3: the first payment lands. */
export function StepPaidMock() {
  return (
    <div className="space-y-2" aria-hidden>
      <Tile className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-(--vp-accent) text-[#050505]">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-white">Invoice paid: ₦350,000</span>
          <span className="block truncate text-[11px] text-white/45">INV-0042 · Northwind Studio · just now</span>
        </span>
      </Tile>
      <Tile className="flex items-center justify-between">
        <span className="text-[11px] text-white/45">Business wallet</span>
        <span className="text-sm font-semibold text-white tabular-nums">₦3,580,500.00</span>
      </Tile>
    </div>
  );
}

/** Two wallets, one view. */
export function WalletsMini() {
  return (
    <div className="space-y-2" aria-hidden>
      {[
        { name: "Personal wallet", no: "1000 761 983", amount: "₦1,240,000.00" },
        { name: "Business wallet", no: "7692 554 005", amount: "₦3,580,500.00" },
      ].map((w) => (
        <Tile key={w.name} className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-medium text-white">{w.name}</span>
            <span className="block font-mono text-[11px] text-white/45">{w.no}</span>
          </span>
          <span className="text-sm font-semibold text-white tabular-nums">{w.amount}</span>
        </Tile>
      ))}
      <p className="flex items-center justify-center gap-2 pt-1 text-xs text-white/50">
        <ArrowLeftRight className="size-3.5" /> Move money between them in a tap, free
      </p>
    </div>
  );
}

/** An invoice with its pay link. */
export function InvoiceMini() {
  return (
    <Tile className="p-4" >
      <div aria-hidden>
        <div className="flex items-start justify-between">
          <span>
            <span className="block text-[11px] text-white/45">Invoice INV-0042 · Northwind Studio</span>
            <span className="block text-xl font-semibold tracking-tight text-white tabular-nums">₦350,000.00</span>
          </span>
          <span className="rounded-full bg-(--vp-accent)/15 px-2 py-0.5 text-[11px] font-medium text-(--vp-accent)">Paid</span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/40 p-1.5 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/55">vergepay.com/pay/9zKwZpPyN_HE2G…</span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">Copy</span>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/45">Card · Bank transfer · USSD</p>
      </div>
    </Tile>
  );
}

/** The month at a glance. */
export function CashFlowMini() {
  return (
    <Tile className="p-4">
      <div aria-hidden>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Income", "₦1.8M"],
            ["Spent", "₦640K"],
            ["Net", "+₦1.16M"],
          ].map(([l, v]) => (
            <span key={l}>
              <span className="block text-[10px] tracking-wide text-white/45 uppercase">{l}</span>
              <span className="block text-base font-semibold text-white">{v}</span>
            </span>
          ))}
        </div>
        <MiniBars dark labels className="mt-4 h-24" />
      </div>
    </Tile>
  );
}

/** Alerts, the way a bank does them. */
export function AlertsMini() {
  return (
    <div className="space-y-2" aria-hidden>
      {[
        { icon: ArrowDownLeft, title: "Ada Obi sent you ₦75,000.00", body: "Into your Business wallet", inflow: true },
        { icon: Mail, title: "Receipt sent to Northwind Studio", body: "For INV-0042", inflow: true },
        { icon: ArrowUpRight, title: "You sent ₦20,000.00 to Tunde", body: "From your Personal wallet", inflow: false },
      ].map(({ icon: Icon, title, body, inflow }) => (
        <Tile key={title} className="flex items-center gap-3">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", inflow ? "bg-(--vp-accent)/15 text-(--vp-accent)" : "bg-white/10 text-white/60")}>
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">{title}</span>
            <span className="block text-[11px] text-white/45">{body}</span>
          </span>
        </Tile>
      ))}
    </div>
  );
}
