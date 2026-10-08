import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";

/** Naira first, then the other currencies alphabetically. */
export function byCurrency(totals: Map<string, number>): [string, number][] {
  return [...totals.entries()].sort(([a], [b]) => (a === "NGN" ? -1 : b === "NGN" ? 1 : a.localeCompare(b)));
}

/**
 * A headline money figure that may span currencies (never converted). The
 * main currency is the big number; any others sit under it as small tags,
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
  /** Classes for the big number (its size and spacing). */
  className?: string;
}) {
  const entries = byCurrency(totals);
  const big = cn("truncate text-2xl font-semibold tracking-tight tabular-nums", className);
  if (!entries.length) return <p className={big}>{empty}</p>;

  const [[mainCurrency, mainMinor], ...others] = entries;
  const all = entries.map(([c, m]) => formatMinor(m, c)).join(" and ");
  return (
    <div className="min-w-0" title={all}>
      <p className={big}>{formatMinor(mainMinor, mainCurrency)}</p>
      {others.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1" aria-label="In other currencies">
          {others.map(([currency, minor]) => (
            <li key={currency} className="inline-flex items-baseline gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground/80">
              {formatMinor(minor, currency)}
              <span className="text-[10px] font-normal text-muted-foreground">{currency}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
