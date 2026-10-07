"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CalendarClock, Search, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDateTime, moneyByCurrency } from "@/lib/invoicing";
import { formatMinor, walletName } from "@/lib/ledger";
import { dueTotals, FREQUENCY_LABEL, nextPayLabel, paidSince, PAY_TYPE_LABEL, RATE_LABEL } from "@/lib/payroll";
import { cn } from "@/lib/utils";
import { listPayees, listRuns } from "@/services/payroll";
import { Payee, PayrollRun } from "@/types/payroll";
import { PayeeAvatar } from "./PayeeAvatar";
import { PayeeFormDialog } from "./PayeeFormDialog";
import { RunPayrollDialog } from "./RunPayrollDialog";

const primary = "bg-emerald-700 text-white hover:bg-emerald-800";

type Filter = "all" | "due" | "retainer" | "per_project" | "inactive";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "due", label: "Due" },
  { value: "retainer", label: "Retainers" },
  { value: "per_project", label: "Per project" },
  { value: "inactive", label: "Inactive" },
];

/** /dashboard/payroll: the people you pay, who's due, and paying them in one run. */
export function PayrollPage() {
  const { dataVersion } = useAppData();
  const [payees, setPayees] = useState<Payee[] | null>(null);
  const [runs, setRuns] = useState<PayrollRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    Promise.all([listPayees("all"), listRuns()])
      .then(([p, r]) => {
        if (!live) return;
        setPayees(p);
        setRuns(r);
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your payroll."));
    return () => {
      live = false;
    };
  }, [dataVersion, attempt]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (payees ?? []).filter((p) => {
      const matches = !q || p.name.toLowerCase().includes(q) || (p.role ?? "").toLowerCase().includes(q) || p.account_name.toLowerCase().includes(q);
      const inFilter =
        filter === "all"
          ? p.payee_status === "active"
          : filter === "inactive"
            ? p.payee_status === "inactive"
            : filter === "due"
              ? p.is_due
              : p.payee_status === "active" && p.pay_type === filter;
      return matches && inFilter;
    });
  }, [payees, filter, query]);

  if (error) {
    return (
      <div className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
        <Button variant="outline" size="sm" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }
  if (payees === null || runs === null) return <PayrollSkeleton />;

  const active = payees.filter((p) => p.payee_status === "active");
  const due = active.filter((p) => p.is_due);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const paidThisMonth = paidSince(runs, monthStart);
  const runsThisMonth = runs.filter((r) => new Date(r.created_at) >= monthStart).length;

  const addButton = (
    <PayeeFormDialog
      onSaved={reload}
      trigger={
        <Button variant={payees.length ? "outline" : "default"} className={payees.length ? undefined : primary}>
          <UserPlus className="size-4" /> Add payee
        </Button>
      }
    />
  );

  if (!payees.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card px-4 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Users className="size-5" aria-hidden />
        </span>
        <p className="mt-3 font-medium">Pay your team in one go</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Add the people you pay by their VergePay account number. When payday comes, pay everyone due at once, straight into their wallets.
        </p>
        <div className="mt-4">{addButton}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Paid instantly into each payee&apos;s VergePay wallet.</p>
        <div className="flex flex-wrap gap-2">
          {addButton}
          <RunPayrollDialog
            payees={payees}
            onPaid={reload}
            trigger={
              <Button className={primary} disabled={!active.length}>
                <Banknote className="size-4" /> Run payroll
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile icon={CalendarClock} label="Due now" value={due.length ? moneyByCurrency(dueTotals(due)) : "Nobody"} sub={due.length ? `${due.length} payee${due.length === 1 ? "" : "s"} at their usual amount` : "Everyone's paid up"} warn={due.length > 0} />
        <Tile icon={Banknote} label="Paid this month" value={paidThisMonth.size ? moneyByCurrency(paidThisMonth) : "Nothing yet"} sub={`${runsThisMonth} run${runsThisMonth === 1 ? "" : "s"} this month`} />
        <Tile className="col-span-2 lg:col-span-1" icon={Users} label="Payees" value={String(active.length)} sub={payees.length > active.length ? `${payees.length - active.length} inactive` : "All active"} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter payees">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "h-8 rounded-full border px-3 text-sm text-muted-foreground hover:text-foreground",
                  filter === f.value && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                )}
              >
                {f.label}
                {f.value === "due" && due.length > 0 && <span className="ml-1 tabular-nums">({due.length})</span>}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input aria-label="Search payees" placeholder="Search by name or role" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {query ? "No payees match your search." : filter === "due" ? "Nobody is due right now." : "No payees here."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <PayeeCard key={p.payee_id} payee={p} payees={payees} onChanged={reload} />
            ))}
          </div>
        )}
      </section>

      {runs.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Recent runs</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {runs.slice(0, 10).map((r) => (
              <li key={r.run_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {r.note ?? "Payroll"} · {r.payment_count} {r.payment_count === 1 ? "person" : "people"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {formatDateTime(r.created_at)} · from your {walletName(r.source_purpose).toLowerCase()} · {r.payments.map((p) => p.payee_name).join(", ")}
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{formatMinor(r.total_minor, r.currency_code)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub, warn = false, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; warn?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-1.5 truncate text-xl font-semibold tracking-tight tabular-nums" title={value}>
        {value}
      </p>
      <p className={cn("mt-0.5 truncate text-xs", warn ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")} title={sub}>
        {sub}
      </p>
    </div>
  );
}

function PayeeCard({ payee, payees, onChanged }: { payee: Payee; payees: Payee[]; onChanged: () => void }) {
  const money = (minor: number) => formatMinor(minor, payee.currency_code);
  const inactive = payee.payee_status === "inactive";

  return (
    <article className={cn("flex flex-col rounded-xl border bg-card p-4 sm:p-5", inactive && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <Link href={`/dashboard/payroll/${payee.payee_id}`} className="flex min-w-0 items-center gap-3 hover:underline">
          <PayeeAvatar name={payee.name} />
          <span className="min-w-0">
            <span className="block truncate font-medium">{payee.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{payee.role ?? payee.account_number}</span>
          </span>
        </Link>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            inactive
              ? "bg-muted text-muted-foreground"
              : payee.is_due
                ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
          )}
        >
          {inactive ? "Inactive" : payee.is_due ? "Due" : "Paid up"}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {PAY_TYPE_LABEL[payee.pay_type]} · {FREQUENCY_LABEL[payee.frequency]}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{RATE_LABEL[payee.pay_type]}</dt>
          <dd className="font-medium tabular-nums">{money(payee.rate_minor)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-muted-foreground">Last paid</dt>
          <dd className="font-medium tabular-nums">{payee.last_paid_minor !== null ? money(payee.last_paid_minor) : "—"}</dd>
          <dd className={cn("text-xs", payee.is_due ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>{nextPayLabel(payee)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        {!inactive && (
          <RunPayrollDialog
            payees={payees}
            preselect={[payee.payee_id]}
            onPaid={onChanged}
            trigger={
              <Button className={cn(primary, "flex-1")} disabled={payee.wallet_status === "closed"}>
                Pay {payee.name.split(" ")[0]}
              </Button>
            }
          />
        )}
        <Link href={`/dashboard/payroll/${payee.payee_id}`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
          Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function PayrollSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-64" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
