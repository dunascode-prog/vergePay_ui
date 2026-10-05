import { CalendarClock, Pause, Repeat, TrendingUp } from "lucide-react";
import { formatDay, moneyByCurrency } from "@/lib/invoicing";
import { monthlyRecurring } from "@/lib/recurring";
import { ApiRecurringPlan } from "@/types/recurring";

/** Four headline numbers over the customer's plans. */
export function RecurringSummaryCards({ plans }: { plans: ApiRecurringPlan[] }) {
  const active = plans.filter((p) => p.plan_status === "active");
  const paused = plans.filter((p) => p.plan_status === "paused");
  const mrr = monthlyRecurring(plans);
  const next = active
    .filter((p) => p.next_billing_date)
    .sort((a, b) => (a.next_billing_date! < b.next_billing_date! ? -1 : 1))[0];
  const failing = active.filter((p) => p.last_error).length;

  const tiles = [
    { label: "Monthly recurring revenue", value: mrr.size ? moneyByCurrency(mrr) : "—", sub: "Active plans, as a monthly figure", icon: TrendingUp },
    { label: "Active plans", value: String(active.length), sub: failing ? `${failing} couldn't send its last invoice` : `${plans.length} in all`, icon: Repeat, warn: failing > 0 },
    { label: "Next invoice", value: next ? formatDay(next.next_billing_date!, false) : "—", sub: next ? next.client.name : "No active plans", icon: CalendarClock },
    { label: "Paused", value: String(paused.length), sub: paused.length ? "Not billing until you resume" : "None paused", icon: Pause },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <t.icon className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-1.5 text-xl font-semibold tracking-tight tabular-nums">{t.value}</p>
          <p className={t.warn ? "mt-0.5 text-xs text-amber-700 dark:text-amber-300" : "mt-0.5 truncate text-xs text-muted-foreground"}>{t.sub}</p>
        </div>
      ))}
    </div>
  );
}
