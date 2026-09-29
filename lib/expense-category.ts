import { Expense, ExpenseCategoryName, CategoryTotal } from "@/types/expense";

// Same colors as the category breakdown already shown on Analytics and
// Business Overview — those were pre-aggregated numbers with no line items
// behind them; this page is the real source, so it needs to agree visually
// with what people have already seen elsewhere.
export const CATEGORY_COLORS: Record<ExpenseCategoryName, string> = {
  "Software & tools": "bg-emerald-500",
  "Contractor payouts": "bg-blue-500",
  Marketing: "bg-amber-500",
  "Internet & utilities": "bg-violet-500",
  Other: "bg-gray-400",
};

export const ALL_CATEGORIES: ExpenseCategoryName[] = [
  "Software & tools",
  "Contractor payouts",
  "Marketing",
  "Internet & utilities",
  "Other",
];

/**
 * Computes category totals directly from the itemized expense list. This is
 * deliberately NOT stored/duplicated data — if a new expense is added or
 * deleted, the breakdown is correct automatically, with nothing to keep in
 * sync by hand.
 */
export function deriveCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  return ALL_CATEGORIES.map((category) => {
    const inCategory = expenses.filter((e) => e.category === category);
    const currency = inCategory[0]?.currency ?? "NGN";
    return {
      category,
      amount: inCategory.reduce((sum, e) => sum + e.amount, 0),
      currency,
      colorClass: CATEGORY_COLORS[category],
      count: inCategory.length,
    };
  }).filter((c) => c.count > 0);
}
