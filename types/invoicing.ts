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

export interface ApiClient {
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  archived_at: string | null;
  created_at: string;
  invoice_count: number;
  outstanding: { currency_code: string; amount_minor: number }[];
  last_invoiced_at: string | null;
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
