import { api } from "@/lib/api";
import { ApiRecurringPlan, NewRecurringPlan, RecurringPlanChanges, RecurringStatus } from "@/types/recurring";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const listRecurringPlans = (status?: RecurringStatus) =>
  api<{ data: ApiRecurringPlan[] }>(`/v1/recurring-plans${status ? `?status=${status}` : ""}`).then((r) => r.data);

export const getRecurringPlan = (id: string) => api<ApiRecurringPlan>(`/v1/recurring-plans/${id}`);

/** A plan that starts today sends its first invoice straight away. */
export const createRecurringPlan = (body: NewRecurringPlan) =>
  api<ApiRecurringPlan>("/v1/recurring-plans", { method: "POST", ...json(body) });

/** Applies to invoices not sent yet. */
export const updateRecurringPlan = (id: string, changes: RecurringPlanChanges) =>
  api<ApiRecurringPlan>(`/v1/recurring-plans/${id}`, { method: "PATCH", ...json(changes) });

export const pauseRecurringPlan = (id: string) => api<ApiRecurringPlan>(`/v1/recurring-plans/${id}/pause`, { method: "POST" });

/** Picks up at the next billing date from today; the paused time isn't billed. */
export const resumeRecurringPlan = (id: string) => api<ApiRecurringPlan>(`/v1/recurring-plans/${id}/resume`, { method: "POST" });

export const cancelRecurringPlan = (id: string) => api<ApiRecurringPlan>(`/v1/recurring-plans/${id}/cancel`, { method: "POST" });
