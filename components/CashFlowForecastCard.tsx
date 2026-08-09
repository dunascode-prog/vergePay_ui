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
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <LuTrendingUp className="h-4 w-4 text-emerald-600" />
          Expected cash flow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {currencies.length === 0 ? (
          <p className="text-sm text-gray-400">No invoices expected to settle soon.</p>
        ) : (
          currencies.map((currency) => (
            <div key={currency}>
              <p className="text-xs font-medium text-gray-500 mb-2">{currency}</p>
              <div className="space-y-2">
                {grouped[currency].map((bucket) => (
                  <div
                    key={bucket.label}
                    className="flex items-center justify-between text-sm rounded-md bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-gray-700">{bucket.label}</p>
                      <p className="text-xs text-gray-400">
                        {bucket.invoiceCount === 0
                          ? "No invoices due"
                          : `${bucket.invoiceCount} invoice${bucket.invoiceCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {bucket.expected === 0 ? "—" : formatMoney(bucket.expected, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <p className="text-xs text-gray-400 pt-1">
          Based on due dates of currently sent and partially paid invoices — not a guarantee.
        </p>
      </CardContent>
    </Card>
  );
}
