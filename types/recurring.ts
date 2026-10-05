import { AccountPurpose } from "@/types/account";
import { Client, Currency } from "@/types/invoice";
import { ApiInvoice } from "@/types/invoicing";

export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export type RecurringStatus = "active" | "paused" | "cancelled";

// The business overview page's sample data (data/mock-recurring.ts).
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

// ---- the API: /v1/recurring-plans

export interface ApiRecurringPlan {
  plan_id: string;
  plan_status: RecurringStatus;
  description: string;
  amount_minor: number;
  currency_code: string;
  notes: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  /** null once cancelled */
  next_billing_date: string | null;
  /** each invoice is due this many days after it's sent */
  days_until_due: number;
  send_email: boolean;
  issuer_account_id: string;
  issuer_account_number: string;
  issuer_account_purpose: AccountPurpose;
  client: { client_id: string; name: string; email: string | null };
  invoices_generated: number;
  last_invoice_at: string | null;
  /** why the last billing attempt failed; cleared by the next invoice sent */
  last_error: string | null;
  last_error_at: string | null;
  paused_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  /** on create, get and every change: the invoices it sent, newest first */
  invoices?: Omit<ApiInvoice, "items">[];
}

export interface NewRecurringPlan {
  issuer_account_id: string;
  client_id: string;
  description: string;
  amount_minor: number;
  frequency: RecurringFrequency;
  start_date: string;
  days_until_due?: number;
  send_email?: boolean;
  notes?: string;
}

export type RecurringPlanChanges = Partial<Pick<ApiRecurringPlan, "description" | "amount_minor" | "days_until_due" | "send_email">> & {
  notes?: string | null;
};
