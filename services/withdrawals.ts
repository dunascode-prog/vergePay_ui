import { api } from "@/lib/api";
import { Bank, ResolvedBankAccount, SavedBankAccount, Withdrawal, WithdrawalQuote } from "@/types/withdrawal";

export const listBanks = () => api<{ data: Bank[] }>("/v1/banks").then((r) => r.data);

/** Name enquiry: who holds this account. Nothing is saved. */
export const resolveBankAccount = (bankCode: string, accountNumber: string) =>
  api<ResolvedBankAccount>(
    `/v1/bank-accounts/resolve?bank_code=${encodeURIComponent(bankCode)}&account_number=${encodeURIComponent(accountNumber)}`,
  );

export const listBankAccounts = () => api<{ data: SavedBankAccount[] }>("/v1/bank-accounts").then((r) => r.data);

/** The server checks the name again; the client never sends it. */
export const saveBankAccount = (bankCode: string, accountNumber: string) =>
  api<SavedBankAccount>("/v1/bank-accounts", {
    method: "POST",
    body: JSON.stringify({ bank_code: bankCode, account_number: accountNumber }),
  });

export const removeBankAccount = (id: string) => api<unknown>(`/v1/bank-accounts/${id}`, { method: "DELETE" });

export const quoteWithdrawal = (amountMinor: number) => api<WithdrawalQuote>(`/v1/withdrawals/quote?amount_minor=${amountMinor}`);

/** The wallet is debited at once; the transfer follows. One key per attempt. */
export const createWithdrawal = (
  body: { account_id: string; bank_account_id: string; amount_minor: number; narration?: string },
  key: string,
) => api<Withdrawal>("/v1/withdrawals", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(body) });

export const getWithdrawal = (id: string) => api<Withdrawal>(`/v1/withdrawals/${id}`);

/** Asks Flutterwave how the transfer went. */
export const syncWithdrawal = (id: string) => api<Withdrawal>(`/v1/withdrawals/${id}/sync`, { method: "POST" });
