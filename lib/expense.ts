import { Currency } from "@/types/invoice";

export type ExpenseCategoryName =
  | "Software & tools"
  | "Contractor payouts"
  | "Marketing"
  | "Internet & utilities"
  | "Other";

export type PaymentMethod = "Bank Transfer" | "Card" | "Direct Debit";

export interface Expense {
  id: string;
  date: string; // ISO date
  description: string;
  vendor: string;
  category: ExpenseCategoryName;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  hasReceipt: boolean;
}

export interface CategoryTotal {
  category: ExpenseCategoryName;
  amount: number;
  currency: Currency;
  colorClass: string;
  count: number;
}
