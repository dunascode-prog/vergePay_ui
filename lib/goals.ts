import { daysUntil, isoDay } from "@/lib/invoicing";
import { Goal, GoalCategory } from "@/types/goal";

// Pure helpers for the goals screens: wording, and whether a goal is on pace.

export const GOAL_CATEGORIES: GoalCategory[] = ["emergency_fund", "equipment", "investment", "other"];

export const GOAL_CATEGORY_LABEL: Record<GoalCategory, string> = {
  emergency_fund: "Emergency fund",
  equipment: "Equipment",
  investment: "Investment",
  other: "Other",
};

export const MAX_ACTIVE_GOALS = 20;

export type GoalPace = "funded" | "on_track" | "behind" | "past_date";

export const PACE_LABEL: Record<GoalPace, string> = {
  funded: "Funded",
  on_track: "On track",
  behind: "Behind pace",
  past_date: "Past its date",
};

const dayNumber = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/**
 * Where a goal stands against a straight line from the day it was made
 * (nothing saved) to its target date (fully saved). Within 5% of the target
 * of that line counts as on track, so a goal isn't "behind" by a few naira.
 */
export function goalPace(goal: Goal, today = isoDay()): GoalPace {
  if (goal.is_funded) return "funded";
  if (daysUntil(goal.target_date) < 0) return "past_date";
  const start = dayNumber(goal.created_at.slice(0, 10) <= today ? goal.created_at : today);
  const span = dayNumber(goal.target_date) - start;
  if (span <= 0) return "behind";
  const elapsed = Math.min(1, Math.max(0, (dayNumber(today) - start) / span));
  const expected = goal.target_minor * elapsed;
  return goal.saved_minor >= expected - goal.target_minor * 0.05 ? "on_track" : "behind";
}

/** Whole months from today to the target date, at least 1. */
export function monthsLeft(goal: Pick<Goal, "target_date">): number {
  return Math.max(1, Math.ceil(daysUntil(goal.target_date) / 30.44));
}

/** What to put in each month from now to reach the target on time. */
export function monthlyNeeded(goal: Goal): number {
  if (goal.is_funded) return 0;
  return Math.ceil(goal.remaining_minor / monthsLeft(goal));
}

/** "in 8 months", "in 12 days", "today", "3 days ago". */
export function timeLeft(targetDate: string): string {
  const days = daysUntil(targetDate);
  if (days === 0) return "today";
  if (days < 0) return days === -1 ? "yesterday" : `${-days} days ago`;
  if (days < 60) return days === 1 ? "tomorrow" : `in ${days} days`;
  const months = Math.round(days / 30.44);
  return months < 24 ? `in ${months} months` : `in ${Math.round(months / 12)} years`;
}

/** Saved across goals, per currency. */
export function savedByCurrency(goals: Goal[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const g of goals) totals.set(g.currency_code, (totals.get(g.currency_code) ?? 0) + g.saved_minor);
  return totals;
}
