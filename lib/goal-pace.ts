import { Goal } from "@/types/goal";
import { TODAY } from "./format";

function monthsBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  const dayFraction = (to.getDate() - from.getDate()) / 30;
  return Math.max(0.1, months + dayFraction); // avoid division by ~0 for brand-new goals
}

function addMonths(iso: string, months: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + Math.round(months * 30));
  return date.toISOString().slice(0, 10);
}

export interface GoalPace {
  avgMonthlyContribution: number;
  monthsToGo: number;
  projectedCompletionDate: string;
  isOnTrack: boolean;
  isComplete: boolean;
}

/**
 * Projects when a goal will be reached based on its contribution rate so
 * far (current amount / time elapsed since it was created), then compares
 * that projection to the goal's deadline. This is a simple linear
 * extrapolation, not a real forecasting model — it assumes future
 * contributions continue at the same average pace as past ones.
 */
export function computeGoalPace(goal: Goal): GoalPace {
  const isComplete = goal.current >= goal.target;
  if (isComplete) {
    return {
      avgMonthlyContribution: 0,
      monthsToGo: 0,
      projectedCompletionDate: TODAY,
      isOnTrack: true,
      isComplete: true,
    };
  }

  const monthsElapsed = monthsBetween(goal.createdDate, TODAY);
  const avgMonthlyContribution = goal.current / monthsElapsed;
  const remaining = goal.target - goal.current;

  if (avgMonthlyContribution <= 0) {
    return {
      avgMonthlyContribution: 0,
      monthsToGo: Infinity,
      projectedCompletionDate: "",
      isOnTrack: false,
      isComplete: false,
    };
  }

  const monthsToGo = remaining / avgMonthlyContribution;
  const projectedCompletionDate = addMonths(TODAY, monthsToGo);

  return {
    avgMonthlyContribution,
    monthsToGo,
    projectedCompletionDate,
    isOnTrack: projectedCompletionDate <= goal.deadline,
    isComplete: false,
  };
}
