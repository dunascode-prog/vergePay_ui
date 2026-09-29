import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseCategory } from "@/types/analytics";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ExpenseBreakdownCardProps {
  categories: ExpenseCategory[];
}

export function ExpenseBreakdownCard({ categories }: ExpenseBreakdownCardProps) {
  // All mock categories share NGN; group defensively in case a future
  // category is tracked in a different currency.
  const currency = categories[0]?.currency ?? "NGN";
  const total = categories
    .filter((c) => c.currency === currency)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-foreground">Expenses by category</CardTitle>
        <span className="text-sm font-semibold text-foreground">{formatMoney(total, currency)}</span>
      </CardHeader>
      <CardContent>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted mb-4">
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
                <span className="flex items-center gap-2 text-foreground/90">
                  <span className={cn("h-2 w-2 rounded-full", c.colorClass)} />
                  {c.category}
                </span>
                <span className="text-muted-foreground">{formatMoney(c.amount, c.currency)}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
