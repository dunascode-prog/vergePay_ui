import { Card, CardContent } from "@/components/ui/card";
import { RecurringPlan, RecurringFrequency } from "@/types/recurring";
import { Currency } from "@/types/invoice";
import { formatMoneyByCurrency, formatShortDate, sumByCurrency } from "@/lib/format";
import { LuRepeat, LuPause, LuCalendarClock, LuBan } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface RecurringSummaryCardsProps {
  plans: RecurringPlan[];
}

// Converts each plan's billing amount to a monthly-equivalent figure, purely
// for the MRR card — currencies still aren't blended with each other.
const MONTHLY_MULTIPLIER: Record<RecurringFrequency, number> = {
  weekly: 4.33,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

export function RecurringSummaryCards({ plans }: RecurringSummaryCardsProps) {
  const active = plans.filter((p) => p.status === "active");
  const paused = plans.filter((p) => p.status === "paused");
  const cancelled = plans.filter((p) => p.status === "cancelled");

  const mrrByCurrency = sumByCurrency(
    active.map((p) => ({
      amount: p.amount * MONTHLY_MULTIPLIER[p.frequency],
      currency: p.currency,
    }))
  );

  const nextCharge = active
    .filter((p) => p.nextBillingDate)
    .sort((a, b) => (a.nextBillingDate! < b.nextBillingDate! ? -1 : 1))[0];

  const cards = [
    {
      label: "Active plans",
      value: String(active.length),
      sub: `${plans.length} total plans`,
      icon: LuRepeat,
      tone: "text-emerald-600",
    },
    {
      label: "Monthly recurring revenue",
      value: formatMoneyByCurrency(mrrByCurrency),
      sub: "Normalized to a monthly equivalent",
      icon: LuRepeat,
      tone: "text-emerald-600",
    },
    {
      label: "Next charge",
      value: nextCharge ? formatShortDate(nextCharge.nextBillingDate) : "—",
      sub: nextCharge ? nextCharge.client.name : "No active plans",
      icon: LuCalendarClock,
      tone: "text-gray-500",
    },
    {
      label: "Paused / cancelled",
      value: `${paused.length} / ${cancelled.length}`,
      sub: paused.length > 0 ? "Needs a follow-up" : "All plans running",
      icon: paused.length > 0 ? LuPause : LuBan,
      tone: paused.length > 0 ? "text-amber-600" : "text-gray-400",
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
