// Recurring billing helpers. Billing dates follow the API's rule
// (recurring_billing_date in the API's migrations): always counted from the
// start date, so a plan started on the 31st bills on the 31st whenever the
// month has one, and on the month's last day when it doesn't.

import { ApiRecurringPlan, RecurringFrequency } from "@/types/recurring";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const MONTHS: Record<Exclude<RecurringFrequency, "weekly">, number> = { monthly: 1, quarterly: 3, yearly: 12 };

/** The billing date of cycle n (0 = the start date), as YYYY-MM-DD. */
export function billingDate(start: string, frequency: RecurringFrequency, n: number): string {
  const [y, m, d] = start.split("-").map(Number);
  if (frequency === "weekly") {
    const date = new Date(y, m - 1, d + 7 * n);
    return iso(date.getFullYear(), date.getMonth(), date.getDate());
  }
  const months = m - 1 + MONTHS[frequency] * n;
  const year = y + Math.floor(months / 12);
  const month = ((months % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return iso(year, month, Math.min(d, lastDay));
}

/** The first `count` billing dates of a plan starting on `start`. */
export const firstBillingDates = (start: string, frequency: RecurringFrequency, count = 3) =>
  Array.from({ length: count }, (_, n) => billingDate(start, frequency, n));

export const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

/** "every week", "every month", "every 3 months", "every year" */
export const EVERY: Record<RecurringFrequency, string> = {
  weekly: "every week",
  monthly: "every month",
  quarterly: "every 3 months",
  yearly: "every year",
};

/** "Due on receipt", "Due in 14 days" */
export const termsLabel = (days: number) => (days === 0 ? "Due on receipt" : `Due in ${days} day${days === 1 ? "" : "s"}`);

// a month is 52 weeks / 12: what a weekly plan brings in, averaged
export const PER_MONTH: Record<RecurringFrequency, number> = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };

/** Monthly recurring revenue of the active plans, per currency, in minor units. */
export function monthlyRecurring(plans: ApiRecurringPlan[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const p of plans) {
    if (p.plan_status !== "active") continue;
    totals.set(p.currency_code, (totals.get(p.currency_code) ?? 0) + Math.round(p.amount_minor * PER_MONTH[p.frequency]));
  }
  return totals;
}
