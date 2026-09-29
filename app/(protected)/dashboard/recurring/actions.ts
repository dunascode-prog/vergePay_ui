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
  revalidatePath("/dashboard/recurring");
  revalidatePath(`/dashboard/recurring/${id}`);
}

export async function resumePlan(id: string): Promise<void> {
  await setPlanStatus(id, "active");
  revalidatePath("/dashboard/recurring");
  revalidatePath(`/dashboard/recurring/${id}`);
}

export async function cancelPlan(id: string): Promise<void> {
  await setPlanStatus(id, "cancelled");
  revalidatePath("/dashboard/recurring");
  revalidatePath(`/dashboard/recurring/${id}`);
}

export async function createPlan(input: CreateRecurringPlanInput): Promise<RecurringPlan> {
  const plan = await createRecurringPlan(input);
  revalidatePath("/dashboard/recurring");
  return plan;
}
