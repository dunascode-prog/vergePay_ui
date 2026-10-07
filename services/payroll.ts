import { api } from "@/lib/api";
import { NewPayee, NewRun, Payee, PayeeChanges, PayeeDetail, PayeeStatus, PayrollRun } from "@/types/payroll";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const listPayees = (status: PayeeStatus | "all" = "all") =>
  api<{ data: Payee[] }>(`/v1/payees?status=${status}`).then((r) => r.data);

export const getPayee = (id: string) => api<PayeeDetail>(`/v1/payees/${id}`);

/** By wallet account number; named after the wallet holder unless `name` is given. */
export const createPayee = (body: NewPayee) => api<Payee>("/v1/payees", { method: "POST", ...json(body) });

export const updatePayee = (id: string, changes: PayeeChanges) =>
  api<Payee>(`/v1/payees/${id}`, { method: "PATCH", ...json(changes) });

export const listRuns = () => api<{ data: PayrollRun[] }>("/v1/payroll/runs").then((r) => r.data);

/** Pays everyone in `items`, or no one. One key per attempt, so a retry never pays twice. */
export const createRun = (body: NewRun, key: string) =>
  api<PayrollRun>("/v1/payroll/runs", { method: "POST", headers: { "Idempotency-Key": key }, ...json(body) });
