import { Currency } from "@/types/invoice";

export interface CurrencyAmount {
  amount: number;
  currency: Currency;
}

export interface LedgerSnapshot {
  cash: CurrencyAmount[];
  accountsReceivable: CurrencyAmount[];
  revenueYtd: CurrencyAmount[];
  expensesYtd: CurrencyAmount[];
}

export interface WalletBalance {
  label: "Personal" | "Business";
  amounts: CurrencyAmount[];
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  currency: Currency;
  colorClass: string;
}

export interface RevenueExpensePoint {
  month: string;
  revenueNgn: number;
  revenueUsd: number;
  expensesNgn: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  currency: Currency;
  deadline: string;
}

export interface BusinessHealthFactor {
  label: string;
  status: "good" | "watch" | "risk";
  detail: string;
}

export interface HealthScoreSnapshot {
  month: string;
  score: number;
}

export type AttentionSeverity = "high" | "medium";

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  detail: string;
  href: string;
  linkLabel: string;
}
