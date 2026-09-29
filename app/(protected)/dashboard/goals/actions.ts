"use server";

import { revalidatePath } from "next/cache";
import {
  createGoal,
  addContribution,
  CreateGoalInput,
} from "@/data/mock-goals";
import { Goal, GoalContribution } from "@/types/goal";

export async function createGoalAction(input: CreateGoalInput): Promise<Goal> {
  const goal = await createGoal(input);
  revalidatePath("/dashboard/goals");
  return goal;
}

export async function addContributionAction(
  goalId: string,
  amount: number
): Promise<{ goal: Goal; contribution: GoalContribution }> {
  const result = await addContribution(goalId, amount);
  revalidatePath("/dashboard/goals");
  return result;
}
