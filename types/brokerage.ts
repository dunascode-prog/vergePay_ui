// Shapes from the API's brokerage endpoints (/v1/brokerage-links, /v1/holdings).

export type LinkStatus = "pending" | "active" | "expired" | "revoked" | "failed";

/** GET /v1/brokerage-links → data[] (never includes token material). */
export interface BrokerageLink {
  link_id: string;
  provider_name: string;
  account_id: string;
  provider_account: string | null; // "••••1234"
  connection: "oauth" | "shared_test_account";
  link_status: LinkStatus;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  created_at: string;
}

/**
 * POST /v1/brokerage-links: either an OAuth start (send the browser to
 * authorization_url) or, in the API's shared test mode, an immediate link.
 */
export type StartLinkResponse =
  | { authorization_url: string; state: string; expires_at: string }
  | { link_id: string; link_status: LinkStatus; connection: "shared_test_account"; message: string };

/** GET /v1/holdings → data[] */
export interface Holding {
  holding_id: string;
  account_id: string;
  security: {
    ticker_symbol: string;
    company_name: string | null;
    asset_type: string;
    exchange: string | null;
    currency_code: string;
  };
  quantity: string; // decimal string, e.g. "0.01234567"
  average_cost_minor: number | null;
  current_price_minor: number | null;
  market_value_minor: number | null;
  unrealized_pl_minor: number | null;
  provider_name: string | null;
  last_synced_at: string | null;
}

/** POST /v1/auth/2fa/enable */
export interface TwoFactorSetup {
  secret: string;
  otpauth_uri: string;
}
