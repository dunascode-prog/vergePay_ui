import { api } from "@/lib/api";
import { Installment, Loan, LoanApplication, NewLoanApplication, Repayment } from "@/types/loan";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const listLoanApplications = () => api<{ data: LoanApplication[] }>("/v1/loans/applications").then((r) => r.data);

/** 202: accepted for review. One application can wait for a decision at a time. */
export const applyForLoan = (body: NewLoanApplication) =>
  api<{ application_id: string; status: string; submitted_at: string }>("/v1/loans/applications", { method: "POST", ...json(body) });

export const listLoans = () => api<{ data: Loan[] }>("/v1/loans").then((r) => r.data);

export const getLoan = (id: string) => api<Loan>(`/v1/loans/${id}`);

export const getLoanSchedule = (id: string) => api<{ data: Installment[] }>(`/v1/loans/${id}/schedule`).then((r) => r.data);

/** Pays the next installment, in full: `amountMinor` must be exactly what it is. */
export const repayLoan = (id: string, sourceAccountId: string, amountMinor: number, key: string) =>
  api<Repayment>(`/v1/loans/${id}/repayments`, {
    method: "POST",
    headers: { "Idempotency-Key": key },
    ...json({ source_account_id: sourceAccountId, amount_minor: amountMinor }),
  });

// ---- development only: the API's /v1/dev routes stand in for the underwriter

export const devDecideApplication = (id: string, decision: { decision: "approve"; interest_rate_bps?: number } | { decision: "reject"; reason: string }) =>
  api<unknown>(`/v1/dev/loans/applications/${id}/decide`, { method: "POST", ...json(decision) });
