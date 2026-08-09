import { Currency } from "@/types/invoice";

const CURRENCY_LOCALE: Record<Currency, string> = {
  NGN: "en-NG",
  USD: "en-US",
};

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

export function sumByCurrency(
  amounts: { amount: number; currency: Currency }[]
): Partial<Record<Currency, number>> {
  const totals: Partial<Record<Currency, number>> = {};
  for (const { amount, currency } of amounts) {
    totals[currency] = (totals[currency] ?? 0) + amount;
  }
  return totals;
}

/** Renders each currency's total separately, e.g. "₦620,000 + $1,400", instead of blending them at a conversion rate. */
export function formatMoneyByCurrency(totals: Partial<Record<Currency, number>>): string {
  const entries = (Object.entries(totals) as [Currency, number][]).filter(
    ([, amount]) => amount !== 0
  );
  if (entries.length === 0) return formatMoney(0, "NGN");
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Fixed "today" for this demo dataset. In the real app this comes from the
 * server clock — hardcoding it here keeps aging/overdue math consistent
 * with the mock invoices regardless of when this page is viewed.
 */
export const TODAY = "2024-11-12";

export function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const diff = daysBetween(dueDate, TODAY);
  return Math.max(0, diff);
}
