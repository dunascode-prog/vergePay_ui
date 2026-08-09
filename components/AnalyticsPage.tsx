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
    <div className="min-h-screen">
      <div className="">
        <div className="flex justify-end mb-4">
          <div className="flex items-right gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <HealthScoreCard
            currentScore={currentHealthScore}
            history={healthScoreHistory}
            factors={healthScoreFactors}
          />
          <CollectionMetricsCard clients={clientRevenueShares} />
          <ConcentrationRiskCard clients={clientRevenueShares} currency="NGN" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <RevenueTrendChart data={revenueTrend} />
          </div>
          <CashFlowForecastCard buckets={cashFlowForecast} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <ClientLeaderboardTable clients={clientRevenueShares} />
          </div>
          <InvoiceBehaviorCard
            reminders={reminderEffectiveness}
            latePayments={latePaymentDistribution}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ExpenseBreakdownCard categories={expenseCategories} />
          <GoalsProgressCard goals={goals} />
        </div>

        <AIInsightsFeed insights={aiInsights} />
      </div>
    </div>
  );
}

export default AnalyticsPage;
