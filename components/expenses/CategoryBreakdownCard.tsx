import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import { deriveCategoryTotals } from "@/lib/expense-category";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CategoryBreakdownCardProps {
  expenses: Expense[];
}

export function CategoryBreakdownCard({
  expenses,
}: CategoryBreakdownCardProps) {
  const categories = deriveCategoryTotals(expenses).sort(
    (a, b) => b.amount - a.amount,
  );
  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="lg:col-span-6 border-gray-200 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700">
          By category
        </CardTitle>
        <span className="text-sm font-semibold text-gray-900">
          {formatMoney(total, "NGN")}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 mb-4">
          {categories.map((c) => (
            <div
              key={c.category}
              className={cn("h-full", c.colorClass)}
              style={{ width: `${(c.amount / total) * 100}%` }}
              title={c.category}
            />
          ))}
        </div>
        <div className="space-y-2.5">
          {categories.map((c) => (
            <div
              key={c.category}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <span className={cn("h-2 w-2 rounded-full", c.colorClass)} />
                {c.category}
                <span className="text-gray-400 text-xs">({c.count})</span>
              </span>
              <span className="text-gray-500">
                {formatMoney(c.amount, c.currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
