// Analytics from real data: the ledger (money in and out) and invoices
// (who pays, how fast, what's still owed). Pure functions, so the page only
// loads data and lays out cards. Amounts here are in major units (naira,
// dollars), which is what the analytics cards display.

import { formatDay } from "@/lib/invoicing";
import { isGoalMove } from "@/lib/ledger";
import { ScopedTransaction } from "@/types/account";
import {
  AIInsight,
  CashFlowBucket,
  ClientRevenueShare,
  ExpenseCategory,
  LatePaymentBucket,
  Period,
  ReminderEffectiveness,
  RevenuePoint,
} from "@/types/analytics";
import { Currency } from "@/types/invoice";
import { ApiInvoice } from "@/types/invoicing";

const DAY = 86_400_000;
const major = (minor: number) => minor / 100;
const asCurrency = (code: string): Currency | null => (code === "NGN" || code === "USD" ? code : null);

/** One bar of the revenue trend: [start, end). */
export interface TrendBucket {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

const shortMonth = (d: Date) => d.toLocaleString("en-US", { month: "short" });

/** The last `count` calendar months, oldest first, ending with this one. */
function monthBuckets(count: number, now: Date): TrendBucket[] {
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { key: `${start.getFullYear()}-${start.getMonth() + 1}`, label: shortMonth(start), start, end };
  });
}

/** This month in weeks (1–7, 8–14, …), up to the week we're in. */
function weekBuckets(now: Date): TrendBucket[] {
  const y = now.getFullYear(), m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const out: TrendBucket[] = [];
  for (let day = 1; day <= Math.min(lastDay, now.getDate()); day += 7) {
    const endDay = Math.min(day + 6, lastDay);
    out.push({
      key: `w${day}`,
      label: day === endDay ? `${day} ${shortMonth(now)}` : `${day}–${endDay} ${shortMonth(now)}`,
      start: new Date(y, m, day),
      end: new Date(y, m, endDay + 1),
    });
  }
  return out;
}

/** Start of the selected period, and the bars the trend chart shows for it. */
export function periodWindow(period: Period, now = new Date()): { start: Date; trend: TrendBucket[]; label: string } {
  switch (period) {
    case "this_month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), trend: weekBuckets(now), label: "this month" };
    case "last_3_months":
      return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), trend: monthBuckets(3, now), label: "in the last 3 months" };
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1), trend: monthBuckets(now.getMonth() + 1, now), label: "this year" };
  }
}

/** Last month and this one, for the month-on-month insight whatever the period. */
export const lastTwoMonths = (now = new Date()) => monthBuckets(2, now);

/**
 * YYYY-MM-DD of the earliest date any card needs, for loading ledger lines
 * once: the period's start, or last month's for the month-on-month insight.
 */
export function earliestNeeded(period: Period, now = new Date()): string {
  const { start } = periodWindow(period, now);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const d = lastMonth < start ? lastMonth : start;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const settled = (l: ScopedTransaction) => l.status === "settled" || l.status === "reversed";
// money that moved between two wallets both in view is neither in nor out,
// and neither is money put into or taken out of a savings goal
const internal = (l: ScopedTransaction, scoped: Set<string>) =>
  isGoalMove(l) || (!!l.counterparty_account_id && scoped.has(l.counterparty_account_id));

/**
 * Revenue: money others paid in (invoice payments, transfers, bank deposits).
 * Your own card top-ups, loan payouts and refunds aren't revenue.
 */
const REVENUE_TYPES = new Set(["invoice_payment", "transfer", "bank_deposit"]);

export function revenueTrend(lines: ScopedTransaction[], scoped: Set<string>, buckets: TrendBucket[]): RevenuePoint[] {
  const points = buckets.map((b) => ({ month: b.label, ngn: 0, usdRaw: 0, usdInNgnEquivalent: 0 }));
  for (const l of lines) {
    if (!settled(l) || l.direction !== "credit" || !scoped.has(l.account_id) || internal(l, scoped)) continue;
    if (!REVENUE_TYPES.has(l.transaction_type)) continue;
    const d = new Date(l.created_at);
    const point = points[buckets.findIndex((b) => d >= b.start && d < b.end)];
    if (!point) continue;
    if (l.currency_code === "NGN") point.ngn += major(l.amount_minor);
    else if (l.currency_code === "USD") point.usdRaw += major(l.amount_minor);
  }
  return points;
}

/** Money out in the period, grouped by what it was for. */
const SPEND_LABEL: Record<string, string> = {
  transfer: "Sent to others",
  invoice_payment: "Invoices you paid",
  loan_repayment: "Loan repayments",
  fee: "Fees",
  refund: "Refunds you gave",
};
const SPEND_COLORS = ["bg-emerald-600", "bg-sky-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-slate-400"];

/** `own`: accounts whose moves between each other don't count (default: the ones in view). */
export function spendingByType(
  lines: ScopedTransaction[],
  scoped: Set<string>,
  start: Date,
  currency: Currency,
  own: Set<string> = scoped,
): ExpenseCategory[] {
  const totals = new Map<string, number>();
  for (const l of lines) {
    if (!settled(l) || l.direction !== "debit" || !scoped.has(l.account_id) || internal(l, own)) continue;
    if (l.currency_code !== currency || new Date(l.created_at) < start) continue;
    const label = SPEND_LABEL[l.transaction_type] ?? "Other";
    totals.set(label, (totals.get(label) ?? 0) + major(l.amount_minor));
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], i) => ({ category, amount, currency, colorClass: SPEND_COLORS[i] ?? "bg-slate-400" }));
}

