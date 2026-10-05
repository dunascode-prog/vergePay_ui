import { ArrowDownLeft, ArrowUpRight, HandCoins, Scale } from "lucide-react";
import { moneyByCurrency } from "@/lib/invoicing";
import { YearTotals } from "@/lib/business";

/** Four headline numbers for the year so far, per currency (never converted). */
export function FinancialSummaryCards({
  totals,
  owed,
  overdue,
}: {
  totals: YearTotals;
  owed: Map<string, number>;
  overdue: Map<string, number>;
}) {
  const shown = (m: Map<string, number>) => (m.size ? moneyByCurrency(m) : "—");
  const loss = [...totals.net.values()].some((v) => v < 0);

  const tiles = [
    { label: "Revenue this year", value: shown(totals.revenue), sub: "Paid to you since 1 January", icon: ArrowDownLeft },
    { label: "Money out this year", value: shown(totals.moneyOut), sub: "Payments, transfers out and fees", icon: ArrowUpRight },
    {
      label: "Net this year",
      value: shown(totals.net),
      sub: loss ? "More went out than came in" : "Revenue minus money out",
      icon: Scale,
      warn: loss,
    },
    {
      label: "Owed to you",
      value: shown(owed),
      sub: overdue.size ? `${moneyByCurrency(overdue)} of it overdue` : owed.size ? "Nothing overdue" : "No unpaid invoices",
      icon: HandCoins,
      warn: overdue.size > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <t.icon className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight tabular-nums" title={t.value}>
            {t.value}
          </p>
          <p className={t.warn ? "mt-0.5 truncate text-xs text-amber-700 dark:text-amber-300" : "mt-0.5 truncate text-xs text-muted-foreground"} title={t.sub}>
            {t.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
