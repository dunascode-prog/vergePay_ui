import { daysUntil } from "@/lib/invoicing";
import { PayFrequency, Payee, PayrollRun, PayType } from "@/types/payroll";

// Pure helpers for the payroll screens: wording and totals.

export const PAY_TYPES: PayType[] = ["retainer", "per_project", "hourly"];
export const FREQUENCIES: PayFrequency[] = ["monthly", "biweekly", "one_off"];

export const PAY_TYPE_LABEL: Record<PayType, string> = {
  retainer: "Retainer",
  per_project: "Per project",
  hourly: "Hourly",
};

export const FREQUENCY_LABEL: Record<PayFrequency, string> = {
  monthly: "Monthly",
  biweekly: "Every two weeks",
  one_off: "One-off",
};

/** What the usual amount is called for this kind of payee. */
export const RATE_LABEL: Record<PayType, string> = {
  retainer: "Retainer",
  per_project: "Usual project fee",
  hourly: "Usual payment",
};

export const MAX_RUN_PAYEES = 50;

/** "NA" for "Ngozi Adaeze", "KD" for "Kunle (design)" or "kunle_design". Letters only. */
export function initials(name: string): string {
  const parts = name.split(/[^\p{L}]+/u).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/** "Due now", "Due in 5 days", "Paid · one-off", "Not paid yet". */
export function nextPayLabel(payee: Payee): string {
  if (payee.payee_status === "inactive") return "Inactive";
  if (payee.payment_count === 0) return "Not paid yet";
  if (!payee.next_pay_date) return "Paid · one-off";
  const days = daysUntil(payee.next_pay_date);
  if (days <= 0) return "Due now";
  return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
}

/** Paid out across runs since `from`, per currency. */
export function paidSince(runs: PayrollRun[], from: Date): Map<string, number> {
  const totals = new Map<string, number>();
  for (const r of runs) {
    if (new Date(r.created_at) < from) continue;
    totals.set(r.currency_code, (totals.get(r.currency_code) ?? 0) + r.total_minor);
  }
  return totals;
}

/** What paying every due payee at their usual amount would cost, per currency. */
export function dueTotals(payees: Payee[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const p of payees) if (p.is_due) totals.set(p.currency_code, (totals.get(p.currency_code) ?? 0) + p.rate_minor);
  return totals;
}
