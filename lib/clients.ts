// The clients page's view of the client book: labels, sorting and
// portfolio insights over what the API works out from invoices
// (services/clients.js in the API). Rules, not AI: each insight says what
// it's based on.

import { money, moneyByCurrency } from "@/lib/invoicing";
import { ApiClient, ClientHealthLabel } from "@/types/invoicing";

const DAY = 86_400_000;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

/** Added in the last 30 days and not paid yet. */
export const isNewClient = (c: ApiClient, now = Date.now()) => c.paid_count === 0 && now - new Date(c.created_at).getTime() < 30 * DAY;

export const hasActivePlan = (c: ApiClient) => c.recurring_plans.some((p) => p.plan_status === "active");

export const isAtRisk = (c: ApiClient) => c.health.label === "at_risk";

/** The latest thing that happened with a client: invoiced, paid, or added. */
export function lastActivity(c: ApiClient): string {
  return [c.last_paid_at, c.last_invoiced_at, c.created_at].filter((d): d is string => !!d).sort().at(-1)!;
}

export const HEALTH_LABEL: Record<ClientHealthLabel, string> = {
  new: "New",
  reliable: "Reliable",
  watch: "Watch",
  at_risk: "At risk",
};

export const HEALTH_TONE: Record<ClientHealthLabel, string> = {
  new: "bg-muted text-muted-foreground",
  reliable: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  watch: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  at_risk: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
};

/** Totals per currency across clients, e.g. everything they've paid. */
export function totalBy(clients: ApiClient[], pick: (c: ApiClient) => ApiClient["revenue"]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const c of clients) for (const a of pick(c)) totals.set(a.currency_code, (totals.get(a.currency_code) ?? 0) + a.amount_minor);
  return totals;
}

/** For sorting by revenue: naira first, then dollars (never converted). */
export const revenueKey = (c: ApiClient) => {
  const of = (code: string) => c.revenue.find((r) => r.currency_code === code)?.amount_minor ?? 0;
  return [of("NGN"), of("USD")] as const;
};

export interface ClientInsight {
  tone: "warning" | "positive" | "info";
  text: string;
}

const names = (cs: ApiClient[]) =>
  cs.length <= 2 ? cs.map((c) => c.name).join(" and ") : `${cs.slice(0, 2).map((c) => c.name).join(", ")} and ${cs.length - 2} more`;

/** What's worth knowing about the client book, most important first. */
export function clientInsights(clients: ApiClient[], now = Date.now()): ClientInsight[] {
  const out: ClientInsight[] = [];

  const overdue = clients.filter((c) => c.overdue_count > 0);
  if (overdue.length) {
    const total = moneyByCurrency(totalBy(overdue, (c) => c.overdue));
    out.push({ tone: "warning", text: `${names(overdue)} ${overdue.length === 1 ? "owes" : "owe"} ${total} past its due date. A reminder from the invoice usually gets it paid.` });
  }

  // one client carrying most of a currency's revenue
  for (const currency of ["NGN", "USD"]) {
    const earners = clients
      .map((c) => ({ c, amount: c.revenue.find((r) => r.currency_code === currency)?.amount_minor ?? 0 }))
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    const total = earners.reduce((s, x) => s + x.amount, 0);
    if (earners.length > 1 && earners[0].amount / total >= 0.5) {
      out.push({
        tone: "warning",
        text: `${earners[0].c.name} brought in ${Math.round((earners[0].amount / total) * 100)}% of your ${currency} revenue. Relying on one client is a risk if they pause or pay late.`,
      });
    }
  }

  const reliable = clients.filter((c) => c.health.label === "reliable" && c.paid_count >= 2);
  if (reliable.length) out.push({ tone: "positive", text: `${names(reliable)} ${reliable.length === 1 ? "pays" : "pay"} on time, invoice after invoice.` });

  const fresh = clients.filter((c) => isNewClient(c, now));
  if (fresh.length) {
    out.push({ tone: "info", text: `${names(fresh)} ${fresh.length === 1 ? "is a new client" : "are new clients"}. Their health score appears once they've paid an invoice.` });
  }

  const quiet = clients.filter((c) => c.invoice_count > 0 && !hasActivePlan(c) && now - new Date(lastActivity(c)).getTime() > 60 * DAY);
  if (quiet.length) out.push({ tone: "info", text: `No invoices to ${names(quiet)} in over two months. Worth a check-in?` });

  return out;
}

/** "₦150,000.00 + $250.00" or "—". */
export const amounts = (list: ApiClient["revenue"]) => (list.length ? list.map((a) => money(a.amount_minor, a.currency_code)).join(" + ") : "—");
