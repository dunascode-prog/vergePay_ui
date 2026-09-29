import { Expense } from "@/types/expense";
import { deriveCategoryTotals } from "@/lib/expense-category";
import { formatMoney } from "@/lib/format";
import { LuSparkles } from "react-icons/lu";

interface AIExpenseInsightBannerProps {
  expenses: Expense[];
}

function monthKey(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short" });
}

function buildInsight(expenses: Expense[]): string {
  const ngn = expenses.filter((e) => e.currency === "NGN");
  const total = ngn.reduce((sum, e) => sum + e.amount, 0);
  const categories = deriveCategoryTotals(expenses);
  const largest = [...categories].sort((a, b) => b.amount - a.amount)[0];

  const recurring = expenses.filter((e) => e.isRecurring);
  const recurringTotal = recurring.filter((e) => e.currency === "NGN").reduce((s, e) => s + e.amount, 0);
  const recurringShare = total > 0 ? Math.round((recurringTotal / total) * 100) : 0;

  // Compare the two most recent months present in the data.
  const months = [...new Set(ngn.map((e) => monthKey(e.date)))];
  const monthOrder = months.sort(
    (a, b) => new Date(`${a} 1, 2024`).getMonth() - new Date(`${b} 1, 2024`).getMonth()
  );
  const lastMonth = monthOrder[monthOrder.length - 1];
  const prevMonth = monthOrder[monthOrder.length - 2];
  const lastTotal = ngn.filter((e) => monthKey(e.date) === lastMonth).reduce((s, e) => s + e.amount, 0);
  const prevTotal = ngn.filter((e) => monthKey(e.date) === prevMonth).reduce((s, e) => s + e.amount, 0);

  const parts: string[] = [];

  if (largest) {
    const share = Math.round((largest.amount / total) * 100);
    parts.push(
      `${largest.category} is your biggest cost at ${formatMoney(largest.amount, "NGN")} (${share}% of total spend).`
    );
  }

  if (prevTotal > 0) {
    const change = Math.round(((lastTotal - prevTotal) / prevTotal) * 100);
    if (Math.abs(change) >= 15) {
      parts.push(
        `Spending in ${lastMonth} was ${Math.abs(change)}% ${change > 0 ? "higher" : "lower"} than ${prevMonth}.`
      );
    }
  }

  parts.push(`${recurringShare}% of spend is recurring subscriptions rather than one-off purchases.`);

  const missingReceipts = expenses.filter((e) => !e.hasReceipt).length;
  if (missingReceipts > 0) {
    parts.push(`${missingReceipts} expense${missingReceipts === 1 ? "" : "s"} still need${missingReceipts === 1 ? "s" : ""} a receipt attached.`);
  }

  return parts.join(" ");
}

export function AIExpenseInsightBanner({ expenses }: AIExpenseInsightBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
      <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-0.5">
          AI expense insight
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">{buildInsight(expenses)}</p>
      </div>
    </div>
  );
}