const dayOf = (iso: string) => {
  const d = new Date(iso);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};
const dueDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
/** Days late (0 = on time or early). */
const daysLate = (i: ApiInvoice) => Math.max(0, Math.round((dayOf(i.paid_at!) - dueDay(i.due_date)) / DAY));
const clientKey = (i: ApiInvoice) => i.client?.client_id ?? `acct:${i.billed_account_number ?? i.account_id}`;
const clientName = (i: ApiInvoice) => i.client?.name ?? `Account ${i.billed_account_number ?? ""}`.trim();
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const paidIn = (i: ApiInvoice, start: Date) => i.invoice_status === "paid" && !!i.paid_at && new Date(i.paid_at) >= start;

/**
 * Per client (and currency), from invoices paid in the period: revenue,
 * share of that currency's total, average days from sending to payment,
 * and how often they paid by the due date. No made-up "health" score.
 */
export function clientShares(invoices: ApiInvoice[], start: Date): ClientRevenueShare[] {
  const groups = new Map<string, { name: string; currency: Currency; revenue: number; days: number[]; onTime: number; count: number; id: string }>();
  for (const i of invoices) {
    if (!paidIn(i, start)) continue;
    const currency = asCurrency(i.currency_code);
    if (!currency) continue;
    const key = `${clientKey(i)}|${currency}`;
    const g = groups.get(key) ?? { id: key, name: clientName(i), currency, revenue: 0, days: [], onTime: 0, count: 0 };
    g.revenue += major(i.amount_due_minor);
    g.days.push(Math.max(0, Math.round((new Date(i.paid_at!).getTime() - new Date(i.sent_at ?? i.created_at).getTime()) / DAY)));
    if (daysLate(i) === 0) g.onTime += 1;
    g.count += 1;
    groups.set(key, g);
  }
  const totals = new Map<Currency, number>();
  for (const g of groups.values()) totals.set(g.currency, (totals.get(g.currency) ?? 0) + g.revenue);
  return [...groups.values()]
    .map((g) => ({
      clientId: g.id,
      name: g.name,
      initials: initialsOf(g.name),
      healthScore: null,
      avgCollectionDays: Math.round(g.days.reduce((s, d) => s + d, 0) / g.days.length),
      onTimeRate: Math.round((g.onTime / g.count) * 100),
      revenue: g.revenue,
      currency: g.currency,
      shareOfTotal: Math.round((g.revenue / (totals.get(g.currency) || 1)) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** What unpaid invoices should bring in, by when they're due. */
export function cashFlowForecast(invoices: ApiInvoice[], now = new Date()): CashFlowBucket[] {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const LABELS = ["Overdue", "Next 7 days", "8–30 days", "Later"] as const;
  const buckets = new Map<string, CashFlowBucket>();
  for (const i of invoices) {
    if (i.invoice_status !== "open" && i.invoice_status !== "overdue") continue;
    const currency = asCurrency(i.currency_code);
    if (!currency) continue;
    const inDays = Math.round((dueDay(i.due_date) - today) / DAY);
    const label = inDays < 0 ? LABELS[0] : inDays <= 7 ? LABELS[1] : inDays <= 30 ? LABELS[2] : LABELS[3];
    const key = `${currency}|${label}`;
    const b = buckets.get(key) ?? { label, expected: 0, currency, invoiceCount: 0 };
    b.expected += major(i.amount_due_minor);
    b.invoiceCount += 1;
    buckets.set(key, b);
  }
  // every bucket, in order, for each currency that has anything due
  const currencies = [...new Set([...buckets.values()].map((b) => b.currency))];
  return currencies.flatMap((currency) =>
    LABELS.map((label) => buckets.get(`${currency}|${label}`) ?? { label, expected: 0, currency, invoiceCount: 0 }),
  );
}

/** Of invoices reminded in the period: paid within 48 hours of the last reminder, paid later, or still unpaid. */
export function reminderEffectiveness(invoices: ApiInvoice[], start: Date): ReminderEffectiveness {
  const result = { remindersSent: 0, paidWithin48h: 0, paidLater: 0, stillUnpaid: 0 };
  for (const i of invoices) {
    if (!i.reminders_sent || !i.last_reminder_at || new Date(i.last_reminder_at) < start) continue;
    if (i.invoice_status === "cancelled") continue;
    result.remindersSent += 1;
    if (i.invoice_status === "paid" || i.invoice_status === "refunded") {
      const after = new Date(i.paid_at ?? 0).getTime() - new Date(i.last_reminder_at).getTime();
      if (after >= 0 && after <= 2 * DAY) result.paidWithin48h += 1;
      else result.paidLater += 1;
    } else {
      result.stillUnpaid += 1;
    }
  }
  return result;
}

/** How late invoices paid in the period were. */
export function latePayments(invoices: ApiInvoice[], start: Date): LatePaymentBucket[] {
  const buckets = [
    { label: "On time", count: 0 },
    { label: "1–7 days late", count: 0 },
    { label: "8–30 days late", count: 0 },
    { label: "30+ days late", count: 0 },
  ];
  for (const i of invoices) {
    if (!paidIn(i, start)) continue;
    const late = daysLate(i);
    buckets[late === 0 ? 0 : late <= 7 ? 1 : late <= 30 ? 2 : 3].count += 1;
  }
  return buckets;
}

const fmt = (amount: number, currency: Currency) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", { style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(amount);

/**
 * Plain observations from the numbers above, most important first. Rules,
 * not AI: each one says exactly what it's based on.
 */
export function insights({
  invoices,
  clients,
  monthly,
  forecast,
  reminders,
  currency,
  periodLabel,
}: {
  invoices: ApiInvoice[];
  clients: ClientRevenueShare[];
  /** last month and this month, from lastTwoMonths() */
  monthly: RevenuePoint[];
  forecast: CashFlowBucket[];
  reminders: ReminderEffectiveness;
  currency: Currency;
  periodLabel: string;
}): AIInsight[] {
  const out: AIInsight[] = [];

  const overdue = invoices.filter((i) => i.invoice_status === "overdue" && i.currency_code === currency);
  if (overdue.length) {
    const total = overdue.reduce((s, i) => s + major(i.amount_due_minor), 0);
    const oldest = overdue.reduce((a, b) => (a.due_date < b.due_date ? a : b));
    out.push({
      id: "overdue",
      tone: "warning",
      title: `${overdue.length} invoice${overdue.length === 1 ? " is" : "s are"} overdue: ${fmt(total, currency)}`,
      detail: `The oldest, ${oldest.invoice_number ?? "a draft"} for ${oldest.client?.name ?? "a client"}, was due ${formatDay(oldest.due_date)}. A reminder from the invoice page often gets it paid.`,
    });
  }

  const top = clients.find((c) => c.currency === currency);
  if (top && top.shareOfTotal >= 50 && clients.filter((c) => c.currency === currency).length > 1) {
    out.push({
      id: "concentration",
      tone: "warning",
      title: `${top.name} brought in ${top.shareOfTotal}% of your ${currency} revenue ${periodLabel}`,
      detail: "Relying on one client is a risk if they pause or pay late. More clients spread it out.",
    });
  }

  const key = currency === "NGN" ? "ngn" : "usdRaw";
  const [prev, cur] = monthly.map((p) => p[key]);
  if (monthly.length === 2 && prev > 0) {
    const change = Math.round(((cur - prev) / prev) * 100);
    if (Math.abs(change) >= 10) {
      out.push({
        id: "revenue-change",
        tone: change > 0 ? "positive" : "warning",
        title: `Revenue ${change > 0 ? "up" : "down"} ${Math.abs(change)}% on last month`,
        detail: `${fmt(cur, currency)} so far this month, against ${fmt(prev, currency)} last month.`,
      });
    }
  }

  const soon = forecast.find((b) => b.currency === currency && b.label === "Next 7 days");
  if (soon && soon.expected > 0) {
    out.push({
      id: "expected",
      tone: "info",
      title: `${fmt(soon.expected, currency)} due to you in the next 7 days`,
      detail: `From ${soon.invoiceCount} invoice${soon.invoiceCount === 1 ? "" : "s"}. You'll get an alert the moment each is paid.`,
    });
  }

  if (reminders.remindersSent > 0) {
    const paid = reminders.paidWithin48h + reminders.paidLater;
    out.push({
      id: "reminders",
      tone: paid > 0 ? "positive" : "info",
      title: `${paid} of ${reminders.remindersSent} reminded invoice${reminders.remindersSent === 1 ? "" : "s"} got paid`,
      detail: reminders.paidWithin48h
        ? `${reminders.paidWithin48h} within 48 hours of the reminder.`
        : "None within 48 hours yet.",
    });
  }

  if (!out.length) {
    out.push({
      id: "quiet",
      tone: "info",
      title: "Nothing needs your attention",
      detail: invoices.length ? "No overdue invoices and no big swings in revenue." : "Send your first invoice and this page fills in as clients pay.",
    });
  }
  return out;
}
