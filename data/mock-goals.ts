import { Goal, GoalContribution } from "@/types/goal";

// Emergency Fund and MacBook goals use the exact same target/current/deadline
// already shown (read-only) on Analytics and Business Overview — this page
// is where those become actionable, not a third place restating the same
// numbers differently.
const GOALS: Goal[] = [
  {
    id: "goal_emergency",
    name: "Emergency fund (3 months expenses)",
    category: "Emergency Fund",
    target: 900000,
    current: 540000,
    currency: "NGN",
    deadline: "2025-03-01",
    createdDate: "2024-06-01",
  },
  {
    id: "goal_equipment",
    name: "New MacBook for client work",
    category: "Equipment",
    target: 1600,
    current: 620,
    currency: "USD",
    deadline: "2025-01-15",
    createdDate: "2024-08-01",
  },
  {
    id: "goal_treasury",
    name: "Nigerian Treasury Bills investment",
    category: "Investment",
    target: 500000,
    current: 120000,
    currency: "NGN",
    deadline: "2025-06-01",
    createdDate: "2024-09-15",
  },
];

const CONTRIBUTIONS: GoalContribution[] = [
  { id: "contrib_001", goalId: "goal_emergency", date: "2024-07-10", amount: 50000, currency: "NGN" },
  { id: "contrib_002", goalId: "goal_emergency", date: "2024-08-12", amount: 150000, currency: "NGN" },
  { id: "contrib_003", goalId: "goal_emergency", date: "2024-09-14", amount: 140000, currency: "NGN" },
  { id: "contrib_004", goalId: "goal_emergency", date: "2024-10-11", amount: 100000, currency: "NGN" },
  { id: "contrib_005", goalId: "goal_emergency", date: "2024-11-08", amount: 100000, currency: "NGN" },

  { id: "contrib_006", goalId: "goal_equipment", date: "2024-09-05", amount: 200, currency: "USD" },
  { id: "contrib_007", goalId: "goal_equipment", date: "2024-10-05", amount: 220, currency: "USD" },
  { id: "contrib_008", goalId: "goal_equipment", date: "2024-11-05", amount: 200, currency: "USD" },

  { id: "contrib_009", goalId: "goal_treasury", date: "2024-10-01", amount: 60000, currency: "NGN" },
  { id: "contrib_010", goalId: "goal_treasury", date: "2024-11-01", amount: 60000, currency: "NGN" },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getGoals(): Promise<Goal[]> {
  await delay(500);
  return GOALS;
}

export async function getContributions(): Promise<GoalContribution[]> {
  await delay(400);
  return [...CONTRIBUTIONS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface CreateGoalInput {
  name: string;
  category: Goal["category"];
  target: number;
  currency: Goal["currency"];
  deadline: string;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  await delay(500);
  const goal: Goal = {
    id: `goal_${Math.random().toString(36).slice(2, 9)}`,
    current: 0,
    createdDate: new Date().toISOString().slice(0, 10),
    ...input,
  };
  GOALS.push(goal);
  return goal;
}

export async function addContribution(
  goalId: string,
  amount: number
): Promise<{ goal: Goal; contribution: GoalContribution }> {
  await delay(400);
  const goal = GOALS.find((g) => g.id === goalId);
  if (!goal) throw new Error(`Unknown goal: ${goalId}`);

  goal.current += amount;

  const contribution: GoalContribution = {
    id: `contrib_${Math.random().toString(36).slice(2, 9)}`,
    goalId,
    date: new Date().toISOString().slice(0, 10),
    amount,
    currency: goal.currency,
  };
  CONTRIBUTIONS.unshift(contribution);

  return { goal, contribution };
}
