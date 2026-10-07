// The business overview, worked out from real data: the ledger lines of the
// wallets in view, the invoices paid into them, their recurring plans and the
// client book. Pure functions, so the page only loads data and lays out cards.
// Amounts are minor units (kobo, cents) unless a name says otherwise.
//
// Moves between your own accounts (personal ↔ business, funding investments)
// are neither revenue nor money out here, in any view: paying yourself isn't
// an expense, and topping up the business from your own pocket isn't income.

import { clientShares } from "@/lib/analytics";
import { daysUntil, formatDay, isUnpaid, money, sumBy } from "@/lib/invoicing";
import { MonthFlow, MonthKey } from "@/lib/ledger";
import { Account, ScopedTransaction } from "@/types/account";
import { AttentionItem, BusinessHealthFactor } from "@/types/business";
import { Currency } from "@/types/invoice";
import { ApiClient, ApiInvoice } from "@/types/invoicing";
import { ApiRecurringPlan } from "@/types/recurring";

const DAY = 86_400_000;

/** Money others paid in: invoice payments, transfers, bank deposits and payroll (not your own card top-ups). */
const REVENUE_TYPES = new Set(["invoice_payment", "transfer", "bank_deposit", "payroll_payment"]);

const moved = (l: ScopedTransaction) => l.status === "settled" || l.status === "reversed";
const fromOutside = (l: ScopedTransaction, own: Set<string>) => !l.counterparty_account_id || !own.has(l.counterparty_account_id);

export const isRevenue = (l: ScopedTransaction, scoped: Set<string>, own: Set<string>) =>
  moved(l) && l.direction === "credit" && scoped.has(l.account_id) && fromOutside(l, own) && REVENUE_TYPES.has(l.transaction_type);

export const isMoneyOut = (l: ScopedTransaction, scoped: Set<string>, own: Set<string>) =>
  moved(l) && l.direction === "debit" && scoped.has(l.account_id) && fromOutside(l, own);

const add = (map: Map<string, number>, currency: string, amount: number) => map.set(currency, (map.get(currency) ?? 0) + amount);

export const startOfYear = (now: Date) => new Date(now.getFullYear(), 0, 1);

