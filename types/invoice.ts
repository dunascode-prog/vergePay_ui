export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "partial";

export type Currency = "NGN" | "USD";

export interface LedgerEntry {
  id: string;
  date: string; // ISO date
  account: string;
  type: "debit" | "credit";
  amount: number;
  memo?: string;
}

export interface PaymentRecord {
  id: string;
  date: string; // ISO date
  amount: number;
  method: string;
  reference: string;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  healthScore: number; // 0-100
  avgCollectionDays: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: Client;
  description: string;
  issuedDate: string | null; // null while still a draft
  dueDate: string | null;
  currency: Currency;
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  isRecurring: boolean;
  /** AI-predicted probability (0-100) of on-time payment. Only meaningful for sent/overdue/partial. */
  paymentProbability?: number;
  ledger: LedgerEntry[];
  payments: PaymentRecord[];
}

export type InvoiceFilter = "all" | InvoiceStatus;
