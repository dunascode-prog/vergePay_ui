// Shapes from the API's savings goals (/v1/goals). Money is in minor units.
import { AccountPurpose } from "@/types/account";
import { Transfer } from "@/types/money";

export type GoalCategory = "emergency_fund" | "equipment" | "investment" | "other";
export type GoalStatus = "active" | "closed";

/** GET /v1/goals → data[]. What a goal has saved is its own account's balance. */
export interface Goal {
  goal_id: string;
  name: string;
  category: GoalCategory;
  currency_code: string;
  target_minor: number;
  target_date: string; // YYYY-MM-DD
  goal_status: GoalStatus;
  /** The savings account that holds the goal's money. */
  account_id: string;
  account_number: string;
  saved_minor: number;
  remaining_minor: number;
  progress_percent: number;
  is_funded: boolean;
  contributed_minor: number;
  withdrawn_minor: number;
  contribution_count: number;
  last_contribution_at: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

/** One move in or out of a goal, with the goal's balance after it. */
export interface GoalActivity {
  transaction_id: string;
  kind: "contribution" | "withdrawal";
  amount_minor: number;
  currency_code: string;
  balance_after_minor: number;
  /** The wallet on the other side. */
  wallet_account_id: string | null;
  wallet_purpose: AccountPurpose | null;
  created_at: string;
}

/** GET /v1/goals/:id */
export interface GoalDetail extends Goal {
  activity: GoalActivity[];
}

export interface NewGoal {
  name: string;
  category: GoalCategory;
  target_minor: number;
  currency_code: string;
  target_date: string;
}

export type GoalChanges = Partial<Pick<NewGoal, "name" | "category" | "target_minor" | "target_date">>;

/** POST /v1/goals/:id/contributions, /withdrawals and /close */
export interface GoalMove {
  goal: Goal;
  /** null when closing a goal that held nothing. */
  transaction: Transfer | null;
}