/** YYYY-MM-DD of the earliest line any card needs: 1 January, or 180 days back for the trends. */
export function ledgerFrom(now: Date): string {
  const back = new Date(now.getTime() - 180 * DAY);
  const d = back < startOfYear(now) ? back : startOfYear(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface YearTotals {
  revenue: Map<string, number>;
  moneyOut: Map<string, number>;
  net: Map<string, number>;
}

/** Revenue, money out and net since 1 January, per currency. */
export function yearTotals(lines: ScopedTransaction[], scoped: Set<string>, own: Set<string>, now: Date): YearTotals {
  const start = startOfYear(now);
  const revenue = new Map<string, number>();
  const moneyOut = new Map<string, number>();
  for (const l of lines) {
    if (new Date(l.created_at) < start) continue;
    if (isRevenue(l, scoped, own)) add(revenue, l.currency_code, l.amount_minor);
    else if (isMoneyOut(l, scoped, own)) add(moneyOut, l.currency_code, l.amount_minor);
  }
  const net = new Map<string, number>();
  for (const c of new Set([...revenue.keys(), ...moneyOut.keys()])) net.set(c, (revenue.get(c) ?? 0) - (moneyOut.get(c) ?? 0));
  return { revenue, moneyOut, net };
}

/** Revenue (as income) and money out (as spent) per month, in one currency, for the cash-flow chart. */
export function monthlyRevenueAndOut(
  lines: ScopedTransaction[],
  scoped: Set<string>,
  own: Set<string>,
  currency: string,
  months: MonthKey[],
): MonthFlow[] {
  const byKey = new Map(months.map((m) => [m.key, { ...m, income: 0, spent: 0, net: 0 }]));
  for (const l of lines) {
    if (l.currency_code !== currency) continue;
    const d = new Date(l.created_at);
    const month = byKey.get(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    if (!month) continue;
    if (isRevenue(l, scoped, own)) month.income += l.amount_minor;
    else if (isMoneyOut(l, scoped, own)) month.spent += l.amount_minor;
  }
  return months.map((m) => {
    const f = byKey.get(m.key)!;
    return { ...f, net: f.income - f.spent };
  });
}

/** What clients owe on sent, unpaid invoices, and the overdue part of it. */
export function receivables(invoices: ApiInvoice[]) {
  return {
    owed: sumBy(invoices, isUnpaid),
    overdue: sumBy(invoices, (i) => i.invoice_status === "overdue"),
  };
}

// ---- the health score: five rules, each one saying what it's based on

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function sumIn(lines: ScopedTransaction[], pick: (l: ScopedTransaction) => boolean, currency: string, from: number, to: number) {
  let total = 0;
  for (const l of lines) {
    const t = new Date(l.created_at).getTime();
    if (l.currency_code === currency && t >= from && t < to && pick(l)) total += l.amount_minor;
  }
  return total;
}

const dueDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const paidOnTime = (i: ApiInvoice) => {
  const p = new Date(i.paid_at!);
  return Date.UTC(p.getFullYear(), p.getMonth(), p.getDate()) <= dueDay(i.due_date);
};

export interface BusinessHealth {
  /** 0–100, or null until there's enough activity to judge */
  score: number | null;
  label: string;
  factors: (BusinessHealthFactor & { score: number })[];
}

export function businessHealth({
  lines,
  scoped,
  own,
  wallets,
  invoices,
  currency,
  now,
}: {
  lines: ScopedTransaction[];
  scoped: Set<string>;
  own: Set<string>;
  wallets: Account[];
  invoices: ApiInvoice[];
  currency: Currency;
  now: Date;
}): BusinessHealth {
  const factors: BusinessHealth["factors"] = [];
  const year = startOfYear(now);
  const t = now.getTime();

  // 1. paid on time, this year
  const paid = invoices.filter((i) => i.invoice_status === "paid" && i.paid_at && new Date(i.paid_at) >= year);
  if (paid.length) {
    const onTime = paid.filter(paidOnTime).length;
    const rate = Math.round((onTime / paid.length) * 100);
    factors.push({
      label: "Clients pay on time",
      status: rate >= 80 ? "good" : rate >= 50 ? "watch" : "risk",
      detail: `${onTime} of ${paid.length} invoice${paid.length === 1 ? "" : "s"} paid this year ${paid.length === 1 ? "was" : "were"} paid by the due date.`,
      score: rate,
    });
  }

  // 2. how much of what's owed is late
  const unpaid = invoices.filter(isUnpaid);
  if (unpaid.length) {
    const overdue = unpaid.filter((i) => i.invoice_status === "overdue");
    const share = overdue.length / unpaid.length;
    factors.push({
      label: overdue.length ? "Overdue invoices" : "Nothing overdue",
      status: overdue.length === 0 ? "good" : share <= 1 / 3 ? "watch" : "risk",
      detail: overdue.length
        ? `${overdue.length} of ${unpaid.length} unpaid invoice${unpaid.length === 1 ? " is" : "s are"} past due.`
        : `All ${unpaid.length} unpaid invoice${unpaid.length === 1 ? " is" : "s are"} still within terms.`,
      score: clamp(100 - share * 100),
    });
  }

  // 3. one client carrying the revenue (this year, main currency)
  const shares = clientShares(invoices, year).filter((c) => c.currency === currency);
  if (shares.length) {
    const top = shares[0];
    factors.push({
      label: shares.length === 1 ? "One paying client" : "Revenue spread",
      status: shares.length > 1 && top.shareOfTotal <= 40 ? "good" : top.shareOfTotal <= 60 ? "watch" : "risk",
      detail:
        shares.length === 1
          ? `All of this year's ${currency} invoice revenue came from ${top.name}.`
          : `${top.name}, your biggest client, brought in ${top.shareOfTotal}% of this year's ${currency} invoice revenue.`,
      score: top.shareOfTotal <= 40 ? 100 : clamp(100 - ((top.shareOfTotal - 40) / 60) * 100),
    });
  }

  // 4. how long cash lasts at the last 90 days' pace
  const cash = wallets.filter((w) => w.currency_code === currency).reduce((s, w) => s + w.balance_minor, 0);
  const out90 = sumIn(lines, (l) => isMoneyOut(l, scoped, own), currency, t - 90 * DAY, t + DAY);
  if (out90 > 0) {
    const months = cash / (out90 / 3);
    const shown = months >= 12 ? "over a year" : `about ${months < 1 ? months.toFixed(1) : Math.round(months * 10) / 10} month${months >= 0.95 && months < 1.05 ? "" : "s"}`;
    factors.push({
      label: "Cash cover",
      status: months >= 3 ? "good" : months >= 1 ? "watch" : "risk",
      detail: `Your ${currency} cash covers ${shown} of money out, at the last 90 days' pace.`,
      score: clamp((months / 3) * 100),
    });
  }

  // 5. revenue: the last 90 days against the 90 before
  const isRev = (l: ScopedTransaction) => isRevenue(l, scoped, own);
  const recent = sumIn(lines, isRev, currency, t - 90 * DAY, t + DAY);
  const before = sumIn(lines, isRev, currency, t - 180 * DAY, t - 90 * DAY);
  if (before > 0) {
    const change = Math.round(((recent - before) / before) * 100);
    factors.push({
      label: change >= 0 ? "Revenue growing" : "Revenue slowing",
      status: change >= 0 ? "good" : change >= -20 ? "watch" : "risk",
      detail: `${currency} revenue in the last 90 days is ${change === 0 ? "level with" : `${change > 0 ? "up" : "down"} ${Math.abs(change)}% on`} the 90 days before.`,
      score: clamp(((change + 50) / 60) * 100),
    });
  }

  if (!factors.length) return { score: null, label: "Not enough activity yet", factors };
  const score = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  return { score, label: score >= 75 ? "Strong" : score >= 50 ? "Fair" : "Needs work", factors };
}

// ---- what needs doing, most urgent first

const MAX_OVERDUE = 4;

export function attentionItems(invoices: ApiInvoice[], plans: ApiRecurringPlan[], clients: ApiClient[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  const overdue = invoices.filter((i) => i.invoice_status === "overdue").sort((a, b) => a.due_date.localeCompare(b.due_date));
  for (const i of overdue.slice(0, MAX_OVERDUE)) {
    const late = -daysUntil(i.due_date);
    items.push({
      id: `overdue-${i.invoice_id}`,
      severity: "high",
      title: `${i.invoice_number ?? "An invoice"} for ${i.client?.name ?? "a client"} is ${late} day${late === 1 ? "" : "s"} overdue`,
      detail: `${money(i.amount_due_minor, i.currency_code)}, due ${formatDay(i.due_date)}. Send a reminder from the invoice.`,
      href: `/dashboard/invoices/${i.invoice_id}`,
      linkLabel: "Open invoice",
    });
  }
  if (overdue.length > MAX_OVERDUE) {
    items.push({
      id: "overdue-more",
      severity: "high",
      title: `${overdue.length - MAX_OVERDUE} more overdue invoice${overdue.length - MAX_OVERDUE === 1 ? "" : "s"}`,
      detail: "See them all on the invoices page.",
      href: "/dashboard/invoices",
      linkLabel: "View invoices",
    });
  }

  for (const p of plans.filter((p) => p.plan_status === "active" && p.last_error)) {
    items.push({
      id: `plan-error-${p.plan_id}`,
      severity: "high",
      title: `${p.client.name}'s plan couldn't send its last invoice`,
      detail: p.last_error!,
      href: `/dashboard/recurring/${p.plan_id}`,
      linkLabel: "View plan",
    });
  }

  // clients who pay late, unless an overdue invoice above already names them
  const named = new Set(overdue.map((i) => i.client?.client_id));
  const billed = new Set(invoices.map((i) => i.client?.client_id));
  for (const c of clients.filter((c) => !c.archived_at && c.health.label === "at_risk" && billed.has(c.client_id) && !named.has(c.client_id))) {
    items.push({
      id: `client-${c.client_id}`,
      severity: "medium",
      title: `${c.name} is a payment risk`,
      detail: c.health.reasons[0] ?? `Health score ${c.health.score}/100.`,
      href: "/dashboard/clients",
      linkLabel: "View client",
    });
  }

  for (const p of plans.filter((p) => p.plan_status === "paused")) {
    items.push({
      id: `plan-paused-${p.plan_id}`,
      severity: "medium",
      title: `${p.client.name}'s plan is paused`,
      detail: `${p.description}. Nothing is billed until you resume it.`,
      href: `/dashboard/recurring/${p.plan_id}`,
      linkLabel: "View plan",
    });
  }

  const drafts = invoices.filter((i) => i.invoice_status === "draft");
  if (drafts.length) {
    items.push({
      id: "drafts",
      severity: "medium",
      title: `${drafts.length} draft invoice${drafts.length === 1 ? " hasn't" : "s haven't"} been sent`,
      detail: "Clients can't pay a draft until you send it.",
      href: drafts.length === 1 ? `/dashboard/invoices/${drafts[0].invoice_id}` : "/dashboard/invoices",
      linkLabel: drafts.length === 1 ? "Open draft" : "View invoices",
    });
  }

  return items;
}

/** The active plan that bills next. */
export function nextBilling(plans: ApiRecurringPlan[]): ApiRecurringPlan | null {
  return (
    plans
      .filter((p) => p.plan_status === "active" && p.next_billing_date)
      .sort((a, b) => a.next_billing_date!.localeCompare(b.next_billing_date!))[0] ?? null
  );
}
