import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Bell, Check, CreditCard, Landmark, Lock, Smartphone, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Product previews for the landing page, drawn in code so they stay crisp at
// any size and match the real app. The figures are illustrative.

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_60px_-20px_rgba(6,40,31,0.25)]", className)}>{children}</div>;
}

const BARS = [
  { m: "May", in: 52, out: 30 },
  { m: "Jun", in: 61, out: 38 },
  { m: "Jul", in: 48, out: 35 },
  { m: "Aug", in: 74, out: 41 },
  { m: "Sep", in: 69, out: 37 },
  { m: "Oct", in: 88, out: 44 },
];

function MiniBars({ tall = false }: { tall?: boolean }) {
  return (
    <div className={cn("flex gap-2.5", tall ? "h-36" : "h-20")}>
      {BARS.map((b) => (
        <div key={b.m} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-[3px]">
            <span className="w-full max-w-3 rounded-t-[4px] bg-emerald-600" style={{ height: `${b.in}%` }} />
            <span className="w-full max-w-3 rounded-t-[4px] bg-orange-400" style={{ height: `${b.out}%` }} />
          </div>
          {tall && <span className="text-[10px] text-zinc-500">{b.m}</span>}
        </div>
      ))}
    </div>
  );
}

/** Hero: the dashboard, with a payment arriving and a pay link. */
export function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem]" role="img" aria-label="The VergePay dashboard: total balance, personal and business wallets, a cash-flow chart, and an invoice paid alert">
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-zinc-500">Total balance</p>
            <p className="mt-1 text-[1.75rem] font-bold tracking-tight text-zinc-950 tabular-nums sm:text-3xl">₦4,820,500.00</p>
          </div>
          <div className="flex rounded-full bg-zinc-100 p-1 text-[11px] font-medium text-zinc-500">
            <span className="rounded-full px-2.5 py-1">Personal</span>
            <span className="rounded-full px-2.5 py-1">Business</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-zinc-900 shadow-sm">All</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { name: "Personal wallet", amount: "₦1,240,000.00", tone: "bg-emerald-50 text-emerald-800" },
            { name: "Business wallet", amount: "₦3,580,500.00", tone: "bg-sky-50 text-sky-800" },
          ].map((w) => (
            <div key={w.name} className="rounded-xl border border-black/[0.06] p-3">
              <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", w.tone)}>{w.name}</span>
              <p className="mt-2 text-sm font-semibold text-zinc-900 tabular-nums">{w.amount}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700">Cash flow</span>
            <span className="flex items-center gap-3 text-zinc-500">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-600" />In</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-orange-400" />Out</span>
            </span>
          </div>
          <MiniBars />
        </div>
      </Panel>

      {/* a payment lands */}
      <Panel className="absolute -top-14 right-0 w-64 max-w-[85%] p-3 sm:-right-8 motion-safe:animate-[vp-float_6s_ease-in-out_infinite]">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ArrowDownLeft className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">Invoice paid: ₦350,000.00</p>
            <p className="truncate text-xs text-zinc-500">INV-0042 · Northwind Studio · just now</p>
          </div>
        </div>
      </Panel>

      {/* the pay link the client used */}
      <Panel className="absolute -bottom-16 -left-2 hidden w-56 p-4 sm:-bottom-32 sm:-left-16 sm:block motion-safe:animate-[vp-float_7s_ease-in-out_1s_infinite]">
        <p className="text-[11px] text-zinc-500">Invoice INV-0042 · Kemi Studio</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight text-zinc-950">₦350,000.00</p>
        <div className="mt-3 rounded-lg bg-emerald-800 py-2 text-center text-xs font-semibold text-white">Pay ₦350,000.00</div>
        <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
          <Lock className="size-2.5" /> Card · Bank transfer · USSD
        </p>
      </Panel>
    </div>
  );
}

