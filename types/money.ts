// Shapes from the API's money-movement endpoints. Money is in minor units.

export type KycStatus = "pending" | "approved" | "rejected";

/** POST/GET /v1/kyc/submissions */
export interface KycSubmission {
  kyc_id: string;
  verification_status: KycStatus;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface KycRequest {
  document_type: "bvn";
  bvn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
}

/** GET /v1/accounts/lookup?account_number= */
export interface AccountLookup {
  account_number: string;
  account_name: string;
  currency_code: string;
  is_own: boolean;
}

/** GET /v1/cards → data[] */
export interface Card {
  card_id: string;
  account_id: string;
  provider_name: string;
  pan_bin: string | null;
  pan_last_four: string;
  cardholder_name: string | null;
  issuer: string | null;
  expiry_month: number;
  expiry_year: number;
  card_status: "active" | "blocked" | "expired" | "removed";
}

/** POST /v1/cards: the hosted checkout that links a card (and adds ₦100). */
export interface CardLinkStart {
  card_link_id: string;
  transaction_id: string;
  checkout_url: string | null;
  status: string;
  amount_minor: number;
  currency_code: string;
}

/** POST /v1/cards/:id/charges */
export interface ChargeResult {
  transaction_id: string;
  card_id: string;
  account_id: string;
  amount_minor: number;
  currency_code: string;
  status: "pending" | "settled" | "failed" | "reversed";
  /** 3-D Secure: send the browser here to approve the charge. */
  authorization_url: string | null;
  failure_reason: string | null;
}

/** POST /v1/transactions/:id/sync (after checkout or 3-D Secure) */
export interface PaymentState {
  transaction_id: string;
  transaction_type: string;
  status: "pending" | "settled" | "failed" | "reversed";
  amount_minor: number;
  currency_code: string;
  account_id: string;
  failure_reason: string | null;
  card_link_id: string | null;
  card_link_status: string | null;
  card_link_failure_reason: string | null;
}

/** GET/POST /v1/accounts/:id/virtual-account */
export interface VirtualAccount {
  virtual_account_id: string;
  account_id: string;
  account_number: string;
  bank_name: string;
  created_at: string;
}

export interface TransferRequest {
  sender_account_id: string;
  receiver_account_id?: string;
  receiver_account_number?: string;
  amount_minor: number;
  currency_code: string;
  description?: string;
}

/** POST /v1/transactions */
export interface Transfer {
  transaction_id: string;
  transaction_type: string;
  sender_account_id: string;
  receiver_account_id: string;
  amount_minor: number;
  currency_code: string;
  status: string;
  description: string | null;
  created_at: string;
}
