import { api } from "@/lib/api";
import {
  AccountLookup,
  Card,
  CardLinkStart,
  ChargeResult,
  KycRequest,
  KycSubmission,
  PaymentState,
  Transfer,
  TransferRequest,
  VirtualAccount,
} from "@/types/money";

const idem = (key: string) => ({ "Idempotency-Key": key });

// Identity verification --------------------------------------------------

export function submitKyc(body: KycRequest, key: string) {
  return api<KycSubmission>("/v1/kyc/submissions", { method: "POST", headers: idem(key), body: JSON.stringify(body) });
}

export function getKycSubmission(kycId: string) {
  return api<KycSubmission>(`/v1/kyc/submissions/${kycId}`);
}

// Sending ------------------------------------------------------------------

/** Who holds this wallet ("name enquiry"), before sending to it. */
export function lookupAccount(accountNumber: string) {
  return api<AccountLookup>(`/v1/accounts/lookup?account_number=${encodeURIComponent(accountNumber)}`);
}

/** Send to another wallet (by number) or move between your own (by id). One key per attempt. */
export function transfer(body: TransferRequest, key: string) {
  return api<Transfer>("/v1/transactions", { method: "POST", headers: idem(key), body: JSON.stringify(body) });
}

// Adding money ---------------------------------------------------------------

export async function listCards(accountId: string) {
  return (await api<{ data: Card[] }>(`/v1/cards?account_id=${accountId}`)).data;
}

/** Starts linking a card: a Flutterwave checkout that adds ₦100. Needs a recent 2FA code. */
export function startCardLink(accountId: string, key: string) {
  return api<CardLinkStart>("/v1/cards", { method: "POST", headers: idem(key), body: JSON.stringify({ account_id: accountId }) });
}

export function chargeCard(cardId: string, amountMinor: number, key: string) {
  return api<ChargeResult>(`/v1/cards/${cardId}/charges`, {
    method: "POST",
    headers: idem(key),
    body: JSON.stringify({ amount_minor: amountMinor }),
  });
}

/** Asks the processor how a checkout or card charge ended, and settles it if it succeeded. */
export function syncPayment(transactionId: string) {
  return api<PaymentState>(`/v1/transactions/${transactionId}/sync`, { method: "POST" });
}

export function getVirtualAccount(accountId: string) {
  return api<VirtualAccount>(`/v1/accounts/${accountId}/virtual-account`);
}

export function createVirtualAccount(accountId: string, bvn: string) {
  return api<VirtualAccount>(`/v1/accounts/${accountId}/virtual-account`, { method: "POST", body: JSON.stringify({ bvn }) });
}
