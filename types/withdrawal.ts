// Shapes from the API's withdrawals to bank accounts. Money is in minor units.

/** GET /v1/banks → data[] */
export interface Bank {
  code: string;
  name: string;
}

/** GET /v1/bank-accounts/resolve: Flutterwave's name enquiry. */
export interface ResolvedBankAccount {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

/** GET /v1/bank-accounts → data[] */
export interface SavedBankAccount extends ResolvedBankAccount {
  bank_account_id: string;
  currency_code: string;
  created_at: string;
}

/** GET /v1/withdrawals/quote */
export interface WithdrawalQuote {
  currency_code: string;
  amount_minor: number;
  /** The customer's half of Flutterwave's fee. */
  fee_minor: number;
  vergepay_covers_minor: number;
  total_debit_minor: number;
  min_amount_minor: number;
  daily_limit_minor: number;
  daily_remaining_minor: number;
}

export type WithdrawalStatus = "pending" | "successful" | "failed";

/** POST/GET /v1/withdrawals */
export interface Withdrawal {
  withdrawal_id: string;
  account_id: string;
  bank_account_id: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  currency_code: string;
  amount_minor: number;
  fee_minor: number;
  total_debited_minor: number;
  narration: string | null;
  status: WithdrawalStatus;
  reference: string;
  failure_reason: string | null;
  created_at: string;
  completed_at: string | null;
}
