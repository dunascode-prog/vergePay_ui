import { Card, CardContent } from "@/components/ui/card";
import { CurrencyAmount } from "@/types/business";
import { formatMoneyByCurrency, sumByCurrency } from "@/lib/format";
import { LuTrendingUp, LuTrendingDown, LuWallet, LuScale } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface FinancialSummaryCardsProps {
  revenue: CurrencyAmount[];
  expenses: CurrencyAmount[];
  cash: CurrencyAmount[];
}

function subtractByCurrency(a: CurrencyAmount[], b: CurrencyAmount[]): CurrencyAmount[] {
  const aTotals = sumByCurrency(a);
  const bTotals = sumByCurrency(b);
  const currencies = new Set([...Object.keys(aTotals), ...Object.keys(bTotals)]);
  return Array.from(currencies).map((currency) => ({
    currency: currency as CurrencyAmount["currency"],
    amount: (aTotals[currency as keyof typeof aTotals] ?? 0) - (bTotals[currency as keyof typeof bTotals] ?? 0),
  }));
}

export function FinancialSummaryCards({ revenue, expenses, cash }: FinancialSummaryCardsProps) {
  const netProfit = subtractByCurrency(revenue, expenses);

  const cards = [
    {
      label: "Revenue (YTD)",
      value: formatMoneyByCurrency(sumByCurrency(revenue)),
      sub: "All clients, all invoices",
      icon: LuTrendingUp,
      tone: "text-emerald-600",
    },
    {
      label: "Expenses (YTD)",
      value: formatMoneyByCurrency(sumByCurrency(expenses)),
      sub: "Software, contractors, marketing & more",
      icon: LuTrendingDown,
      tone: "text-red-500",
    },
    {
      label: "Net profit (YTD)",
      value: formatMoneyByCurrency(sumByCurrency(netProfit)),
      sub: "Revenue minus expenses",
      icon: LuScale,
      tone: "text-emerald-600",
    },
    {
      label: "Cash position",
      value: formatMoneyByCurrency(sumByCurrency(cash)),
      sub: "Personal + Business wallets",
      icon: LuWallet,
      tone: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {card.label}
              </p>
              <card.icon className={cn("h-4 w-4", card.tone)} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 leading-tight">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
