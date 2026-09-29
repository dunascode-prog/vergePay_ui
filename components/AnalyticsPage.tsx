"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LuDownload } from "react-icons/lu";
import { PeriodSelector } from "./PeriodSelector";
import { HealthScoreCard } from "./HealthScoreCard";
import { CollectionMetricsCard } from "./CollectionMetricsCard";
import { ConcentrationRiskCard } from "./ConcentrationRiskCard";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { CashFlowForecastCard } from "./CashFlowForecastCard";
import { ClientLeaderboardTable } from "./ClientLeaderboardTable";
import { InvoiceBehaviorCard } from "./InvoiceBehaviorCard";
import { ExpenseBreakdownCard } from "./ExpenseBreakdownCard";
import { GoalsProgressCard } from "./GoalsProgressCard";
import { AIInsightsFeed } from "./AIInsightsFeed";
import { Period } from "@/types/analytics";
import {
  currentHealthScore,
  healthScoreHistory,
  healthScoreFactors,
  revenueTrend,
  clientRevenueShares,
  cashFlowForecast,
  reminderEffectiveness,
  latePaymentDistribution,
  expenseCategories,
  goals,
  aiInsights,
} from "@/data/mock-analytics";

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("this_month");

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-5 lg:gap-6">
      <div className="flex justify-end overflow-x-auto">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        <HealthScoreCard
          currentScore={currentHealthScore}
          history={healthScoreHistory}
          factors={healthScoreFactors}
        />
        <CollectionMetricsCard clients={clientRevenueShares} />
        <ConcentrationRiskCard
          clients={clientRevenueShares}
          currency="NGN"
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenueTrend} />
        </div>
        <CashFlowForecastCard buckets={cashFlowForecast} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClientLeaderboardTable clients={clientRevenueShares} />
        </div>
        <InvoiceBehaviorCard
          reminders={reminderEffectiveness}
          latePayments={latePaymentDistribution}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <ExpenseBreakdownCard categories={expenseCategories} />
        <GoalsProgressCard goals={goals} />
      </div>

      <AIInsightsFeed insights={aiInsights} />
    </div>
  );
}

export default AnalyticsPage;
