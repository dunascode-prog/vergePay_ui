import { api, ApiError, ApiErrorBody } from "@/lib/api";
import { Account } from "@/types/account";
import {
  ApiClient,
  ApiInvoice,
  ClientFields,
  ClientInvoiceRequest,
  InvoiceEmail,
  InvoicePage,
  PayLink,
  PayLinkSync,
} from "@/types/invoicing";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
const withKey = (key: string): RequestInit => ({ headers: { "Idempotency-Key": key } });

// ---- invoices (signed in)

export function listInvoices({ role = "issued", after, limit = 100 }: { role?: "issued" | "received"; after?: string; limit?: number } = {}) {
  const query = new URLSearchParams({ role, limit: String(limit) });
  if (after) query.set("after", after);
  return api<InvoicePage>(`/v1/invoices?${query}`);
}

/** Every page of a list (a small business has hundreds of invoices, not millions). */
export async function listAllInvoices(role: "issued" | "received", maxPages = 10): Promise<ApiInvoice[]> {
  const all: ApiInvoice[] = [];
  let after: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const result = await listInvoices({ role, after });
    all.push(...result.data);
    if (!result.has_more || !result.next_cursor) break;
    after = result.next_cursor;
  }
  return all;
}

export const getInvoice = (id: string) => api<ApiInvoice>(`/v1/invoices/${id}`);

export const createInvoice = (body: ClientInvoiceRequest) =>
  api<ApiInvoice>("/v1/invoices", { method: "POST", ...json(body) });

export const updateInvoice = (id: string, body: Partial<Omit<ClientInvoiceRequest, "send" | "send_email" | "notes">> & { notes?: string | null }) =>
  api<ApiInvoice>(`/v1/invoices/${id}`, { method: "PATCH", ...json(body) });

export const deleteInvoice = (id: string) => api<{ deleted: boolean }>(`/v1/invoices/${id}`, { method: "DELETE" });

export const sendInvoice = (id: string, sendEmail: boolean) =>
  api<ApiInvoice>(`/v1/invoices/${id}/send`, { method: "POST", ...json({ send_email: sendEmail }) });

export const remindInvoice = (id: string, message?: string) =>
  api<InvoiceEmail>(`/v1/invoices/${id}/remind`, { method: "POST", ...json(message ? { message } : {}) });

export const cancelInvoice = (id: string) => api<ApiInvoice>(`/v1/invoices/${id}/cancel`, { method: "POST" });

export const refundInvoice = (id: string, reason: string | undefined, key: string) =>
  api<{ invoice_status: string }>(`/v1/invoices/${id}/refund`, { method: "POST", ...json(reason ? { reason } : {}), ...withKey(key) });

export const payInvoice = (id: string, sourceAccountId: string, key: string) =>
  api<{ invoice_status: string }>(`/v1/invoices/${id}/pay`, {
    method: "POST",
    ...json({ source_account_id: sourceAccountId }),
    ...withKey(key),
  });

// ---- clients

export const listClients = ({ includeArchived = false } = {}) =>
  api<{ data: ApiClient[] }>(`/v1/clients${includeArchived ? "?include_archived=true" : ""}`).then((r) => r.data);

export const getClient = (id: string) => api<ApiClient>(`/v1/clients/${id}`);

export const createClient = (body: ClientFields) => api<ApiClient>("/v1/clients", { method: "POST", ...json(body) });

/** null clears a field */
export const updateClient = (id: string, changes: Partial<ClientFields>) =>
  api<ApiClient>(`/v1/clients/${id}`, { method: "PATCH", ...json(changes) });

/** Hidden from pickers; their invoices are kept. */
export const archiveClient = (id: string) => api<ApiClient>(`/v1/clients/${id}`, { method: "DELETE" });

export const restoreClient = (id: string) => api<ApiClient>(`/v1/clients/${id}/restore`, { method: "POST" });

// ---- pay links (public: no session, and a 401 must never send a payer to sign-in)

async function publicCall<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });
  } catch {
    throw new ApiError(0, { message: "Can't reach VergePay. Check your connection and try again." });
  }
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new ApiError(response.status, (body as { error?: Partial<ApiErrorBody> } | null)?.error);
  return body as T;
}

export const getPayLink = (token: string) => publicCall<PayLink>(`/v1/pay/${token}`);

export const startPayLinkCheckout = (token: string, body: { email?: string; name?: string }) =>
  publicCall<{ transaction_id: string; checkout_url: string }>(`/v1/pay/${token}/checkout`, { method: "POST", ...json(body) });

export const syncPayLink = (token: string, transactionId: string) =>
  publicCall<PayLinkSync>(`/v1/pay/${token}/sync`, { method: "POST", ...json({ transaction_id: transactionId }) });

export const payLinkFromWallet = (token: string, sourceAccountId: string, key: string) =>
  publicCall<{ invoice_status: string }>(`/v1/pay/${token}/wallet`, {
    method: "POST",
    ...json({ source_account_id: sourceAccountId }),
    ...withKey(key),
  });

/** The signed-in customer, or null: never redirects (for the public pay page). */
export async function currentUserOrNull() {
  try {
    return await publicCall<{ user_id: string; first_name: string | null }>("/v1/users/me");
  } catch {
    return null;
  }
}

export const listMyAccountsPublic = () => publicCall<{ data: Account[] }>("/v1/accounts").then((r) => r.data);
