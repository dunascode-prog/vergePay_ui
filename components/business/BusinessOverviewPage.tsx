"use client";

import { Briefcase, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { useAccountScope, useAppData } from "@/components/app-data";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { useLedgerLines } from "@/components/dashboard/useLedgerLines";
import { ExpenseBreakdownCard } from "@/components/ExpenseBreakdownCard";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clientShares, spendingByType } from "@/lib/analytics";
import { attentionItems, businessHealth, isMoneyOut, isRevenue, ledgerFrom, monthlyRevenueAndOut, receivables, startOfYear, yearTotals } from "@/lib/business";
import { balanceTrend, flowTrend, invoiceBalanceAt, mainCurrency, MoneyEvent, unpaidAt } from "@/lib/trends";
import { currenciesOf, lastMonths, scopedWallets, walletsOf } from "@/lib/ledger";
import { listAllInvoices, listClients } from "@/services/invoices";
import { listRecurringPlans } from "@/services/recurring";
import { Currency } from "@/types/invoice";
import { ApiClient, ApiInvoice } from "@/types/invoicing";
import { ApiRecurringPlan } from "@/types/recurring";
import { BusinessHealthScoreCard } from "./BusinessHealthScoreCard";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import { RecurringRevenueCard } from "./RecurringRevenueCard";
import { TopClientsCard } from "./TopClientsCard";
import { WalletBalancesCard } from "./WalletBalancesCard";
import { pageClass } from "@/lib/layout";

interface Book {
  invoices: ApiInvoice[];
  plans: ApiRecurringPlan[];
  clients: ApiClient[];
}

/**
 * /dashboard/business: how the business is doing, from the ledger of the
 * wallets in view (Personal / Business / Combined), the invoices and plans
 * paid into them, and the client book.
 */
export function BusinessOverviewPage() {
  const { accounts, accountsState, reloadAccounts, dataVersion } = useAppData();
  const [scope] = useAccountScope();

  const wallets = useMemo(() => scopedWallets(walletsOf(accounts), scope), [accounts, scope]);
  const scopedIds = useMemo(() => wallets.map((w) => w.account_id), [wallets]);
  const scoped = useMemo(() => new Set(scopedIds), [scopedIds]);
  // every account of yours: moves between them are neither revenue nor money out
  const own = useMemo(() => new Set(accounts.map((a) => a.account_id)), [accounts]);

  const currencies = useMemo(() => currenciesOf(wallets), [wallets]);
  const [picked, setPicked] = useState<string | null>(null);
  const currency = (picked && currencies.includes(picked) ? picked : (currencies[0] ?? "NGN")) as Currency;

  // a stable "now" per load, so dates don't shift between renders
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock moves on when data is reloaded
    setNow(new Date());
  }, [dataVersion]);

  const ledger = useLedgerLines(scopedIds, dataVersion, ledgerFrom(now));

  const [book, setBook] = useState<Book | null>(null);
  const [bookError, setBookError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.all([listAllInvoices("issued"), listRecurringPlans(), listClients()])
      .then(([invoices, plans, clients]) => {
        if (!live) return;
        setBook({ invoices, plans, clients });
        setBookError(false);
      })
      .catch(() => live && setBookError(true));
    return () => {
      live = false;
    };
  }, [dataVersion, attempt]);

  const data = useMemo(() => {
    // only what's paid into the wallets in view
    const invoices = (book?.invoices ?? []).filter((i) => scoped.has(i.issuer_account_id));
    const plans = (book?.plans ?? []).filter((p) => scoped.has(p.issuer_account_id));
    const { owed, overdue } = receivables(invoices);
    const totals = yearTotals(ledger.lines, scoped, own, now);
    const lines = ledger.lines;
    const events = (pick: (l: (typeof lines)[number]) => boolean): MoneyEvent[] =>
      lines.filter(pick).map((l) => ({ at: new Date(l.created_at).getTime(), minor: l.amount_minor, currency: l.currency_code }));
    const at = now.getTime();
    return {
      trends: {
        revenue: flowTrend(events((l) => isRevenue(l, scoped, own)), mainCurrency(totals.revenue), "up", at),
        moneyOut: flowTrend(events((l) => isMoneyOut(l, scoped, own)), mainCurrency(totals.moneyOut), "down", at),
        owed: balanceTrend(invoiceBalanceAt(invoices, mainCurrency(owed), unpaidAt), "down", at),
      },
      plans,
      owed,
      overdue,
      totals,
      flows: monthlyRevenueAndOut(ledger.lines, scoped, own, currency, lastMonths(6, now)),
      health: businessHealth({ lines: ledger.lines, scoped, own, wallets, invoices, currency, now }),
      topClients: clientShares(invoices, startOfYear(now)).slice(0, 5),
      spending: spendingByType(ledger.lines, scoped, startOfYear(now), currency, own),
      attention: attentionItems(invoices, plans, book?.clients ?? []),
    };
  }, [book, scoped, own, ledger.lines, now, currency, wallets]);

  if (accountsState === "error") {
    return <Retry message="We couldn't load your wallets." onRetry={() => void reloadAccounts()} />;
  }
  if (accountsState === "ready" && wallets.length === 0) {
    return <NoWalletInView />;
  }
  if (bookError || ledger.state === "error") {
    return (
      <Retry
        message="We couldn't load your business overview."
        onRetry={() => {
          setAttempt((n) => n + 1);
          ledger.retry();
        }}
      />
    );
  }
  if (accountsState === "loading" || book === null || ledger.state === "loading") return <BusinessSkeleton />;

  return (
    <div className={pageClass()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          This year so far{scope !== "combined" ? ` · ${scope} wallet` : ""}. Moves between your own wallets aren&apos;t counted.
        </p>
        {currencies.length > 1 && (
          <SegmentedToggle options={currencies.map((c) => ({ value: c, label: c }))} value={currency} onChange={setPicked} aria-label="Currency" />
        )}
      </div>

      <FinancialSummaryCards totals={data.totals} owed={data.owed} overdue={data.overdue} trends={data.trends} />

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6">
          <CashFlowChart
            flows={data.flows}
            currency={currency}
            title="Revenue and money out"
            description={`The last 6 months (${currency})`}
          />
          <NeedsAttentionCard items={data.attention} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <TopClientsCard clients={data.topClients} />
            <RecurringRevenueCard plans={data.plans} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <BusinessHealthScoreCard health={data.health} />
          <WalletBalancesCard wallets={wallets} />
          <ExpenseBreakdownCard categories={data.spending} />
        </div>
      </div>
    </div>
  );
}

function Retry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}

/** The Business view with no business wallet yet. */
function NoWalletInView() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <Briefcase className="size-5" aria-hidden />
      </span>
      <div>
        <p className="font-medium">No business wallet yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep business money apart from personal money, with its own account number. Or switch to Combined to see everything.
        </p>
      </div>
      <AddWalletDialog
        purpose="business"
        trigger={
          <Button className="bg-emerald-700 text-white hover:bg-emerald-800">
            <Plus className="size-4" /> Add a business wallet
          </Button>
        }
      />
    </div>
  );
}

/** Also the route's loading.tsx. */
export function BusinessSkeleton() {
  return (
    <div className={pageClass()} aria-busy>
      <Skeleton className="h-5 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
