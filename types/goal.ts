import { Currency } from "@/types/invoice";

export type GoalCategory = "Emergency Fund" | "Equipment" | "Investment" | "Other";

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  target: number;
  current: number;
  currency: Currency;
  deadline: string; // ISO date
  createdDate: string; // ISO date - used to compute contribution pace
}

export interface GoalContribution {
  id: string;
  goalId: string;
  date: string; // ISO date
  amount: number;
  currency: Currency;
}
