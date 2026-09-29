import { getClients } from "@/data/mock-clients";
import { getRecurringPlans } from "@/data/mock-recurring";
import {
  getLedgerSnapshot,
  getWalletBalances,
  getExpenseBreakdown,
  getRevenueExpenseTrend,
  getGoals,
  getHealthScoreHistory,
  getHealthScoreFactors,
  currentHealthScore,
} from "@/data/mock-business";
import { monthlyEquivalent } from "@/lib/recurring-math";
import { sumByCurrency } from "@/lib/format";
import { AttentionItem } from "@/types/business";

import { PageHeader } from "@/components/business/PageHeader";
import { FinancialSummaryCards } from "@/components/business/FinancialSummaryCards";
import { BusinessHealthScoreCard } from "@/components/business/BusinessHealthScoreCard";
import { AIBusinessSummaryCard } from "@/components/business/AIBusinessSummaryCard";
import { RevenueExpenseTrendChart } from "@/components/business/RevenueExpenseTrendChart";
import { LedgerSnapshotCard } from "@/components/business/LedgerSnapshotCard";
import { WalletBalancesCard } from "@/components/business/WalletBalancesCard";
import { TopClientsCard } from "@/components/business/TopClientsCard";
import { RecurringRevenueCard } from "@/components/business/RecurringRevenueCard";
import { NeedsAttentionCard } from "@/components/business/NeedsAttentionCard";
import { GoalsProgressCard } from "@/components/business/GoalsProgressCard";
import { ExpenseBreakdownCard } from "@/components/business/ExpenseBreakdownCard";

export default async function BusinessOverviewPage() {
  // Pulled from the same data sources as the Clients and Recurring Billing
  // pages — this page computes its cards from those real records rather
  // than maintaining a fourth, disconnected copy of client/plan data.
  const [
    clients,
    plans,
    ledger,
    wallets,
    expenses,
    revenueExpenseTrend,
    goals,
    healthHistory,
    healthFactors,
  ] = await Promise.all([
    getClients(),
    getRecurringPlans(),
    getLedgerSnapshot(),
    getWalletBalances(),
    getExpenseBreakdown(),
    getRevenueExpenseTrend(),
    getGoals(),
    getHealthScoreHistory(),
    getHealthScoreFactors(),
  ]);

  const topClients = [...clients]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 4);

  const activePlans = plans.filter((p) => p.status === "active");
  const pausedPlans = plans.filter((p) => p.status === "paused");
  const mrrByCurrency = sumByCurrency(
    activePlans.map((p) => ({
      amount: monthlyEquivalent(p.amount, p.frequency),
      currency: p.currency,
    })),
  );

  const attentionItems: AttentionItem[] = [
    ...clients
      .filter((c) => c.healthScore < 55)
      .map((c) => ({
        id: `risk-${c.id}`,
        severity: "high" as const,
        title: `${c.name} is a payment risk`,
        detail: `Health score ${c.healthScore}/100${
          c.overdueInvoicesCount > 0
            ? ` · ${c.overdueInvoicesCount} overdue invoice(s)`
            : ""
        }`,
        href: "/clients",
        linkLabel: "View client",
      })),
    ...clients
      .filter((c) => c.overdueInvoicesCount > 0 && c.healthScore >= 55)
      .map((c) => ({
        id: `overdue-${c.id}`,
        severity: "medium" as const,
        title: `${c.name} has an overdue invoice`,
        detail: `${c.overdueInvoicesCount} invoice(s) past due`,
        href: "/invoices",
        linkLabel: "View invoices",
      })),
    ...pausedPlans.map((p) => ({
      id: `plan-${p.id}`,
      severity: "medium" as const,
      title: `${p.client.name}'s recurring plan is paused`,
      detail: p.description,
      href: `/recurring/${p.id}`,
      linkLabel: "View plan",
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <PageHeader
          backHref="/dashboard/invoices"
          backLabel="Back to invoices"
          title=""
        />

        <div className="space-y-4 mb-6">
          <FinancialSummaryCards
            revenue={ledger.revenueYtd}
            expenses={ledger.expensesYtd}
            cash={ledger.cash}
          />
          <AIBusinessSummaryCard
            clients={clients}
            plans={plans}
            trend={revenueExpenseTrend}
            cash={ledger.cash}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            <RevenueExpenseTrendChart data={revenueExpenseTrend} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TopClientsCard clients={topClients} />
              <RecurringRevenueCard
                mrrByCurrency={mrrByCurrency}
                activeCount={activePlans.length}
                pausedCount={pausedPlans.length}
                totalCount={plans.length}
              />
            </div>
            <NeedsAttentionCard items={attentionItems} />
          </div>

          <div className="space-y-4">
            <BusinessHealthScoreCard
              currentScore={currentHealthScore}
              history={healthHistory}
              factors={healthFactors}
            />
            <LedgerSnapshotCard ledger={ledger} />
            <ExpenseBreakdownCard categories={expenses} />
            <WalletBalancesCard wallets={wallets} />
            <GoalsProgressCard goals={goals} />
          </div>
        </div>
      </div>
    </div>
  );
}
