import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@/types/goal";
import { computeGoalPace } from "@/lib/goal-pace";
import { formatMoneyByCurrency, formatShortDate, sumByCurrency } from "@/lib/format";
import { LuTarget, LuPiggyBank, LuCalendarClock, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface GoalSummaryCardsProps {
  goals: Goal[];
}

export function GoalSummaryCards({ goals }: GoalSummaryCardsProps) {
  const totalSaved = sumByCurrency(goals.map((g) => ({ amount: g.current, currency: g.currency })));
  const totalTarget = sumByCurrency(goals.map((g) => ({ amount: g.target, currency: g.currency })));

  const paces = goals.map((g) => ({ goal: g, pace: computeGoalPace(g) }));
  const behindPace = paces.filter((p) => !p.pace.isComplete && !p.pace.isOnTrack);

  const nearestDeadline = [...goals]
    .filter((g) => g.current < g.target)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))[0];

  const cards = [
    {
      label: "Active goals",
      value: String(goals.length),
      sub: `Targeting ${formatMoneyByCurrency(totalTarget)}`,
      icon: LuTarget,
      tone: "text-gray-500",
    },
    {
      label: "Total saved",
      value: formatMoneyByCurrency(totalSaved),
      sub: "Across all goals",
      icon: LuPiggyBank,
      tone: "text-emerald-600",
    },
    {
      label: "Nearest deadline",
      value: nearestDeadline ? formatShortDate(nearestDeadline.deadline) : "—",
      sub: nearestDeadline ? nearestDeadline.name : "All goals complete",
      icon: LuCalendarClock,
      tone: "text-gray-500",
    },
    {
      label: "On track",
      value: `${goals.length - behindPace.length}/${goals.length}`,
      sub: behindPace.length > 0 ? `${behindPace.length} behind pace` : "All goals on pace",
      icon: LuCircleCheck,
      tone: behindPace.length > 0 ? "text-amber-600" : "text-emerald-600",
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
            <p className="text-2xl font-semibold text-gray-900 leading-tight truncate" title={card.value}>
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
