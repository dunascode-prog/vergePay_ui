"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, Clock, Landmark, Plus, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDay } from "@/lib/invoicing";
import { formatMinor, walletName } from "@/lib/ledger";
import { applicationToShow, dueIn, isOverdue, LOAN_TYPE_LABEL, nextPayment, owedByCurrency, rateLabel, termLabel } from "@/lib/loans";
import { cn } from "@/lib/utils";
import { devDecideApplication, listLoanApplications, listLoans } from "@/services/loans";
import { Loan, LoanApplication } from "@/types/loan";
import { RepayDialog } from "./RepayDialog";
import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";

const primary = "bg-emerald-700 text-white hover:bg-emerald-800";

/** /dashboard/loans: your loans, what's due next, and any application in review. */
export function LoansPage() {
  const { dataVersion } = useAppData();
  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [applications, setApplications] = useState<LoanApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    Promise.all([listLoans(), listLoanApplications()])
      .then(([l, a]) => {
        if (!live) return;
        setLoans(l);
        setApplications(a);
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your loans."));
    return () => {
      live = false;
    };
  }, [dataVersion, attempt]);

  const shown = useMemo(() => applicationToShow(applications ?? []), [applications]);
  const pending = shown?.status === "pending_review";
  const active = (loans ?? []).filter((l) => l.loan_status === "active");
  const approved = (loans ?? []).filter((l) => l.loan_status === "approved");
  const closed = (loans ?? []).filter((l) => l.loan_status === "repaid" || l.loan_status === "defaulted");

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
  if (loans === null || applications === null) return <LoansSkeleton />;

  const applyButton = !pending && (
    <Link href="/dashboard/loans/apply" className={cn(buttonVariants(), primary)}>
      <Plus className="size-4" /> Apply for a loan
    </Link>
  );

  if (!loans.length && !shown) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card px-4 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Landmark className="size-5" aria-hidden />
        </span>
        <p className="mt-3 font-medium">Borrow when you need to</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Apply in a minute. If it&apos;s approved, the money lands in your wallet and you repay in fixed monthly installments, with the full schedule up front.
        </p>
        <div className="mt-4">{applyButton}</div>
      </div>
    );
  }

  const next = nextPayment(loans);
  const owed = owedByCurrency(loans);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Fixed monthly installments, paid from your wallet.</p>
        {applyButton}
      </div>

      {shown && <ApplicationNotice application={shown} onDecided={reload} />}

      {loans.length > 0 && (
        <StatGrid columns={3}>
          <StatCard label="You owe" value={<CurrencyAmounts totals={owed} empty="Nothing" />} hint={active.length ? "Interest included" : null} />
          <StatCard
            label="Next payment"
            value={next?.next_installment ? formatMinor(next.next_installment.installment_amount_minor, next.currency_code) : "—"}
            hint={next?.next_installment ? `${dueIn(next.next_installment.due_date)} · ${formatDay(next.next_installment.due_date)}` : null}
            tone={!!next && isOverdue(next) ? "bad" : undefined}
          />
          <StatCard className="col-span-2 lg:col-span-1" label="Paid off" value={String(closed.filter((l) => l.loan_status === "repaid").length)} />
        </StatGrid>
      )}

      {(active.length > 0 || approved.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Active</h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {approved.map((l) => (
              <ApprovedCard key={l.loan_id} loan={l} />
            ))}
            {active.map((l) => (
              <LoanCard key={l.loan_id} loan={l} onPaid={reload} />
            ))}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Paid off</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {closed.map((l) => (
              <li key={l.loan_id}>
                <Link href={`/dashboard/loans/${l.loan_id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50">
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {LOAN_TYPE_LABEL[l.loan_type]} · {formatMinor(l.principal_minor, l.currency_code)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {termLabel(l.term_months)} at {rateLabel(l.interest_rate_bps)}
                    </span>
                  </span>
                  <span className={cn("text-xs font-medium", l.loan_status === "repaid" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {l.loan_status === "repaid" ? "Paid off" : "Defaulted"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}


/** One active loan: how far along it is, and paying the next installment. */
function LoanCard({ loan, onPaid }: { loan: Loan; onPaid: () => void }) {
  const money = (minor: number) => formatMinor(minor, loan.currency_code);
  const next = loan.next_installment;
  const overdue = isOverdue(loan);
  const progress = Math.round((loan.installments_paid / loan.term_months) * 100);

  return (
    <article className={cn("rounded-xl border bg-card p-4 sm:p-5", overdue && "border-red-300 dark:border-red-900")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{LOAN_TYPE_LABEL[loan.loan_type]}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{money(loan.balance_remaining_minor)}</p>
          <p className="text-xs text-muted-foreground">
            still owed of {money(loan.principal_minor)} borrowed · {rateLabel(loan.interest_rate_bps)}
          </p>
        </div>
        {next && (
          <div className="sm:text-right">
            <p className={cn("text-xs font-medium", overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>{dueIn(next.due_date)}</p>
            <p className="text-sm font-medium tabular-nums">{money(next.installment_amount_minor)}</p>
            <p className="text-xs text-muted-foreground">{formatDay(next.due_date)}</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Installments paid" aria-valuemin={0} aria-valuemax={loan.term_months} aria-valuenow={loan.installments_paid}>
          <div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {loan.installments_paid} of {loan.term_months} installments paid
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {next && (
          <RepayDialog
            loan={loan}
            onPaid={onPaid}
            trigger={<Button className={primary}>Pay {money(next.installment_amount_minor)}</Button>}
          />
        )}
        <Link href={`/dashboard/loans/${loan.loan_id}`} className={buttonVariants({ variant: "outline" })}>
          Schedule and details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function ApprovedCard({ loan }: { loan: Loan }) {
  return (
    <article className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <div className="text-sm">
        <p className="font-medium">
          {LOAN_TYPE_LABEL[loan.loan_type]} of {formatMinor(loan.principal_minor, loan.currency_code)} approved
        </p>
        <p className="text-muted-foreground">
          {termLabel(loan.term_months)} at {rateLabel(loan.interest_rate_bps)}. It&apos;s being paid into your wallet, and the repayment schedule starts once it arrives.
        </p>
      </div>
    </article>
  );
}

/** An application in review, or the latest one if it was turned down. */
function ApplicationNotice({ application: a, onDecided }: { application: LoanApplication; onDecided: () => void }) {
  const { accounts } = useAppData();
  const wallet = accounts.find((acc) => acc.account_id === a.account_id);
  const amount = formatMinor(a.requested_amount_minor, a.currency_code);

  if (a.status === "rejected") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
        <XCircle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <div>
          <p className="font-medium">Your application for {amount} wasn&apos;t approved</p>
          <p className="text-muted-foreground">
            {a.decision_reason ? `Reason: ${a.decision_reason}. ` : ""}You can apply again, for example for a smaller amount or a longer term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium">Application under review</p>
          <p className="text-muted-foreground">
            {LOAN_TYPE_LABEL[a.loan_type]} of {amount} over {termLabel(a.term_months)}
            {a.purpose ? `, for ${a.purpose}` : ""}. Sent {formatDay(a.submitted_at)}
            {wallet ? `, to be paid into your ${walletName(wallet.purpose).toLowerCase()}` : ""}. You&apos;ll see the rate and monthly payment here once it&apos;s decided.
          </p>
        </div>
      </div>
      {process.env.NODE_ENV === "development" && <DevDecision applicationId={a.application_id} onDecided={onDecided} />}
    </div>
  );
}

/**
 * Development builds only: stands in for the underwriter through the API's
 * /v1/dev routes, so the rest of the flow can be tried locally.
 */
function DevDecision({ applicationId, onDecided }: { applicationId: string; onDecided: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const decide = async (decision: Parameters<typeof devDecideApplication>[1]) => {
    setBusy(true);
    setError(null);
    try {
      await devDecideApplication(applicationId, decision);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work.");
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-emerald-300 pt-3 dark:border-emerald-800">
      <span className="text-xs text-muted-foreground">Development only:</span>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => decide({ decision: "approve", interest_rate_bps: 2400 })}>
        Approve at 24% and pay out
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => decide({ decision: "reject", reason: "Declined in development" })}>
        Reject
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function LoansSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-64" />
      <StatGrid columns={3}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </StatGrid>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
