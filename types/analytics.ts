import { Currency } from "@/types/invoice";

export type Period = "this_month" | "last_3_months" | "this_year";

export interface HealthScoreSnapshot {
  month: string; // e.g. "Jun"
  score: number; // 0-100
}

export interface HealthScoreFactor {
  label: string;
  status: "good" | "watch" | "risk";
  detail: string;
}

export interface RevenuePoint {
  month: string;
  ngn: number;
  usdInNgnEquivalent: number; // kept separate from ngn, never summed into one currency silently
  usdRaw: number;
}

export interface ClientRevenueShare {
  clientId: string;
  name: string;
  initials: string;
  /** Not computed from real data yet; the leaderboard hides the column when null. */
  healthScore: number | null;
  avgCollectionDays: number;
  onTimeRate: number; // 0-100
  revenue: number;
  currency: Currency;
  shareOfTotal: number; // 0-100, computed within its own currency group
}

export interface CashFlowBucket {
  label: string; // e.g. "Next 7 days"
  expected: number;
  currency: Currency;
  invoiceCount: number;
}

export interface ReminderEffectiveness {
  remindersSent: number;
  paidWithin48h: number;
  paidLater: number;
  stillUnpaid: number;
}

export interface LatePaymentBucket {
  label: string;
  count: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  currency: Currency;
  colorClass: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  currency: Currency;
  deadline: string;
}

export type InsightTone = "positive" | "warning" | "info";

export interface AIInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}
