import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowBucket } from "@/types/analytics";
import { Currency } from "@/types/invoice";
import { formatMoney } from "@/lib/format";
import { LuTrendingUp } from "react-icons/lu";

interface CashFlowForecastCardProps {
  buckets: CashFlowBucket[];
}

function groupByCurrency(buckets: CashFlowBucket[]): Record<Currency, CashFlowBucket[]> {
  const grouped: Record<Currency, CashFlowBucket[]> = { NGN: [], USD: [] };
  for (const bucket of buckets) {
    grouped[bucket.currency].push(bucket);
  }
  return grouped;
}

export function CashFlowForecastCard({ buckets }: CashFlowForecastCardProps) {
  const grouped = groupByCurrency(buckets);
  const currencies = (Object.keys(grouped) as Currency[]).filter(
    (c) => grouped[c].length > 0 && grouped[c].some((b) => b.expected > 0)
  );

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5">
          <LuTrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Expected cash flow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {currencies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices expected to settle soon.</p>
        ) : (
          currencies.map((currency) => (
            <div key={currency}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{currency}</p>
              {/* one row of buckets: the card sits full width under the revenue trend */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {grouped[currency].map((bucket) => (
                  <div key={bucket.label} className="rounded-md bg-muted px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">{bucket.label}</p>
                    <p className="mt-1 text-base font-medium text-foreground tabular-nums">
                      {bucket.expected === 0 ? "—" : formatMoney(bucket.expected, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bucket.invoiceCount === 0
                        ? "No invoices due"
                        : `${bucket.invoiceCount} invoice${bucket.invoiceCount === 1 ? "" : "s"}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <p className="text-xs text-muted-foreground pt-1">
          Based on due dates of currently sent and partially paid invoices — not a guarantee.
        </p>
      </CardContent>
    </Card>
  );
}
