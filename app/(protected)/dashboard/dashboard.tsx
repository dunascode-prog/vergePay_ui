"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { AuthNotice } from "@/components/auth/fields";
import { useAccountScope, useAppData } from "@/components/app-data";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { WalletCards } from "@/components/dashboard/WalletCards";
import {
  ClientHealthCard,
  GoalsCard,
  QuickActions,
  UpcomingBillingCard,
} from "@/components/dashboard/SampleWidgets";
import AiSummaryCard from "@/components/ai_component_card";
import { AIEnvelopeSummary } from "@/components/ai_envelope_summary";
import OutstandingInvoiceCard from "@/components/invoice_card";
import { InvestmentsCard } from "@/components/investments/InvestmentsCard";
import { LinkReminder } from "@/components/investments/LinkReminder";
import { useBrokerage } from "@/components/investments/useBrokerage";
import { useLedgerLines } from "@/components/dashboard/useLedgerLines";
import {
  currenciesOf,
  lastMonths,
  monthlyBalances,
  monthlyFlows,
  monthsAgoStart,
  scopedWallets,
  walletsOf,
} from "@/lib/ledger";

const MONTHS = 6;
const RECENT = 8;

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-1.5 size-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6" aria-busy="true" aria-label="Loading your dashboard">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

const LINK_FAILED: Record<string, string> = {
  access_denied: "You declined the connection on Alpaca, so nothing was linked.",
  expired_or_used_state: "That connection attempt expired. Please try linking again.",
};

/** The outcome of an Alpaca approval, after the API sends the browser back here. */
function BrokerageResult() {
  const params = useSearchParams();
  const result = params.get("brokerage");
  if (result === "linked") return <AuthNotice tone="info">Your Alpaca account is linked. Your holdings are syncing now.</AuthNotice>;
  if (result === "failed") {
    return (
      <AuthNotice tone="error">
        {LINK_FAILED[params.get("reason") ?? ""] ?? "We couldn't link your Alpaca account. Please try again."}
      </AuthNotice>
    );
  }
  return null;
}

export default function Dashboard() {
  const { accounts, accountsState, reloadAccounts, dataVersion } = useAppData();
  const [scope] = useAccountScope();
  const brokerage = useBrokerage();

  const wallets = useMemo(() => walletsOf(accounts), [accounts]);
  const scoped = useMemo(() => scopedWallets(wallets, scope), [wallets, scope]);
  const scopedIds = useMemo(() => scoped.map((a) => a.account_id), [scoped]);
  const ledger = useLedgerLines(scopedIds, dataVersion, monthsAgoStart(MONTHS));

  const currencies = useMemo(() => currenciesOf(scoped), [scoped]);
  const [pickedCurrency, setPickedCurrency] = useState<string | null>(null);
  const currency = pickedCurrency && currencies.includes(pickedCurrency) ? pickedCurrency : currencies[0];

  const months = useMemo(() => lastMonths(MONTHS), []);
  const flows = useMemo(
    () => (currency ? monthlyFlows(ledger.lines, new Set(scopedIds), currency, months) : []),
    [ledger.lines, scopedIds, currency, months],
  );
  const balances = useMemo(
    () => (currency ? monthlyBalances(ledger.lines, scoped, currency, months) : []),
    [ledger.lines, scoped, currency, months],
  );
  const recent = useMemo(
    () => [...ledger.lines].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, RECENT),
    [ledger.lines],
  );

  if (accountsState === "loading") return <DashboardSkeleton />;
  if (accountsState === "error") {
    return <ErrorCard message="We couldn't load your wallets." onRetry={() => void reloadAccounts()} />;
  }

  const showBusiness = scope !== "personal";
  const showPersonal = scope !== "business";
  const hasWalletInView = scoped.length > 0;

  const currencyPicker =
    currencies.length > 1 ? (
      <SegmentedToggle
        options={currencies.map((c) => ({ value: c, label: c }))}
        value={currency}
        onChange={setPickedCurrency}
        aria-label="Currency"
      />
    ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-5 lg:gap-6">
      <BrokerageResult />
      <LinkReminder brokerage={brokerage} />

      {hasWalletInView && ledger.state === "loading" && <Skeleton className="h-44 w-full rounded-xl" />}
      {hasWalletInView && ledger.state === "error" && (
        <ErrorCard message="We couldn't load your transactions." onRetry={ledger.retry} />
      )}
      {hasWalletInView && ledger.state === "ready" && (
        <PerformanceOverview currency={currency} flows={flows} balances={balances} currencyPicker={currencyPicker} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:items-start lg:gap-6">
        {/* Main column: the real money */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-2 lg:gap-6">
          <section aria-label="Your wallets">
            <WalletCards wallets={wallets} scope={scope} />
          </section>

          {hasWalletInView && ledger.state === "ready" && (
            <>
              <CashFlowChart flows={flows} currency={currency} />
              <RecentTransactions lines={recent} accounts={accounts} showAccount={scoped.length > 1} />
            </>
          )}

          <AiSummaryCard />
        </div>

        {/* Side rail: investments, then the sample widgets for this view */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
          <InvestmentsCard brokerage={brokerage} />
          {showBusiness && <ClientHealthCard />}
          {showBusiness && <UpcomingBillingCard />}
          {showBusiness && <OutstandingInvoiceCard />}
          {showPersonal && <GoalsCard />}
          {showPersonal && <AIEnvelopeSummary />}
          <QuickActions scope={scope} />
        </div>
      </div>
    </div>
  );
}
