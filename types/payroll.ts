import { Currency } from "@/types/invoice";

export type PayType = "Retainer" | "Per-project" | "Hourly";
export type PayFrequency = "Monthly" | "Biweekly" | "One-off";
export type PayeeStatus = "active" | "inactive";

export interface Payee {
  id: string;
  name: string;
  initials: string;
  role: string;
  payType: PayType;
  frequency: PayFrequency;
  rate: number;
  currency: Currency;
  status: PayeeStatus;
  bankName: string;
  accountNumberMasked: string;
  startDate: string; // ISO date
  lastPaidDate: string | null;
  lastPaidAmount: number | null;
}

export interface PayrollPayment {
  id: string;
  payeeId: string;
  date: string; // ISO date
  grossAmount: number;
  payeDeduction: number;
  pensionDeduction: number;
  netAmount: number;
  currency: Currency;
  /** Set when this payment also exists as a line item on the Expenses page. */
  linkedExpenseId: string | null;
}
