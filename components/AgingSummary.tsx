import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice, Currency } from "@/types/invoice";
import { daysOverdue, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Bucket {
  label: string;
  amount: number;
  count: number;
  colorClass: string;
}

function bucketizeForCurrency(invoices: Invoice[], currency: Currency): Bucket[] {
  const buckets: Bucket[] = [
    { label: "Not yet due", amount: 0, count: 0, colorClass: "bg-emerald-500" },
    { label: "1–15 days", amount: 0, count: 0, colorClass: "bg-amber-400" },
    { label: "16–30 days", amount: 0, count: 0, colorClass: "bg-orange-500" },
    { label: "30+ days", amount: 0, count: 0, colorClass: "bg-red-600" },
  ];

  for (const inv of invoices) {
    if (inv.currency !== currency) continue;
    const remaining = inv.amount - inv.amountPaid;
    const overdue = daysOverdue(inv.dueDate);

    if (inv.status !== "overdue" && overdue === 0) {
      buckets[0].amount += remaining;
      buckets[0].count += 1;
    } else if (overdue <= 15) {
      buckets[1].amount += remaining;
      buckets[1].count += 1;
    } else if (overdue <= 30) {
      buckets[2].amount += remaining;
      buckets[2].count += 1;
    } else {
      buckets[3].amount += remaining;
      buckets[3].count += 1;
    }
  }

  return buckets;
}

function CurrencyAgingBar({ currency, buckets }: { currency: Currency; buckets: Bucket[] }) {
  const total = buckets.reduce((sum, b) => sum + b.amount, 0);
  if (total === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{currency}</p>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {buckets.map((b) =>
          b.amount > 0 ? (
            <div
              key={b.label}
              className={cn("h-full", b.colorClass)}
              style={{ width: `${(b.amount / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-start gap-2">
            <span className={cn("h-2 w-2 rounded-full mt-1", b.colorClass)} />
            <div>
              <p className="text-xs text-gray-400">{b.label}</p>
              <p className="text-sm font-medium text-gray-900">
                {formatMoney(b.amount, currency)}
                <span className="text-gray-400 font-normal ml-1">· {b.count}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgingSummary({ invoices }: { invoices: Invoice[] }) {
  const outstanding = invoices.filter(
    (i) => i.status === "sent" || i.status === "partial" || i.status === "overdue"
  );
  const currenciesPresent = Array.from(new Set(outstanding.map((i) => i.currency)));

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          Outstanding by age
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {currenciesPresent.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Nothing outstanding right now.</p>
        ) : (
          currenciesPresent.map((currency) => (
            <CurrencyAgingBar
              key={currency}
              currency={currency}
              buckets={bucketizeForCurrency(outstanding, currency)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
