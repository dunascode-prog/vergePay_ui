"use server";

import { revalidatePath } from "next/cache";
import {
  createPayee,
  recordPayrollPayment,
  attachLinkedExpense,
  CreatePayeeInput,
} from "@/data/mock-payroll";
import { createExpense } from "@/data/mock-expenses";
import { Payee, PayrollPayment } from "@/types/payroll";

export async function createPayeeAction(input: CreatePayeeInput): Promise<Payee> {
  const payee = await createPayee(input);
  revalidatePath("/payroll");
  return payee;
}

/**
 * The real "connecting components" moment on this page: running payroll
 * doesn't just record a payroll-only entry — it also creates a matching
 * Expense (category "Contractor payouts"), the same way Ngozi/Chidi/Kunle's
 * historical payments already exist as real expense line items. Payroll and
 * Expenses end up looking at the same underlying event, not two separate
 * records that can drift apart.
 */
export async function runPayrollAction(
  payeeId: string,
  grossAmount: number
): Promise<{ payment: PayrollPayment; updatedPayee: Payee }> {
  const { payment, payee } = await recordPayrollPayment(payeeId, grossAmount);

  const expense = await createExpense({
    description: `Payroll — ${payee.role}`,
    vendor: payee.name,
    category: "Contractor payouts",
    amount: grossAmount,
    currency: payee.currency,
    paymentMethod: "Bank Transfer",
    isRecurring: payee.frequency === "Monthly",
    date: payment.date,
  });

  await attachLinkedExpense(payment.id, expense.id);
  payment.linkedExpenseId = expense.id;

  revalidatePath("/payroll");
  revalidatePath("/expenses");

  return { payment, updatedPayee: payee };
}
