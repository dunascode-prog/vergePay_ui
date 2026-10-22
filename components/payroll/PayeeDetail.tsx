"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatDay } from "@/lib/invoicing";
import { formatMinor, walletName } from "@/lib/ledger";
import { FREQUENCY_LABEL, nextPayLabel, PAY_TYPE_LABEL, RATE_LABEL } from "@/lib/payroll";
import { cn } from "@/lib/utils";
import { getPayee, listPayees, updatePayee } from "@/services/payroll";
import { Payee, PayeeDetail as PayeeDetailData } from "@/types/payroll";
import { PayeeAvatar } from "./PayeeAvatar";
import { PayeeFormDialog } from "./PayeeFormDialog";
import { RunPayrollDialog } from "./RunPayrollDialog";
import { pageClass } from "@/lib/layout";

const primary = "bg-emerald-700 text-white hover:bg-emerald-800";

/** /dashboard/payroll/[id]: one payee, everything you've paid them, and editing. */
export function PayeeDetail({ payeeId }: { payeeId: string }) {
  const { dataVersion } = useAppData();
  const [payee, setPayee] = useState<PayeeDetailData | null>(null);
  // the run dialog shows the other payees too, so one run can pay several
  const [payees, setPayees] = useState<Payee[]>([]);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    Promise.all([getPayee(payeeId), listPayees("active")])
      .then(([p, all]) => {
        if (!live) return;
        setPayee(p);
        setPayees(all);
        setError(null);
      })
      .catch(
        (err) =>
          live &&
          setError({
            message: err instanceof ApiError ? err.message : "We couldn't load this payee.",
            notFound: err instanceof ApiError && err.status === 404,
          }),
      );
    return () => {
      live = false;
    };
  }, [payeeId, dataVersion, attempt]);

  const back = (
    <Link href="/dashboard/payroll" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Payroll
    </Link>
  );

  if (error) {
    return (
      <div className={pageClass("narrow")}>
        {back}
        <ErrorNote>{error.notFound ? "This payee doesn't exist, or isn't yours." : error.message}</ErrorNote>
        {!error.notFound && (
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  if (!payee) {
    return (
      <div className={pageClass("narrow")}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const money = (minor: number) => formatMinor(minor, payee.currency_code);
  const inactive = payee.payee_status === "inactive";

  const setStatus = async () => {
    setStatusBusy(true);
    setStatusError(null);
    try {
      await updatePayee(payee.payee_id, { payee_status: inactive ? "active" : "inactive" });
      reload();
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Couldn't change that. Please try again.");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className={pageClass("narrow", { stack: false })}>
      {back}

      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PayeeAvatar name={payee.name} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">{payee.name}</h1>
              <p className="text-sm text-muted-foreground">{payee.role ?? `${PAY_TYPE_LABEL[payee.pay_type]} payee`}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {payee.account_name} · {payee.account_number} · {payee.currency_code} wallet
                {payee.wallet_status === "closed" && <span className="text-red-600 dark:text-red-400"> (closed)</span>}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
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

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Fact label={RATE_LABEL[payee.pay_type]} value={money(payee.rate_minor)} sub={FREQUENCY_LABEL[payee.frequency]} />
          <Fact label="Paid in total" value={money(payee.total_paid_minor)} sub={`${payee.payment_count} payment${payee.payment_count === 1 ? "" : "s"}`} />
          <Fact
            label="Last paid"
            value={payee.last_paid_minor !== null ? money(payee.last_paid_minor) : "—"}
            sub={payee.last_paid_at ? formatDay(payee.last_paid_at) : "Not paid yet"}
          />
          <Fact label="Next" value={payee.next_pay_date ? formatDay(payee.next_pay_date) : "—"} sub={nextPayLabel(payee)} warn={payee.is_due} />
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
          {!inactive && (
            <RunPayrollDialog
              payees={payees}
              preselect={[payee.payee_id]}
              onPaid={reload}
              trigger={
                <Button className={primary} disabled={payee.wallet_status === "closed"}>
                  Pay {money(payee.rate_minor)}
                </Button>
              }
            />
          )}
          <PayeeFormDialog payee={payee} onSaved={reload} trigger={<Button variant="outline"><Pencil className="size-4" /> Edit</Button>} />
          <Button variant="ghost" onClick={setStatus} disabled={statusBusy} className={cn("sm:ml-auto", !inactive && "text-muted-foreground")}>
            {inactive ? "Make active again" : "Make inactive"}
          </Button>
        </div>
        {statusError && <div className="mt-3"><ErrorNote>{statusError}</ErrorNote></div>}
      </section>

      <section className="mt-5 space-y-2 sm:mt-6">
        <h2 className="text-sm font-semibold">Payments</h2>
        {payee.payments.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">You haven&apos;t paid {payee.name} yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {payee.payments.map((p) => (
              <li key={p.payment_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.note ?? "Payroll"}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDateTime(p.created_at)} · from your {walletName(p.source_purpose).toLowerCase()}
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{formatMinor(p.amount_minor, p.currency_code)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value, sub, warn = false }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
      {sub && <dd className={cn("text-xs", warn ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>{sub}</dd>}
    </div>
  );
}
