// Invoices, clients and pay links as the API returns them
// (/v1/invoices, /v1/clients, /v1/pay/:token).

export type InvoiceStatus = "draft" | "open" | "overdue" | "paid" | "cancelled" | "refunded";

export interface InvoiceItem {
  item_id?: string;
  description: string;
  quantity: number;
  unit_amount_minor: number;
  amount_minor: number;
}

export interface InvoiceEmail {
  email_id: string;
  kind: "invoice" | "reminder" | "receipt";
  to_address: string;
  subject: string;
  status: "queued" | "sent" | "failed";
  attempts: number;
  preview_url: string | null;
  error: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface ApiInvoice {
  invoice_id: string;
  invoice_number: string | null;
  invoice_status: InvoiceStatus;
  direction: "issued" | "received";
  issuer_account_id: string;
  issuer_account_number: string;
  issuer_name: string;
  account_id: string | null;
  billed_account_number: string | null;
  client: { client_id: string; name: string; email?: string | null; phone?: string | null } | null;
  amount_due_minor: number;
  currency_code: string;
  due_date: string;
  description: string | null;
  notes: string | null;
  items: InvoiceItem[];
  settling_transaction_id: string | null;
  paid_via: "pay_link" | "wallet" | null;
  paid_at: string | null;
  paid_by_name: string | null;
  paid_by_email: string | null;
  cancelled_at: string | null;
  refund_transaction_id: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  sent_at: string | null;
  /** Reminders emailed to the client, and when the last one went. */
  reminders_sent?: number;
  last_reminder_at?: string | null;
  /** Sent by a recurring plan, and which billing cycle. */
  recurring_plan_id?: string | null;
  recurring_cycle?: number | null;
  created_at: string;
  pay_url: string | null;
  /** Issuer only, on GET /v1/invoices/:id. */
  emails?: InvoiceEmail[];
}

export interface InvoicePage {
  data: ApiInvoice[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface NewItem {
  description: string;
  quantity: number;
  unit_amount_minor: number;
}

export interface ClientInvoiceRequest {
  issuer_account_id: string;
  client_id: string;
  items: NewItem[];
  due_date: string;
  notes?: string;
  send?: boolean;
  send_email?: boolean;
}

export interface Amount {
  currency_code: string;
  amount_minor: number;
}

export type ClientHealthLabel = "new" | "reliable" | "watch" | "at_risk";

export interface ApiClient {
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_name: string | null;
  industry: string | null;
  location: string | null;
  notes: string | null;
  is_vip: boolean;
  archived_at: string | null;
  created_at: string;
  // worked out from their invoices (drafts don't count)
  invoice_count: number;
  open_count: number;
  overdue_count: number;
  paid_count: number;
  paid_on_time_count: number;
  avg_days_to_pay: number | null;
  avg_days_late: number | null;
  oldest_overdue_days: number | null;
  last_invoiced_at: string | null;
  last_paid_at: string | null;
  /** paid, per currency */
  revenue: Amount[];
  /** sent and unpaid (overdue included), per currency */
  outstanding: Amount[];
  overdue: Amount[];
  recurring_plans: {
    plan_id: string;
    plan_status: "active" | "paused" | "cancelled";
    description: string;
    frequency: "weekly" | "monthly" | "quarterly" | "yearly";
    amount_minor: number;
    currency_code: string;
    next_billing_date: string | null;
  }[];
  /** 0–100 (null until they've paid or gone overdue), and why */
  health: { score: number | null; label: ClientHealthLabel; reasons: string[] };
  /** GET /v1/clients/:id only: the latest invoices, newest first */
  invoices?: Omit<ApiInvoice, "items">[];
}

export interface ClientFields {
  name: string;
  email?: string | null;
  phone?: string | null;
  contact_name?: string | null;
  industry?: string | null;
  location?: string | null;
  notes?: string | null;
  is_vip?: boolean;
}

export interface PayLink {
  invoice_number: string;
  invoice_status: InvoiceStatus;
  issuer_name: string;
  billed_to: string | null;
  amount_due_minor: number;
  currency_code: string;
  due_date: string;
  description: string | null;
  notes: string | null;
  items: InvoiceItem[];
  sent_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  payment_methods: { checkout: boolean; wallet: boolean };
}

export interface PayLinkSync {
  transaction_id: string;
  status: "pending" | "settled" | "failed";
  failure_reason: string | null;
  invoice_status: InvoiceStatus;
  settled_invoice: boolean;
}
