"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDay } from "@/lib/invoicing";
import { formatMinor, walletName } from "@/lib/ledger";
import { dueIn, installmentState, InstallmentState, isOverdue, LOAN_TYPE_LABEL, rateLabel, scheduleTotals, termLabel } from "@/lib/loans";
import { cn } from "@/lib/utils";
import { getLoan, getLoanSchedule } from "@/services/loans";
import { Installment, Loan } from "@/types/loan";
import { RepayDialog } from "./RepayDialog";

const STATE_LABEL: Record<InstallmentState, string> = { paid: "Paid", overdue: "Overdue", due_soon: "Due soon", upcoming: "Upcoming" };
const STATE_TONE: Record<InstallmentState, string> = {
  paid: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  overdue: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
  due_soon: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  upcoming: "bg-muted text-muted-foreground",
};

/** /dashboard/loans/[id]: one loan, its full schedule, and paying the next installment. */
export function LoanDetail({ loanId }: { loanId: string }) {
  const { accounts, dataVersion } = useAppData();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<Installment[] | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    Promise.all([getLoan(loanId), getLoanSchedule(loanId)])
      .then(([l, s]) => {
        if (!live) return;
        setLoan(l);
        setSchedule(s);
        setError(null);
      })
      .catch((err) => live && setError({ message: err instanceof ApiError ? err.message : "We couldn't load this loan.", notFound: err instanceof ApiError && err.status === 404 }));
    return () => {
      live = false;
    };
  }, [loanId, dataVersion, attempt]);

  const back = (
    <Link href="/dashboard/loans" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Loans
    </Link>
  );

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        {back}
        <ErrorNote>{error.notFound ? "This loan doesn't exist, or isn't yours." : error.message}</ErrorNote>
        {!error.notFound && (
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  if (!loan || !schedule) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const money = (minor: number) => formatMinor(minor, loan.currency_code);
  const totals = scheduleTotals(schedule);
  const wallet = accounts.find((a) => a.account_id === loan.account_id);
  const next = loan.next_installment;
  const overdue = isOverdue(loan);
  const status =
    loan.loan_status === "repaid" ? "Paid off" : loan.loan_status === "approved" ? "Being paid out" : loan.loan_status === "defaulted" ? "Defaulted" : overdue ? "Payment overdue" : "Active";

  const facts = [
    { label: "Borrowed", value: money(loan.principal_minor) },
    { label: "Rate", value: rateLabel(loan.interest_rate_bps) },
    { label: "Term", value: termLabel(loan.term_months) },
    { label: "Total interest", value: schedule.length ? money(totals.interest) : "—" },
    { label: "Total to repay", value: schedule.length ? money(totals.total) : "—" },
    { label: "Paid so far", value: schedule.length ? `${money(totals.paid)} · ${loan.installments_paid} of ${loan.term_months}` : "—" },
    { label: "Paid into", value: wallet ? `${walletName(wallet.purpose)} · ${wallet.account_number}` : "—" },
    { label: "Paid out", value: loan.disbursed_at ? formatDay(loan.disbursed_at) : "Not yet" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {back}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{LOAN_TYPE_LABEL[loan.loan_type]}</h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  overdue || loan.loan_status === "defaulted" ? STATE_TONE.overdue : loan.loan_status === "repaid" ? STATE_TONE.paid : STATE_TONE.upcoming,
                )}
              >
                {status}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="truncate font-medium tabular-nums" title={f.value}>
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border bg-card">
            <div className="flex items-baseline justify-between gap-3 p-4 sm:px-5">
              <h2 className="text-base font-medium">Repayment schedule</h2>
              {schedule.length > 0 && <p className="text-xs text-muted-foreground">Each payment covers that month&apos;s interest, then pays down the loan</p>}
            </div>
            {schedule.length === 0 ? (
              <p className="px-4 pb-5 text-sm text-muted-foreground sm:px-5">The schedule appears once the loan is paid into your wallet.</p>
            ) : (
              <>
                {/* desktop: a table */}
                <table className="hidden w-full text-sm sm:table">
                  <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-2 text-left font-medium">#</th>
                      <th scope="col" className="px-3 py-2 text-left font-medium">Due</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Principal</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Interest</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Payment</th>
                      <th scope="col" className="px-5 py-2 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {schedule.map((i) => {
                      const state = installmentState(i);
                      return (
                        <tr key={i.installment_number} className={cn(next?.installment_number === i.installment_number && "bg-emerald-50/40 dark:bg-emerald-950/20")}>
                          <td className="px-5 py-2.5 text-muted-foreground tabular-nums">{i.installment_number}</td>
                          <td className="px-3 py-2.5 tabular-nums">{formatDay(i.due_date)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{money(i.principal_minor)}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">{money(i.interest_minor)}</td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums">{money(i.installment_amount_minor)}</td>
                          <td className="px-5 py-2.5 text-right">
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATE_TONE[state])}>{STATE_LABEL[state]}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* phone: a list */}
                <ul className="divide-y border-t sm:hidden">
                  {schedule.map((i) => {
                    const state = installmentState(i);
                    return (
                      <li key={i.installment_number} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium tabular-nums">
                            {i.installment_number}. {formatDay(i.due_date)}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {money(i.principal_minor)} + {money(i.interest_minor)} interest
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium tabular-nums">{money(i.installment_amount_minor)}</p>
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATE_TONE[state])}>{STATE_LABEL[state]}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
          <div>
            <p className="text-xs text-muted-foreground">{loan.loan_status === "repaid" ? "All paid" : "Still owed"}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{money(loan.balance_remaining_minor)}</p>
            {loan.loan_status === "active" && <p className="text-sm text-muted-foreground">interest included</p>}
          </div>
          {next && loan.loan_status === "active" ? (
            <>
              <div className={cn("rounded-lg p-3 text-sm", overdue ? "bg-red-50 dark:bg-red-950/40" : "bg-muted/50")}>
                <p className={cn("text-xs", overdue ? "text-red-700 dark:text-red-300" : "text-muted-foreground")}>
                  Installment {next.installment_number} · {dueIn(next.due_date)}
                </p>
                <p className="font-medium tabular-nums">
                  {money(next.installment_amount_minor)} by {formatDay(next.due_date)}
                </p>
              </div>
              <RepayDialog
                loan={loan}
                onPaid={reload}
                trigger={<Button className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">Pay {money(next.installment_amount_minor)}</Button>}
              />
              <p className="text-xs text-muted-foreground">Installments are paid in order, one at a time, for the exact amount due.</p>
            </>
          ) : loan.loan_status === "repaid" ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">You&apos;ve repaid this loan in full.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Approved. It&apos;s being paid into your wallet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
