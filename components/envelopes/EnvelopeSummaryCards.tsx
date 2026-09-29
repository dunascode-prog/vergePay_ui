import { Card, CardContent } from "@/components/ui/card";
import { EnvelopeView } from "@/types/envelope";
import { formatMoney } from "@/lib/format";
import { LuLayoutGrid, LuTrendingDown, LuWallet, LuTriangleAlert } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface EnvelopeSummaryCardsProps {
  envelopes: EnvelopeView[];
  availableCash: number;
}

export function EnvelopeSummaryCards({ envelopes, availableCash }: EnvelopeSummaryCardsProps) {
  const totalAllocated = envelopes.filter((e) => e.currency === "NGN").reduce((s, e) => s + e.allocated, 0);
  const totalSpent = envelopes.filter((e) => e.currency === "NGN").reduce((s, e) => s + e.spent, 0);
  const unallocated = availableCash - totalAllocated;
  const overBudget = envelopes.filter((e) => e.isOverBudget);

  const cards = [
    {
      label: "Allocated across envelopes",
      value: formatMoney(totalAllocated, "NGN"),
      sub: `${envelopes.length} envelopes`,
      icon: LuLayoutGrid,
      tone: "text-gray-500",
    },
    {
      label: "Spent this period",
      value: formatMoney(totalSpent, "NGN"),
      sub: "Across all envelopes",
      icon: LuTrendingDown,
      tone: "text-red-500",
    },
    {
      label: "Unallocated cash",
      value: formatMoney(unallocated, "NGN"),
      sub: "Business wallet, not yet assigned",
      icon: LuWallet,
      tone: unallocated >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Over budget",
      value: String(overBudget.length),
      sub: overBudget.length > 0 ? overBudget.map((e) => e.name).join(", ") : "All envelopes within budget",
      icon: LuTriangleAlert,
      tone: overBudget.length > 0 ? "text-red-600" : "text-gray-400",
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
            <p className={cn("text-2xl font-semibold leading-tight", card.value.startsWith("-") ? "text-red-600" : "text-gray-900")}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400 mt-1 truncate" title={card.sub}>
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