/** Get paid: an invoice, the email/link, and the money landing. */
export function InvoiceFlowMock() {
  return (
    <div className="relative mx-auto w-full max-w-md" role="img" aria-label="An invoice with line items and a pay link, and the alert when it's paid">
      <Panel className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500">Invoice INV-0042</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">₦350,000.00</p>
            <p className="text-xs text-zinc-500">Due in 14 days · Northwind Studio</p>
          </div>
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">Unpaid</span>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 border-y border-zinc-100 text-sm">
          {[
            ["Brand identity", "1 × ₦250,000", "₦250,000"],
            ["Social media kit", "2 × ₦50,000", "₦100,000"],
          ].map(([d, q, a]) => (
            <div key={d} className="flex justify-between py-2.5">
              <span>
                <span className="block text-zinc-900">{d}</span>
                <span className="text-xs text-zinc-500">{q}</span>
              </span>
              <span className="font-medium text-zinc-900 tabular-nums">{a}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 p-1.5 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-600">vergepay.com/pay/9zKwZpPyN_HE2G…</span>
          <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm">Copy</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold text-zinc-700">
          <span className="rounded-lg border border-zinc-200 py-1.5 text-center">WhatsApp</span>
          <span className="rounded-lg border border-zinc-200 py-1.5 text-center">Email reminder</span>
        </div>
      </Panel>
      <Panel className="absolute -right-3 -bottom-8 w-60 p-3 sm:-right-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Paid by card</p>
            <p className="text-xs text-zinc-500">Into your Business wallet</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/** Two wallets, one view. */
export function WalletsMock() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-3" role="img" aria-label="A personal wallet and a business wallet, each with its own account number, and a transfer between them">
      {[
        { name: "Personal wallet", no: "1000 761 983", amount: "₦1,240,000.00", chip: "bg-emerald-50 text-emerald-800" },
        { name: "Business wallet", no: "7692 554 005", amount: "₦3,580,500.00", chip: "bg-sky-50 text-sky-800" },
      ].map((w, i) => (
        <Panel key={w.name} className={cn("p-5", i === 1 && "sm:ml-10")}>
          <div className="flex items-center justify-between">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", w.chip)}>{w.name}</span>
            <span className="text-xs text-zinc-500">NGN</span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 tabular-nums">{w.amount}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{w.no}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-emerald-800 py-2 text-center text-white">Add</span>
            <span className="rounded-lg border border-zinc-200 py-2 text-center text-zinc-800">Send</span>
            <span className="rounded-lg border border-zinc-200 py-2 text-center text-zinc-800">Transfer</span>
          </div>
        </Panel>
      ))}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
        <ArrowLeftRight className="size-3.5" /> Move money between them in a tap, free
      </div>
    </div>
  );
}

/** Insights: the month at a glance. */
export function InsightsMock() {
  return (
    <Panel className="mx-auto w-full max-w-md p-5" >
      <div role="img" aria-label="Income, spending and net for the month, and a six-month cash-flow chart">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Income", "₦1.8M", "+12%", "text-emerald-700"],
            ["Spent", "₦640K", "−4%", "text-emerald-700"],
            ["Net", "+₦1.16M", "More in", "text-emerald-700"],
          ].map(([l, v, d, c]) => (
            <div key={l}>
              <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{l}</p>
              <p className="mt-1 text-lg font-bold tracking-tight text-zinc-950">{v}</p>
              <p className={cn("flex items-center gap-1 text-[11px]", c)}>
                <TrendingUp className="size-3" /> {d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <MiniBars tall />
        </div>
      </div>
    </Panel>
  );
}

/** Add money: three ways in. */
export function AddMoneyMock() {
  return (
    <div className="grid gap-2" aria-hidden>
      {[
        { icon: Landmark, title: "Bank transfer", body: "Your own account number" },
        { icon: CreditCard, title: "Debit card", body: "Link once, top up in a tap" },
        { icon: Smartphone, title: "Get paid", body: "Clients pay your invoice link" },
      ].map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white p-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Icon className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-900">{title}</span>
            <span className="block text-xs text-zinc-500">{body}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Small previews for the feature grid. */
export function InvoiceChipMock() {
  return (
    <div className="space-y-2" aria-hidden>
      {[
        { no: "INV-0042", who: "Northwind Studio", amount: "₦350,000", status: "Paid", tone: "bg-emerald-50 text-emerald-800" },
        { no: "INV-0041", who: "Bloom Bakery", amount: "₦85,000", status: "Unpaid", tone: "bg-sky-50 text-sky-800" },
      ].map((i) => (
        <div key={i.no} className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white p-3 text-sm">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-zinc-900">{i.who}</span>
            <span className="block text-xs text-zinc-500">{i.no}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 tabular-nums">{i.amount}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", i.tone)}>{i.status}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function NameCheckMock() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="rounded-xl border border-black/[0.06] bg-white p-3">
        <p className="text-[11px] text-zinc-500">Account number</p>
        <p className="font-mono text-sm text-zinc-900">0123 456 789</p>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">AO</span>
        <span>
          <span className="block text-sm font-semibold text-zinc-900">Ada Obi</span>
          <span className="flex items-center gap-1 text-xs text-emerald-700">
            <Check className="size-3" /> Name confirmed
          </span>
        </span>
      </div>
    </div>
  );
}

export function SparkMock() {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-3" aria-hidden>
      <MiniBars />
    </div>
  );
}

export function HoldingsMock() {
  return (
    <div className="space-y-2" aria-hidden>
      {[
        ["AAPL", "Apple", "$1,842.10", "+2.4%"],
        ["VOO", "S&P 500 ETF", "$3,120.55", "+0.9%"],
      ].map(([t, n, v, d]) => (
        <div key={t} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white p-3 text-sm">
          <span className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-bold text-white">{t}</span>
            <span className="text-zinc-700">{n}</span>
          </span>
          <span className="text-right">
            <span className="block font-semibold text-zinc-900 tabular-nums">{v}</span>
            <span className="block text-xs text-emerald-700">{d}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Alerts, the way a bank does them. */
export function AlertsMock() {
  return (
    <div className="space-y-2" aria-hidden>
      {[
        { icon: ArrowDownLeft, title: "Ada Obi sent you ₦75,000.00", body: "Into your Business wallet", tone: "bg-emerald-50 text-emerald-700" },
        { icon: ArrowUpRight, title: "You sent ₦20,000.00 to Tunde", body: "From your Personal wallet", tone: "bg-zinc-100 text-zinc-600" },
      ].map(({ icon: Icon, title, body, tone }) => (
        <div key={title} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white p-3">
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-900">{title}</span>
            <span className="block text-xs text-zinc-500">{body}</span>
          </span>
          <Bell className="ml-auto size-3.5 shrink-0 text-zinc-400" />
        </div>
      ))}
    </div>
  );
}
