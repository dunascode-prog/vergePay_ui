"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccountScope, useAppData } from "@/components/app-data";
import { SampleBadge } from "@/components/dashboard/SampleWidgets";
import { useLedgerLines } from "@/components/dashboard/useLedgerLines";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cashFlowForecast,
  clientShares,
  earliestNeeded,
  insights,
  latePayments,
  periodWindow,
  reminderEffectiveness,
  revenueTrend,
  spendingByType,
} from "@/lib/analytics";
import { scopedWallets, walletsOf } from "@/lib/ledger";
import { listAllInvoices } from "@/services/invoices";
import { Period } from "@/types/analytics";
import { Currency } from "@/types/invoice";
import { ApiInvoice } from "@/types/invoicing";
import { AIInsightsFeed } from "./AIInsightsFeed";
import { CashFlowForecastCard } from "./CashFlowForecastCard";
import { ClientLeaderboardTable } from "./ClientLeaderboardTable";
import { CollectionMetricsCard } from "./CollectionMetricsCard";
import { ConcentrationRiskCard } from "./ConcentrationRiskCard";
import { ExpenseBreakdownCard } from "./ExpenseBreakdownCard";
import { GoalsProgressCard } from "./GoalsProgressCard";
import { HealthScoreCard } from "./HealthScoreCard";
import { InvoiceBehaviorCard } from "./InvoiceBehaviorCard";
import { PeriodSelector } from "./PeriodSelector";
import { RevenueTrendChart } from "./RevenueTrendChart";
// no backend for these two yet: shown as sample data, and tagged so
import { currentHealthScore, goals, healthScoreFactors, healthScoreHistory } from "@/data/mock-analytics";

/**
 * /dashboard/analytics: everything here comes from your ledger and invoices,
 * for the period picked and the Personal / Business / Combined view, except
 * the health score and goals, which are tagged sample data.
 */
export function AnalyticsPage() {
  const { accounts, accountsState, dataVersion } = useAppData();
  const [scope] = useAccountScope();
  const [period, setPeriod] = useState<Period>("this_month");

  const wallets = useMemo(() => scopedWallets(walletsOf(accounts), scope), [accounts, scope]);
  const scopedIds = useMemo(() => wallets.map((w) => w.account_id), [wallets]);
  const scoped = useMemo(() => new Set(scopedIds), [scopedIds]);
  // the main currency shown where a card picks one: NGN unless there's only USD
  const currency: Currency = wallets.some((w) => w.currency_code === "NGN") || !wallets.length ? "NGN" : "USD";

  // a stable "now" per load, so dates don't shift between renders
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock moves on when data is reloaded
    setNow(new Date());
  }, [dataVersion]);

  const ledger = useLedgerLines(scopedIds, dataVersion, earliestNeeded(period, now));

  const [allInvoices, setAllInvoices] = useState<ApiInvoice[] | null>(null);
  const [invoiceError, setInvoiceError] = useState(false);
  const [invoiceAttempt, setInvoiceAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    listAllInvoices("issued")
      .then((list) => {
        if (!live) return;
        setAllInvoices(list);
        setInvoiceError(false);
      })
      .catch(() => live && setInvoiceError(true));
    return () => {
      live = false;
    };
  }, [dataVersion, invoiceAttempt]);

  // only invoices paid into the wallets in view
  const invoices = useMemo(() => (allInvoices ?? []).filter((i) => scoped.has(i.issuer_account_id)), [allInvoices, scoped]);

  const data = useMemo(() => {
    const { start, trendMonths, label } = periodWindow(period, now);
    const clients = clientShares(invoices, start);
    const revenue = revenueTrend(ledger.lines, scoped, trendMonths);
    const forecast = cashFlowForecast(invoices, now);
    const reminders = reminderEffectiveness(invoices, start);
    return {
      clients,
      revenue,
      forecast,
      reminders,
      late: latePayments(invoices, start),
      spending: spendingByType(ledger.lines, scoped, start, currency),
      insights: insights({ invoices, clients, revenue, forecast, reminders, currency, periodLabel: label }),
    };
  }, [period, now, invoices, ledger.lines, scoped, currency]);

  const loading = accountsState === "loading" || allInvoices === null || ledger.state === "loading";
  const failed = invoiceError || ledger.state === "error";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-5 lg:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">From your invoices and transactions{scope !== "combined" ? ` · ${scope} wallet` : ""}.</p>
        <div className="overflow-x-auto">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {failed ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-12 text-center">
          <p className="text-sm text-muted-foreground">We couldn&apos;t load your analytics.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInvoiceAttempt((n) => n + 1);
              ledger.retry();
            }}
          >
            <RefreshCw className="size-4" /> Try again
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <AIInsightsFeed insights={data.insights} />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueTrendChart data={data.revenue} />
            </div>
            <CashFlowForecastCard buckets={data.forecast} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            <CollectionMetricsCard clients={data.clients} />
            <ConcentrationRiskCard clients={data.clients} currency={currency} />
            <InvoiceBehaviorCard reminders={data.reminders} latePayments={data.late} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ClientLeaderboardTable clients={data.clients} />
            </div>
            <ExpenseBreakdownCard categories={data.spending} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="relative">
              <SampleBadge className="absolute top-4 right-4 z-10" />
              <HealthScoreCard currentScore={currentHealthScore} history={healthScoreHistory} factors={healthScoreFactors} />
            </div>
            <div className="relative">
              <SampleBadge className="absolute top-4 right-4 z-10" />
              <GoalsProgressCard goals={goals} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;
