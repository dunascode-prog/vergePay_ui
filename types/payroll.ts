// Shapes from the API's payroll (/v1/payees, /v1/payroll/runs). Money is in
// minor units. Payees are other VergePay customers' wallets.
import { AccountPurpose, AccountStatus } from "@/types/account";

export type PayType = "retainer" | "per_project" | "hourly";
export type PayFrequency = "monthly" | "biweekly" | "one_off";
export type PayeeStatus = "active" | "inactive";

/** GET /v1/payees → data[] */
export interface Payee {
  payee_id: string;
  name: string;
  role: string | null;
  pay_type: PayType;
  frequency: PayFrequency;
  /** The usual amount for one payment. */
  rate_minor: number;
  currency_code: string;
  payee_status: PayeeStatus;
  account_id: string;
  account_number: string;
  /** The wallet holder's name, as a name lookup shows it. */
  account_name: string;
  wallet_status: AccountStatus;
  payment_count: number;
  total_paid_minor: number;
  last_paid_at: string | null;
  last_paid_minor: number | null;
  /** YYYY-MM-DD; null when never paid, or one-off. */
  next_pay_date: string | null;
  /** Active, and never paid or its next date has come. */
  is_due: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayeePayment {
  payment_id: string;
  run_id: string;
  amount_minor: number;
  transaction_id: string;
  currency_code: string;
  note: string | null;
  source_account_id: string;
  source_purpose: AccountPurpose;
  created_at: string;
}

/** GET /v1/payees/:id */
export interface PayeeDetail extends Payee {
  payments: PayeePayment[];
}

export interface NewPayee {
  account_number: string;
  name?: string;
  role?: string;
  pay_type: PayType;
  frequency: PayFrequency;
  rate_minor: number;
}

export type PayeeChanges = Partial<{
  name: string;
  role: string | null;
  pay_type: PayType;
  frequency: PayFrequency;
  rate_minor: number;
  payee_status: PayeeStatus;
}>;

export interface RunPayment {
  payment_id: string;
  payee_id: string;
  payee_name: string;
  amount_minor: number;
  transaction_id: string;
}

/** GET /v1/payroll/runs → data[], and POST's response */
export interface PayrollRun {
  run_id: string;
  source_account_id: string;
  source_purpose: AccountPurpose;
  currency_code: string;
  total_minor: number;
  payment_count: number;
  note: string | null;
  created_at: string;
  payments: RunPayment[];
}

export interface NewRun {
  source_account_id: string;
  items: { payee_id: string; amount_minor?: number }[];
  note?: string;
}
