import { Goal } from "@/types/goal";
import { computeGoalPace } from "@/lib/goal-pace";
import { formatMoney, formatShortDate } from "@/lib/format";
import { LuSparkles } from "react-icons/lu";

interface AIGoalsInsightBannerProps {
  goals: Goal[];
}

function buildInsight(goals: Goal[]): string {
  const parts: string[] = [];

  for (const goal of goals) {
    const pace = computeGoalPace(goal);
    if (pace.isComplete) {
      parts.push(`${goal.name} is fully funded.`);
      continue;
    }
    if (!pace.isOnTrack && pace.avgMonthlyContribution > 0) {
      parts.push(
        `At the current pace, ${goal.name} won't be reached until around ${formatShortDate(
          pace.projectedCompletionDate
        )} — after its ${formatShortDate(goal.deadline)} deadline. Contributing ${formatMoney(
          Math.ceil((goal.target - goal.current) / 3),
          goal.currency
        )}/month for the next 3 months would close the gap.`
      );
    }
  }

  const onTrackCount = goals.filter((g) => {
    const pace = computeGoalPace(g);
    return pace.isOnTrack || pace.isComplete;
  }).length;

  if (parts.length === 0) {
    parts.push(`All ${onTrackCount} goals are on track to be reached by their deadlines.`);
  }

  return parts.join(" ");
}

export function AIGoalsInsightBanner({ goals }: AIGoalsInsightBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
      <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-0.5">
          AI goals insight
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">{buildInsight(goals)}</p>
      </div>
    </div>
  );
}
