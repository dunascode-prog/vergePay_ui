import { getExpenses } from "@/data/mock-expenses";
import { PageHeader } from "@/components/expenses/PageHeader";
import { ExpenseSummaryCards } from "@/components/expenses/ExpenseSummaryCards";
import { AIExpenseInsightBanner } from "@/components/expenses/AIExpenseInsightBanner";
import { ExpenseTrendChart } from "@/components/expenses/ExpenseTrendChart";
import { CategoryBreakdownCard } from "@/components/expenses/CategoryBreakdownCard";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <PageHeader
          backHref="/dashboard/business"
          backLabel="Back to business overview"
          title=""
        />

        <div className="space-y-4 mb-6">
          <ExpenseSummaryCards expenses={expenses} />
          <AIExpenseInsightBanner expenses={expenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">
          <ExpenseTable expenses={expenses} />
          <div className="space-y-4 grid grid-cols-1 lg:grid-cols-12 lg:gap-2">
            <CategoryBreakdownCard expenses={expenses} />
            <ExpenseTrendChart expenses={expenses} />
          </div>
        </div>
      </div>
    </div>
  );
}
