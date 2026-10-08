import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";
import { YearTotals } from "@/lib/business";
import { moneyByCurrency } from "@/lib/invoicing";
import { Trend } from "@/lib/trends";

/** Four headline numbers for the year so far, per currency (never converted). */
export function FinancialSummaryCards({
  totals,
  owed,
  overdue,
  trends,
}: {
  totals: YearTotals;
  owed: Map<string, number>;
  overdue: Map<string, number>;
  trends?: { revenue: Trend | null; moneyOut: Trend | null; owed: Trend | null };
}) {
  const loss = [...totals.net.values()].some((v) => v < 0);

  return (
    <StatGrid>
      <StatCard label="Revenue this year" trend={trends?.revenue} value={<CurrencyAmounts totals={totals.revenue} />} />
      <StatCard label="Money out this year" trend={trends?.moneyOut} value={<CurrencyAmounts totals={totals.moneyOut} />} />
      <StatCard
        label="Net this year"
        value={<CurrencyAmounts totals={totals.net} />}
        hint={loss ? "More went out than came in" : null}
        tone="warn"
      />
      <StatCard
        label="Owed to you"
        trend={trends?.owed}
        value={<CurrencyAmounts totals={owed} />}
        hint={overdue.size ? `${moneyByCurrency(overdue)} overdue` : null}
        tone="warn"
      />
    </StatGrid>
  );
}
