import { Expense } from "@/types/expense";

const EXPENSES: Expense[] = [
  {
    id: "exp_001",
    date: "2024-06-03",
    description: "Hosting for VergePay + client projects",
    vendor: "Vercel Inc.",
    category: "Software & tools",
    amount: 18000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_002",
    date: "2024-06-28",
    description: "Virtual assistant retainer — June",
    vendor: "Ngozi Adaeze",
    category: "Contractor payouts",
    amount: 35000,
    currency: "NGN",
    paymentMethod: "Bank Transfer",
    isRecurring: true,
    hasReceipt: false,
  },
  {
    id: "exp_003",
    date: "2024-07-05",
    description: "Home office internet",
    vendor: "Spectranet",
    category: "Internet & utilities",
    amount: 15000,
    currency: "NGN",
    paymentMethod: "Direct Debit",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_004",
    date: "2024-07-18",
    description: "Instagram ad campaign — new client acquisition",
    vendor: "Meta Ads",
    category: "Marketing",
    amount: 20000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: false,
    hasReceipt: true,
  },
  {
    id: "exp_005",
    date: "2024-08-10",
    description: "Backend development — TechCorp mobile app sprint",
    vendor: "Chidi Okafor",
    category: "Contractor payouts",
    amount: 85000,
    currency: "NGN",
    paymentMethod: "Bank Transfer",
    isRecurring: false,
    hasReceipt: false,
  },
  {
    id: "exp_006",
    date: "2024-08-20",
    description: "Creative Cloud annual renewal",
    vendor: "Adobe",
    category: "Software & tools",
    amount: 12000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: false,
    hasReceipt: true,
  },
  {
    id: "exp_007",
    date: "2024-08-30",
    description: "Shared workspace electricity — August",
    vendor: "Ikeja Electric",
    category: "Internet & utilities",
    amount: 12000,
    currency: "NGN",
    paymentMethod: "Bank Transfer",
    isRecurring: true,
    hasReceipt: false,
  },
  {
    id: "exp_008",
    date: "2024-09-03",
    description: "Design subscription",
    vendor: "Figma Inc.",
    category: "Software & tools",
    amount: 15000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_009",
    date: "2024-09-14",
    description: "Business card reprint — updated logo",
    vendor: "PrintHub Lagos",
    category: "Marketing",
    amount: 10000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: false,
    hasReceipt: true,
  },
  {
    id: "exp_010",
    date: "2024-09-30",
    description: "Wire transfer fees — September",
    vendor: "GTBank",
    category: "Other",
    amount: 6000,
    currency: "NGN",
    paymentMethod: "Bank Transfer",
    isRecurring: false,
    hasReceipt: false,
  },
  {
    id: "exp_011",
    date: "2024-10-08",
    description: "Brand assets — DesignAgency collaboration",
    vendor: "Kunle Adebayo",
    category: "Contractor payouts",
    amount: 25000,
    currency: "NGN",
    paymentMethod: "Bank Transfer",
    isRecurring: false,
    hasReceipt: false,
  },
  {
    id: "exp_012",
    date: "2024-10-12",
    description: "Business email & docs",
    vendor: "Google",
    category: "Software & tools",
    amount: 8000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_013",
    date: "2024-10-22",
    description: "Printer paper, folders, invoice stamps",
    vendor: "Office Point",
    category: "Other",
    amount: 4000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: false,
    hasReceipt: false,
  },
  {
    id: "exp_014",
    date: "2024-11-02",
    description: "Workspace & notes subscription",
    vendor: "Notion Labs",
    category: "Software & tools",
    amount: 9000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_015",
    date: "2024-11-06",
    description: "Lead generation & outreach",
    vendor: "LinkedIn",
    category: "Marketing",
    amount: 8000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: "exp_016",
    date: "2024-11-11",
    description: "Courier — signed contracts to Northwind Studios",
    vendor: "GIG Logistics",
    category: "Other",
    amount: 8000,
    currency: "NGN",
    paymentMethod: "Card",
    isRecurring: false,
    hasReceipt: true,
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getExpenses(): Promise<Expense[]> {
  await delay(500);
  return [...EXPENSES].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface CreateExpenseInput {
  description: string;
  vendor: string;
  category: Expense["category"];
  amount: number;
  currency: Expense["currency"];
  paymentMethod: Expense["paymentMethod"];
  isRecurring: boolean;
  date: string;
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  await delay(500);
  const expense: Expense = {
    id: `exp_${Math.random().toString(36).slice(2, 9)}`,
    hasReceipt: false,
    ...input,
  };
  EXPENSES.unshift(expense);
  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await delay(300);
  const index = EXPENSES.findIndex((e) => e.id === id);
  if (index !== -1) EXPENSES.splice(index, 1);
}
