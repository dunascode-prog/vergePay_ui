// Loans as the API returns them (/v1/loans, /v1/loans/applications).
// Money is always an integer in minor units (kobo, cents).

export type LoanType = "personal" | "mortgage" | "cash_advance" | "asset_finance";

export type ApplicationStatus = "pending_review" | "approved" | "rejected";

/** GET /v1/loans/applications → data[], and GET /:id */
export interface LoanApplication {
  application_id: string;
  account_id: string;
  loan_type: LoanType;
  requested_amount_minor: number;
  currency_code: string;
  term_months: number;
  purpose: string | null;
  status: ApplicationStatus;
  decision_reason: string | null;
  submitted_at: string;
  decided_at: string | null;
  /** set once approved */
  loan_id: string | null;
}

export interface NewLoanApplication {
  account_id: string;
  loan_type: LoanType;
  requested_amount_minor: number;
  currency_code: string;
  term_months: number;
  purpose?: string;
}

/** approved: terms set, not paid out yet · active: being repaid */
export type LoanStatus = "approved" | "active" | "repaid" | "defaulted";

/** GET /v1/loans → data[], and GET /:id */
export interface Loan {
  loan_id: string;
  application_id: string | null;
  account_id: string;
  loan_type: LoanType;
  principal_minor: number;
  /** a year, in basis points: 2400 = 24% */
  interest_rate_bps: number;
  term_months: number;
  currency_code: string;
  /** what's still owed, interest included; 0 until paid out */
  balance_remaining_minor: number;
  loan_status: LoanStatus;
  disbursed_at: string | null;
  created_at: string;
  installments_paid: number;
  next_installment: { installment_number: number; due_date: string; installment_amount_minor: number } | null;
}

/** GET /v1/loans/:id/schedule → data[] (empty until paid out) */
export interface Installment {
  installment_number: number;
  due_date: string;
  installment_amount_minor: number;
  principal_minor: number;
  interest_minor: number;
  paid_flag: boolean;
  paid_transaction_id: string | null;
}

/** POST /v1/loans/:id/repayments */
export interface Repayment {
  transaction_id: string;
  loan_id: string;
  amount_minor: number;
  status: string;
  schedule_installment_marked_paid: number;
  new_balance_remaining_minor: number;
}
