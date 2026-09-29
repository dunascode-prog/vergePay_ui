"use server";

import { revalidatePath } from "next/cache";
import { createExpense, deleteExpense, CreateExpenseInput } from "@/data/mock-expenses";
import { Expense } from "@/types/expense";

export async function createExpenseAction(input: CreateExpenseInput): Promise<Expense> {
  const expense = await createExpense(input);
  revalidatePath("/dashboard/expenses");
  return expense;
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await deleteExpense(id);
  revalidatePath("/dashboard/expenses");
}
