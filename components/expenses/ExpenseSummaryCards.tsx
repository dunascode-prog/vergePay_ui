import { Card, CardContent } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { deriveCategoryTotals } from "@/lib/expense-category";
import { formatMoney } from "@/lib/format";
import { LuTrendingDown, LuTag, LuRepeat, LuReceipt } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ExpenseSummaryCardsProps {
  expenses: Expense[];
}

export function ExpenseSummaryCards({ expenses }: ExpenseSummaryCardsProps) {
  const ngnExpenses = expenses.filter((e) => e.currency === "NGN");
  const total = ngnExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = deriveCategoryTotals(expenses);
  const largest = [...categoryTotals].sort((a, b) => b.amount - a.amount)[0];

  const recurring = expenses.filter((e) => e.isRecurring);
  const recurringTotal = recurring
    .filter((e) => e.currency === "NGN")
    .reduce((sum, e) => sum + e.amount, 0);

  const cards = [
    {
      label: "Total expenses",
      value: formatMoney(total, "NGN"),
      sub: `${expenses.length} expenses logged`,
      icon: LuTrendingDown,
      tone: "text-red-500",
    },
    {
      label: "Largest category",
      value: largest ? largest.category : "—",
      sub: largest ? formatMoney(largest.amount, largest.currency) : "No expenses yet",
      icon: LuTag,
      tone: "text-amber-600",
    },
    {
      label: "Recurring costs",
      value: formatMoney(recurringTotal, "NGN"),
      sub: `${recurring.length} recurring subscription${recurring.length === 1 ? "" : "s"}`,
      icon: LuRepeat,
      tone: "text-blue-600",
    },
    {
      label: "Missing receipts",
      value: String(expenses.filter((e) => !e.hasReceipt).length),
      sub: "Worth attaching before tax season",
      icon: LuReceipt,
      tone: expenses.filter((e) => !e.hasReceipt).length > 0 ? "text-amber-600" : "text-gray-400",
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
            <p className="text-2xl font-semibold text-gray-900 leading-tight truncate" title={card.value}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
