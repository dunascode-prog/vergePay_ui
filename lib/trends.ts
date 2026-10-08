// Trends for the summary cards (components/StatCard.tsx): a sparkline of
// six 30-day steps (about 6 months) and the change over the last step, in
// one currency (the card's main one). Built only from data the page has.
// The last step of the line is always the change shown beside it.
//
//   flows      money that moves over time (paid, revenue, money out, payroll):
//              each point is the total over a 30-day window, the last one
//              ending now; the change compares the last 30 days with the 30
//              days before.
//   balances   amounts that stand at a moment (outstanding, overdue, owed):
//              each point is the balance at a moment 30 days apart, the last
//              one now; the change compares now with 30 days ago.

import { PER_MONTH } from "@/lib/recurring";
import { ApiClient, ApiInvoice } from "@/types/invoicing";
import { ApiRecurringPlan } from "@/types/recurring";

const DAY = 86_400_000;

export interface Trend {
  /** Oldest first; the last point is the current month (or now). */
  points: number[];
  /** -0.25 = down 25%. null when there's nothing to compare with. */
  change: number | null;
  /** Whether a rise is good news (paid, revenue) or bad (overdue, money out). */
  goodWhen: "up" | "down";
}

export interface MoneyEvent {
  at: number; // ms
  minor: number;
  currency: string;
}

const STEPS = 6;
const ratio = (now: number, before: number) => (before > 0 ? (now - before) / before : null);
const lastTwo = (points: number[]) => ratio(points[points.length - 1], points[points.length - 2]);

/** The card's main currency: naira first, then alphabetical (as CurrencyAmounts shows it). */
export function mainCurrency(totals: Map<string, number>): string | null {
  const keys = [...totals.keys()];
  if (!keys.length) return null;
  return keys.includes("NGN") ? "NGN" : keys.sort()[0];
}

/** Totals over six 30-day windows, the last ending now. */
export function flowTrend(events: MoneyEvent[], currency: string | null, goodWhen: Trend["goodWhen"], now = Date.now()): Trend | null {
  if (!currency) return null;
  const mine = events.filter((e) => e.currency === currency);
  const points = Array.from({ length: STEPS }, (_, k) => {
    const to = now - (STEPS - 1 - k) * 30 * DAY;
    return mine.reduce((sum, e) => (e.at > to - 30 * DAY && e.at <= to ? sum + e.minor : sum), 0);
  });
  if (points.every((p) => p === 0)) return null;
  return { points, change: lastTwo(points), goodWhen };
}

/** A balance at six moments 30 days apart, the last one now. */
export function balanceTrend(valueAt: (t: number) => number, goodWhen: Trend["goodWhen"], now = Date.now()): Trend | null {
  const points = Array.from({ length: STEPS }, (_, k) => valueAt(now - (STEPS - 1 - k) * 30 * DAY));
  if (points.every((p) => p === 0)) return null;
  return { points, change: lastTwo(points), goodWhen };
}

// ---- invoices: what was unpaid (or overdue) at a moment, from their dates

const at = (iso: string | null) => (iso ? new Date(iso).getTime() : Infinity);

/** Sent by t and not yet paid, cancelled or refunded by then. */
export function unpaidAt(i: ApiInvoice, t: number): boolean {
  if (i.invoice_status === "draft") return false;
  return at(i.sent_at ?? i.created_at) <= t && at(i.paid_at) > t && at(i.cancelled_at) > t && at(i.refunded_at) > t;
}

/** Unpaid at t, and its due date had passed by then. */
export function overdueAt(i: ApiInvoice, t: number): boolean {
  if (!unpaidAt(i, t)) return false;
  const [y, m, day] = i.due_date.split("-").map(Number);
  return new Date(y, m - 1, day + 1).getTime() <= t; // due on that day; late from the next
}

export function invoiceBalanceAt(invoices: ApiInvoice[], currency: string | null, pick: (i: ApiInvoice, t: number) => boolean) {
  return (t: number) => invoices.reduce((sum, i) => (i.currency_code === currency && pick(i, t) ? sum + i.amount_due_minor : sum), 0);
}

/** Paid invoices' money received up to t (a running total, for "paid to you, all time"). */
export function paidByAt(invoices: ApiInvoice[], currency: string | null) {
  return (t: number) =>
    invoices.reduce((sum, i) => (i.currency_code === currency && i.invoice_status === "paid" && at(i.paid_at) <= t ? sum + i.amount_due_minor : sum), 0);
}

// ---- clients and plans at a moment

/** Clients on the books at t: added by then and not yet archived. */
export const clientsAt = (clients: ApiClient[]) => (t: number) =>
  clients.filter((c) => at(c.created_at) <= t && at(c.archived_at) > t).length;

// A plan's history is its creation, its latest pause and its cancellation;
// an earlier pause that was resumed isn't recorded, so it counts as active.
const planActiveAt = (p: ApiRecurringPlan, t: number) =>
  at(p.created_at) <= t && at(p.cancelled_at) > t && !(p.plan_status === "paused" && at(p.paused_at) <= t);

export const activePlansAt = (plans: ApiRecurringPlan[]) => (t: number) => plans.filter((p) => planActiveAt(p, t)).length;

export const pausedPlansAt = (plans: ApiRecurringPlan[]) => (t: number) =>
  plans.filter((p) => p.plan_status === "paused" && at(p.paused_at) <= t && at(p.cancelled_at) > t).length;

/** Monthly recurring revenue at t, from the plans active then (at today's amounts). */
export function recurringAt(plans: ApiRecurringPlan[], currency: string | null) {
  return (t: number) =>
    plans.reduce((sum, p) => (p.currency_code === currency && planActiveAt(p, t) ? sum + Math.round(p.amount_minor * PER_MONTH[p.frequency]) : sum), 0);
}

/** Money received for paid invoices, as events at the time each was paid. */
export const paidInvoiceEvents = (invoices: ApiInvoice[]): MoneyEvent[] =>
  invoices
    .filter((i) => i.paid_at && i.invoice_status === "paid")
    .map((i) => ({ at: new Date(i.paid_at!).getTime(), minor: i.amount_due_minor, currency: i.currency_code }));
