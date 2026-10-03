import { formatMinor } from "@/lib/ledger";
import { ApiInvoice, InvoiceStatus, NewItem } from "@/types/invoicing";

// Pure helpers for invoice screens: totals, dates, status wording.

/** Line amount in minor units, exactly as the API works it out (half up, to the kobo). */
export function lineAmount(item: Pick<NewItem, "quantity" | "unit_amount_minor">): number {
  const hundredths = Math.round(item.quantity * 100);
  return Math.floor((hundredths * item.unit_amount_minor + 50) / 100);
}

export const lineTotal = (items: Pick<NewItem, "quantity" | "unit_amount_minor">[]) =>
  items.reduce((sum, item) => sum + lineAmount(item), 0);

/** Today, or n days from today, as YYYY-MM-DD in the browser's timezone. */
export function isoDay(daysFromToday = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from today to a YYYY-MM-DD date (negative when it's past). */
export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = isoDay().split("-").map(Number);
  return Math.round((target - new Date(ty, tm - 1, td).getTime()) / 86_400_000);
}

export function formatDay(isoDate: string, withYear = true): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** "Due in 5 days", "Due today", "3 days overdue", "Paid 12 Oct". */
export function dueLabel(invoice: Pick<ApiInvoice, "invoice_status" | "due_date" | "paid_at" | "cancelled_at" | "refunded_at">): string {
  switch (invoice.invoice_status) {
    case "paid":
      return invoice.paid_at ? `Paid ${formatDay(invoice.paid_at, false)}` : "Paid";
    case "refunded":
      return invoice.refunded_at ? `Refunded ${formatDay(invoice.refunded_at, false)}` : "Refunded";
    case "cancelled":
      return "Cancelled";
    default: {
      const days = daysUntil(invoice.due_date);
      if (days === 0) return "Due today";
      if (days > 0) return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
      return days === -1 ? "1 day overdue" : `${-days} days overdue`;
    }
  }
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  open: "Unpaid",
  overdue: "Overdue",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const money = (minor: number, currency: string) => formatMinor(minor, currency);

/** "₦1.2M + $300" for totals that span currencies. */
export function moneyByCurrency(totals: Map<string, number>, compact = false): string {
  if (totals.size === 0) return money(0, "NGN");
  return [...totals.entries()]
    .sort(([a], [b]) => (a === "NGN" ? -1 : b === "NGN" ? 1 : a.localeCompare(b)))
    .map(([currency, minor]) => formatMinor(minor, currency, { compact }))
    .join(" + ");
}

export function sumBy(invoices: ApiInvoice[], pick: (i: ApiInvoice) => boolean): Map<string, number> {
  const totals = new Map<string, number>();
  for (const i of invoices) if (pick(i)) totals.set(i.currency_code, (totals.get(i.currency_code) ?? 0) + i.amount_due_minor);
  return totals;
}

export const isUnpaid = (i: ApiInvoice) => i.invoice_status === "open" || i.invoice_status === "overdue";
