import {
  LedgerSnapshot,
  WalletBalance,
  ExpenseCategory,
  RevenueExpensePoint,
  Goal,
  BusinessHealthFactor,
  HealthScoreSnapshot,
} from "@/types/business";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Accounts Receivable here mirrors the actual outstanding invoices from the
// invoices page mock data (StartupXYZ NGN 120,000 sent + Northwind NGN
// 275,000 overdue + GlobalReach USD 840 remaining on a partial payment) —
// picked deliberately rather than invented fresh, since AR should reflect
// the same outstanding invoices shown elsewhere in the app.
export async function getLedgerSnapshot(): Promise<LedgerSnapshot> {
  await delay(400);
  return {
    cash: [
      { amount: 2270000, currency: "NGN" },
      { amount: 4050, currency: "USD" },
    ],
    accountsReceivable: [
      { amount: 395000, currency: "NGN" },
      { amount: 840, currency: "USD" },
    ],
    revenueYtd: [
      { amount: 4445000, currency: "NGN" },
      { amount: 2300, currency: "USD" },
    ],
    expensesYtd: [{ amount: 290000, currency: "NGN" }],
  };
}

export async function getWalletBalances(): Promise<WalletBalance[]> {
  await delay(300);
  return [
    {
      label: "Personal",
      amounts: [
        { amount: 420000, currency: "NGN" },
        { amount: 850, currency: "USD" },
      ],
    },
    {
      label: "Business",
      amounts: [
        { amount: 1850000, currency: "NGN" },
        { amount: 3200, currency: "USD" },
      ],
    },
  ];
}

// Same categories and figures as the Analytics page's expense breakdown —
// same business, same expenses, shouldn't show two different numbers.
export async function getExpenseBreakdown(): Promise<ExpenseCategory[]> {
  await delay(300);
  return [
    { category: "Software & tools", amount: 62000, currency: "NGN", colorClass: "bg-emerald-500" },
    { category: "Contractor payouts", amount: 145000, currency: "NGN", colorClass: "bg-blue-500" },
    { category: "Marketing", amount: 38000, currency: "NGN", colorClass: "bg-amber-500" },
    { category: "Internet & utilities", amount: 27000, currency: "NGN", colorClass: "bg-violet-500" },
    { category: "Other", amount: 18000, currency: "NGN", colorClass: "bg-gray-400" },
  ];
}

// Revenue figures match the Analytics page's revenue trend; expenses are
// layered on top here since Analytics doesn't chart them, giving Business
// Overview a margin story Analytics doesn't show.
export async function getRevenueExpenseTrend(): Promise<RevenueExpensePoint[]> {
  await delay(500);
  return [
    { month: "Jun", revenueNgn: 620000, revenueUsd: 0, expensesNgn: 98000 },
    { month: "Jul", revenueNgn: 540000, revenueUsd: 0, expensesNgn: 87000 },
    { month: "Aug", revenueNgn: 710000, revenueUsd: 400, expensesNgn: 112000 },
    { month: "Sep", revenueNgn: 480000, revenueUsd: 0, expensesNgn: 76000 },
    { month: "Oct", revenueNgn: 690000, revenueUsd: 900, expensesNgn: 105000 },
    { month: "Nov", revenueNgn: 820000, revenueUsd: 1400, expensesNgn: 118000 },
  ];
}

// Same goals as Analytics — one freelancer, one set of goals.
export async function getGoals(): Promise<Goal[]> {
  await delay(300);
  return [
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
}

// Same Health Score, history, and factors as Analytics — this is
// deliberately the same underlying score, not a second competing metric.
export const currentHealthScore = 87;

export async function getHealthScoreHistory(): Promise<HealthScoreSnapshot[]> {
  await delay(200);
  return [
    { month: "Jun", score: 71 },
    { month: "Jul", score: 74 },
    { month: "Aug", score: 78 },
    { month: "Sep", score: 76 },
    { month: "Oct", score: 82 },
    { month: "Nov", score: 87 },
  ];
}

export async function getHealthScoreFactors(): Promise<BusinessHealthFactor[]> {
  await delay(200);
  return [
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
      detail: "1 invoice overdue 28+ days (Northwind Studios, NGN 275,000)",
    },
    {
      label: "Recurring revenue",
      status: "good",
      detail: "18% of revenue now comes from recurring invoices",
    },
  ];
}
