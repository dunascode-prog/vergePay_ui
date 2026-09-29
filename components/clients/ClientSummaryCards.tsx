import { Card, CardContent } from "@/components/ui/card";
import { ClientProfile } from "@/types/client";
import { formatMoneyByCurrency, sumByCurrency } from "@/lib/format";
import { LuUsers, LuTriangleAlert, LuStar, LuRepeat } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ClientSummaryCardsProps {
  clients: ClientProfile[];
}

export function ClientSummaryCards({ clients }: ClientSummaryCardsProps) {
  const atRisk = clients.filter((c) => c.healthScore < 55);
  const vip = clients.filter((c) => c.isVip);
  const withActivePlan = clients.filter((c) => c.recurringPlanStatus === "active");

  const totalRevenue = sumByCurrency(
    clients.map((c) => ({ amount: c.totalRevenue, currency: c.currency }))
  );

  const cards = [
    {
      label: "Total clients",
      value: String(clients.length),
      sub: `${vip.length} marked VIP`,
      icon: LuUsers,
      tone: "text-gray-500",
    },
    {
      label: "Lifetime revenue",
      value: formatMoneyByCurrency(totalRevenue),
      sub: "Across all clients, all time",
      icon: LuStar,
      tone: "text-emerald-600",
    },
    {
      label: "On active recurring plans",
      value: String(withActivePlan.length),
      sub: `${clients.length - withActivePlan.length} billed per-invoice`,
      icon: LuRepeat,
      tone: "text-emerald-600",
    },
    {
      label: "Need attention",
      value: String(atRisk.length),
      sub: atRisk.length > 0 ? atRisk.map((c) => c.name).join(", ") : "No at-risk clients",
      icon: LuTriangleAlert,
      tone: atRisk.length > 0 ? "text-red-600" : "text-gray-400",
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
            <p className="text-xs text-gray-400 mt-1 truncate" title={card.sub}>
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
