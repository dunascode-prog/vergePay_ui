import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";
import { formatDay } from "@/lib/invoicing";
import { monthlyRecurring } from "@/lib/recurring";
import { activePlansAt, balanceTrend, mainCurrency, pausedPlansAt, recurringAt } from "@/lib/trends";
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
  const trends = {
    mrr: balanceTrend(recurringAt(plans, mainCurrency(mrr)), "up"),
    active: balanceTrend(activePlansAt(plans), "up"),
    paused: balanceTrend(pausedPlansAt(plans), "down"),
  };

  return (
    <StatGrid>
      <StatCard label="Monthly recurring revenue" trend={trends.mrr} value={<CurrencyAmounts totals={mrr} />} />
      <StatCard
        label="Active plans"
        trend={trends.active}
        value={String(active.length)}
        hint={failing ? `${failing} couldn't send its last invoice` : null}
        tone="warn"
      />
      <StatCard label="Next invoice" value={next ? formatDay(next.next_billing_date!, false) : "—"} hint={next?.client.name ?? null} />
      <StatCard label="Paused" trend={trends.paused} value={String(paused.length)} />
    </StatGrid>
  );
}
