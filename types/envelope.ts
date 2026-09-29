import { Currency } from "@/types/invoice";
import { ExpenseCategoryName } from "@/types/expense";

export interface Envelope {
  id: string;
  name: string;
  allocated: number;
  currency: Currency;
  colorClass: string;
  /**
   * When set, this envelope's "spent" figure is computed live from real
   * Expenses records in that category — not stored here. When null, this is
   * a custom envelope (not tied to expense tracking) and spending is
   * recorded manually via withdrawal transactions.
   */
  linkedCategory: ExpenseCategoryName | null;
  createdDate: string;
}

export type EnvelopeTransactionType = "fund" | "withdraw";

export interface EnvelopeTransaction {
  id: string;
  envelopeId: string;
  date: string;
  type: EnvelopeTransactionType;
  amount: number;
  currency: Currency;
  note: string;
}

/** An envelope enriched with its computed spent/remaining figures for display. */
export interface EnvelopeView extends Envelope {
  spent: number;
  remaining: number;
  isOverBudget: boolean;
}
