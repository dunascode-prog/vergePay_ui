import { api } from "@/lib/api";
import {
  Account,
  AccountTransaction,
  CursorPage,
  OpenAccountRequest,
} from "@/types/account";

export async function listAccounts() {
  const page = await api<{ data: Account[] }>("/v1/accounts");
  return page.data;
}

/**
 * Opens an account. The API requires an Idempotency-Key; pass the same key
 * when retrying one submission, so a retried request can't open two accounts.
 */
export function openAccount(body: OpenAccountRequest, idempotencyKey: string) {
  return api<Account>("/v1/accounts", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
}

// The API returns at most 100 lines a page; 30 pages (3,000 lines) is far
// more than any account has in six months today, and stops a runaway loop.
const PAGE_SIZE = 100;
const MAX_PAGES = 30;

/** Every ledger line on an account since `fromDate` (YYYY-MM-DD), newest first. */
export async function listAccountTransactionsSince(accountId: string, fromDate: string) {
  const lines: AccountTransaction[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), from_date: fromDate });
    if (after) params.set("after", after);
    const result: CursorPage<AccountTransaction> = await api(
      `/v1/accounts/${accountId}/transactions?${params}`,
    );
    lines.push(...result.data);
    if (!result.has_more || !result.next_cursor) break;
    after = result.next_cursor;
  }
  return lines;
}
