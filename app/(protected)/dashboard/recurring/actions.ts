"use server";

import { revalidatePath } from "next/cache";
import {
  setPlanStatus,
  createRecurringPlan,
  CreateRecurringPlanInput,
} from "@/data/mock-recurring";
import { RecurringPlan } from "@/types/recurring";

export async function pausePlan(id: string): Promise<void> {
  await setPlanStatus(id, "paused");
  revalidatePath("/recurring");
  revalidatePath(`/recurring/${id}`);
}

export async function resumePlan(id: string): Promise<void> {
  await setPlanStatus(id, "active");
  revalidatePath("/recurring");
  revalidatePath(`/recurring/${id}`);
}

export async function cancelPlan(id: string): Promise<void> {
  await setPlanStatus(id, "cancelled");
  revalidatePath("/recurring");
  revalidatePath(`/recurring/${id}`);
}

export async function createPlan(input: CreateRecurringPlanInput): Promise<RecurringPlan> {
  const plan = await createRecurringPlan(input);
  revalidatePath("/recurring");
  return plan;
}
