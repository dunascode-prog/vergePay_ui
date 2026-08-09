import {
  HealthScoreSnapshot,
  HealthScoreFactor,
  RevenuePoint,
  ClientRevenueShare,
  CashFlowBucket,
  ReminderEffectiveness,
  LatePaymentBucket,
  ExpenseCategory,
  Goal,
  AIInsight,
} from "@/types/analytics";

export const healthScoreHistory: HealthScoreSnapshot[] = [
  { month: "Jun", score: 71 },
  { month: "Jul", score: 74 },
  { month: "Aug", score: 78 },
  { month: "Sep", score: 76 },
  { month: "Oct", score: 82 },
  { month: "Nov", score: 87 },
];

export const currentHealthScore = 87;

export const healthScoreFactors: HealthScoreFactor[] = [
  {
    label: "Collection speed",
    status: "good",
    detail: "Average 7 days to get paid, down from 18 days in October",
  },
  {
    label: "Client concentration",
    status: "watch",
    detail: "TechCorp accounts for 41% of NGN revenue this quarter",
  },
  {
    label: "Overdue exposure",
    status: "watch",
    detail: "1 invoice overdue 28+ days (Northwind Studios, ₦275,000)",
  },
  {
    label: "Recurring revenue",
    status: "good",
    detail: "18% of revenue now comes from recurring invoices",
  },
];

export const revenueTrend: RevenuePoint[] = [
  { month: "Jun", ngn: 620000, usdInNgnEquivalent: 0, usdRaw: 0 },
  { month: "Jul", ngn: 540000, usdInNgnEquivalent: 0, usdRaw: 0 },
  { month: "Aug", ngn: 710000, usdInNgnEquivalent: 0, usdRaw: 400 },
  { month: "Sep", ngn: 480000, usdInNgnEquivalent: 0, usdRaw: 0 },
  { month: "Oct", ngn: 690000, usdInNgnEquivalent: 0, usdRaw: 900 },
  { month: "Nov", ngn: 820000, usdInNgnEquivalent: 0, usdRaw: 1400 },
];

export const clientRevenueShares: ClientRevenueShare[] = [
  {
    clientId: "client_techcorp",
    name: "TechCorp",
    initials: "TC",
    healthScore: 98,
    avgCollectionDays: 7,
    onTimeRate: 100,
    revenue: 1350000,
    currency: "NGN",
    shareOfTotal: 41,
  },
  {
    clientId: "client_designagency",
    name: "DesignAgency Ltd",
    initials: "DA",
    healthScore: 85,
    avgCollectionDays: 8,
    onTimeRate: 92,
    revenue: 780000,
    currency: "NGN",
    shareOfTotal: 24,
  },
  {
    clientId: "client_mediahouse",
    name: "MediaHouse Nigeria",
    initials: "MH",
    healthScore: 74,
    avgCollectionDays: 12,
    onTimeRate: 78,
    revenue: 610000,
    currency: "NGN",
    shareOfTotal: 19,
  },
  {
    clientId: "client_startupxyz",
    name: "StartupXYZ",
    initials: "SX",
    healthScore: 62,
    avgCollectionDays: 18,
    onTimeRate: 55,
    revenue: 350000,
    currency: "NGN",
    shareOfTotal: 11,
  },
  {
    clientId: "client_northwind",
    name: "Northwind Studios",
    initials: "NS",
    healthScore: 41,
    avgCollectionDays: 34,
    onTimeRate: 20,
    revenue: 165000,
    currency: "NGN",
    shareOfTotal: 5,
  },
  {
    clientId: "client_globalreach",
    name: "GlobalReach Inc",
    initials: "GR",
    healthScore: 90,
    avgCollectionDays: 10,
    onTimeRate: 88,
    revenue: 2300,
    currency: "USD",
    shareOfTotal: 100,
  },
];

export const cashFlowForecast: CashFlowBucket[] = [
  { label: "Next 7 days", expected: 120000, currency: "NGN", invoiceCount: 1 },
  { label: "8–30 days", expected: 0, currency: "NGN", invoiceCount: 0 },
  { label: "31–60 days", expected: 350000, currency: "NGN", invoiceCount: 1 },
  { label: "Next 7 days", expected: 840, currency: "USD", invoiceCount: 1 },
  { label: "8–30 days", expected: 0, currency: "USD", invoiceCount: 0 },
];

export const reminderEffectiveness: ReminderEffectiveness = {
  remindersSent: 14,
  paidWithin48h: 9,
  paidLater: 3,
  stillUnpaid: 2,
};

export const latePaymentDistribution: LatePaymentBucket[] = [
  { label: "On time", count: 21 },
  { label: "1–7 days late", count: 6 },
  { label: "8–30 days late", count: 3 },
  { label: "30+ days late", count: 1 },
];

export const expenseCategories: ExpenseCategory[] = [
  { category: "Software & tools", amount: 62000, currency: "NGN", colorClass: "bg-emerald-500" },
  { category: "Contractor payouts", amount: 145000, currency: "NGN", colorClass: "bg-blue-500" },
  { category: "Marketing", amount: 38000, currency: "NGN", colorClass: "bg-amber-500" },
  { category: "Internet & utilities", amount: 27000, currency: "NGN", colorClass: "bg-violet-500" },
  { category: "Other", amount: 18000, currency: "NGN", colorClass: "bg-gray-400" },
];

export const goals: Goal[] = [
  {
    id: "goal_emergency",
    name: "Emergency fund (3 months expenses)",
    target: 900000,
    current: 540000,
    currency: "NGN",
    deadline: "2025-03-01",
  },
  {
    id: "goal_equipment",
    name: "New MacBook for client work",
    target: 1600,
    current: 620,
    currency: "USD",
    deadline: "2025-01-15",
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: "insight_1",
    tone: "positive",
    title: "Collection time improved sharply",
    detail:
      "Average days-to-pay dropped from 18 to 7 this month, driven mostly by TechCorp and DesignAgency Ltd paying on issue.",
  },
  {
    id: "insight_2",
    tone: "warning",
    title: "Client concentration is rising",
    detail:
      "TechCorp now makes up 41% of NGN revenue, up from 33% last quarter. Losing this client would meaningfully affect cash flow.",
  },
  {
    id: "insight_3",
    tone: "warning",
    title: "Northwind Studios is a repeat late payer",
    detail:
      "3 of their last 4 invoices were paid more than 20 days late. Consider requiring a deposit on future work.",
  },
  {
    id: "insight_4",
    tone: "info",
    title: "Recurring revenue is growing",
    detail:
      "Recurring invoices (StartupXYZ retainer) now cover 18% of monthly revenue, up from 11% two months ago.",
  },
];
