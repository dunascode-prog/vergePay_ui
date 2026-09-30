// Shapes returned by the VergePay API's accounts and transactions endpoints.
// Money is always an integer in minor units (kobo, cents).

export type AccountType = "current" | "savings" | "investment_wallet" | "loan_holding";
export type AccountPurpose = "personal" | "business";
export type AccountStatus = "active" | "frozen" | "closed";

/** GET /v1/accounts → data[] */
export interface Account {
  account_id: string;
  account_type: AccountType;
  purpose: AccountPurpose;
  account_number: string;
  currency_code: string;
  balance_minor: number;
  income_minor: number | null;
  total_savings_minor: number | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface OpenAccountRequest {
  account_type: Exclude<AccountType, "loan_holding">;
  currency_code: string;
  purpose: AccountPurpose;
}

export type TransactionType =
  | "transfer"
  | "card_payment"
  | "loan_disbursement"
  | "loan_repayment"
  | "fee"
  | "refund"
  | "invoice_payment"
  | "bank_deposit";

export type TransactionStatus = "pending" | "settled" | "failed" | "reversed";

/** GET /v1/accounts/:id/transactions → data[]: one ledger line on that account. */
export interface AccountTransaction {
  transaction_id: string;
  transaction_type: TransactionType;
  /** credit = money in to this account, debit = money out. */
  direction: "credit" | "debit";
  counterparty_account_id: string | null;
  counterparty_account_number: string | null;
  amount_minor: number;
  currency_code: string;
  status: TransactionStatus;
  description: string | null;
  running_balance_after_minor: number;
  created_at: string;
}

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

/** A ledger line plus the account of yours it belongs to. */
export interface ScopedTransaction extends AccountTransaction {
  account_id: string;
}
