import { Client, Currency } from "@/types/invoice";

export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export type RecurringStatus = "active" | "paused" | "cancelled";

export interface RecurringPlan {
  id: string;
  client: Client;
  description: string;
  amount: number;
  currency: Currency;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  startDate: string; // ISO date
  nextBillingDate: string | null; // null once cancelled
  invoicesGenerated: number;
  lastInvoiceDate: string | null;
}
