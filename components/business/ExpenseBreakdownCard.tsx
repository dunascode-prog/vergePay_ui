import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseCategory } from "@/types/business";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ExpenseBreakdownCardProps {
  categories: ExpenseCategory[];
}

export function ExpenseBreakdownCard({ categories }: ExpenseBreakdownCardProps) {
  const currency = categories[0]?.currency ?? "NGN";
  const total = categories
    .filter((c) => c.currency === currency)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700">Expenses by category</CardTitle>
        <span className="text-sm font-semibold text-gray-900">{formatMoney(total, currency)}</span>
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
          {categories
            .slice()
            .sort((a, b) => b.amount - a.amount)
            .map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className={cn("h-2 w-2 rounded-full", c.colorClass)} />
                  {c.category}
                </span>
                <span className="text-gray-500">{formatMoney(c.amount, c.currency)}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
