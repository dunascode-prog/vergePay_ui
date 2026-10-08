import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";

/** Naira first, then the other currencies alphabetically. */
export function byCurrency(totals: Map<string, number>): [string, number][] {
  return [...totals.entries()].sort(([a], [b]) => (a === "NGN" ? -1 : b === "NGN" ? 1 : a.localeCompare(b)));
}

/**
 * A headline money figure that may span currencies (never converted). The
 * main currency is the big number; any others sit quietly under it,
 * instead of one long "₦417,210.42 + $44,400.00".
 */
export function CurrencyAmounts({
  totals,
  empty = "—",
  className,
}: {
  totals: Map<string, number>;
  /** Shown when there's nothing in any currency. */
  empty?: string;
  /** Classes for the big number. */
  className?: string;
}) {
  const entries = byCurrency(totals);
  const big = cn("truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl", className);
  if (!entries.length) return <p className={big}>{empty}</p>;

  const [[mainCurrency, mainMinor], ...others] = entries;
  const all = entries.map(([c, m]) => formatMinor(m, c)).join(" and ");
  return (
    <div className="min-w-0" title={all}>
      <p className={big}>{formatMinor(mainMinor, mainCurrency)}</p>
      {others.length > 0 && (
        <p className="mt-0.5 truncate text-sm text-muted-foreground tabular-nums">
          {others.map(([currency, minor]) => formatMinor(minor, currency)).join(" · ")}
        </p>
      )}
    </div>
  );
}
