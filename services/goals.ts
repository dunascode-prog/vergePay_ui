import { api } from "@/lib/api";
import { Goal, GoalChanges, GoalDetail, GoalMove, GoalStatus, NewGoal } from "@/types/goal";

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
const keyed = (key: string) => ({ headers: { "Idempotency-Key": key } });

export const listGoals = (status: GoalStatus | "all" = "active") =>
  api<{ data: Goal[] }>(`/v1/goals?status=${status}`).then((r) => r.data);

export const getGoal = (id: string) => api<GoalDetail>(`/v1/goals/${id}`);

/** Opens the goal's own savings account with it. */
export const createGoal = (body: NewGoal) => api<Goal>("/v1/goals", { method: "POST", ...json(body) });

export const updateGoal = (id: string, changes: GoalChanges) =>
  api<Goal>(`/v1/goals/${id}`, { method: "PATCH", ...json(changes) });

/** Wallet → goal. One key per attempt, so a retry never saves twice. */
export const contributeToGoal = (id: string, fromAccountId: string, amountMinor: number, key: string) =>
  api<GoalMove>(`/v1/goals/${id}/contributions`, {
    method: "POST",
    ...keyed(key),
    ...json({ from_account_id: fromAccountId, amount_minor: amountMinor }),
  });

/** Goal → wallet. */
export const withdrawFromGoal = (id: string, toAccountId: string, amountMinor: number, key: string) =>
  api<GoalMove>(`/v1/goals/${id}/withdrawals`, {
    method: "POST",
    ...keyed(key),
    ...json({ to_account_id: toAccountId, amount_minor: amountMinor }),
  });

/** Moves what's left to the wallet (needed when there's money in it) and closes the goal. Final. */
export const closeGoal = (id: string, toAccountId: string | null, key: string) =>
  api<GoalMove>(`/v1/goals/${id}/close`, {
    method: "POST",
    ...keyed(key),
    ...json(toAccountId ? { to_account_id: toAccountId } : {}),
  });
