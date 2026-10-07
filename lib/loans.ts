// Loan helpers: wording, dates and totals over what the API returns. The API
// owns the maths (the schedule is fixed when the loan is paid out); this only
// reads it.

import { daysUntil } from "@/lib/invoicing";
import { Installment, Loan, LoanApplication, LoanType } from "@/types/loan";

export const LOAN_TYPE_LABEL: Record<LoanType, string> = {
  personal: "Personal loan",
  cash_advance: "Cash advance",
  asset_finance: "Asset finance",
  mortgage: "Mortgage",
};

export const LOAN_TYPE_HINT: Record<LoanType, string> = {
  personal: "For anything: equipment, a move, an emergency",
  cash_advance: "Bridge a gap while clients pay",
  asset_finance: "Buy a laptop, camera or vehicle",
  mortgage: "A home, over years",
};

/** The order the apply form offers them in. */
export const LOAN_TYPES: LoanType[] = ["personal", "cash_advance", "asset_finance", "mortgage"];

/** The API's bounds: ₦1,000 to ₦100,000,000 (the same in minor units of other currencies). */
/** The downloadable terms for each version (legal/README.md says how to add one). */
export const LOAN_TERMS_PDF: Record<string, string> = {
  "loan-terms-v1": "/legal/vergepay-loan-terms-v1.pdf",
};

export const MIN_LOAN_MINOR = 100_000;
export const MAX_LOAN_MINOR = 10_000_000_000;

/** 2400 → "24% a year"; 1850 → "18.5% a year" */
export const rateLabel = (bps: number) => `${(bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}% a year`;

/** 6 → "6 months"; 24 → "2 years"; 18 → "18 months" */
export function termLabel(months: number): string {
  if (months % 12 === 0 && months >= 12) return months === 12 ? "1 year" : `${months / 12} years`;
  return months === 1 ? "1 month" : `${months} months`;
}

export type InstallmentState = "paid" | "overdue" | "due_soon" | "upcoming";

/** Due within the next 7 days counts as due soon. */
export function installmentState(i: Pick<Installment, "paid_flag" | "due_date">): InstallmentState {
  if (i.paid_flag) return "paid";
  const days = daysUntil(i.due_date);
  return days < 0 ? "overdue" : days <= 7 ? "due_soon" : "upcoming";
}

/** "Due in 5 days", "Due today", "3 days overdue" */
export function dueIn(dueDate: string): string {
  const days = daysUntil(dueDate);
  if (days === 0) return "Due today";
  if (days > 0) return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
  return days === -1 ? "1 day overdue" : `${-days} days overdue`;
}

/** The next installment of an active loan is past its date. */
export const isOverdue = (loan: Loan) => loan.loan_status === "active" && !!loan.next_installment && daysUntil(loan.next_installment.due_date) < 0;

/** What a loan costs in total, from its schedule: principal, interest, and both. */
export function scheduleTotals(schedule: Installment[]) {
  const principal = schedule.reduce((s, i) => s + i.principal_minor, 0);
  const interest = schedule.reduce((s, i) => s + i.interest_minor, 0);
  const paid = schedule.filter((i) => i.paid_flag).reduce((s, i) => s + i.installment_amount_minor, 0);
  return { principal, interest, total: principal + interest, paid };
}

/** Owed across active loans, per currency. */
export function owedByCurrency(loans: Loan[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const l of loans) {
    if (l.loan_status !== "active") continue;
    totals.set(l.currency_code, (totals.get(l.currency_code) ?? 0) + l.balance_remaining_minor);
  }
  return totals;
}

/** The soonest installment due across active loans. */
export function nextPayment(loans: Loan[]): Loan | null {
  return (
    loans
      .filter((l) => l.loan_status === "active" && l.next_installment)
      .sort((a, b) => a.next_installment!.due_date.localeCompare(b.next_installment!.due_date))[0] ?? null
  );
}

/**
 * The application worth showing above the loans: one waiting for a decision,
 * or the latest one if it was turned down (until a newer one is made).
 */
export function applicationToShow(applications: LoanApplication[]): LoanApplication | null {
  const pending = applications.find((a) => a.status === "pending_review");
  if (pending) return pending;
  const latest = applications[0];
  return latest?.status === "rejected" ? latest : null;
}
