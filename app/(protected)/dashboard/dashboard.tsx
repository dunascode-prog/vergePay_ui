"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { useAccountScope, useAppData } from "@/components/app-data";
import { OpenAccountDialog } from "@/components/accounts/OpenAccountDialog";
import { AccountCards } from "@/components/dashboard/AccountCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { listAccountTransactionsSince } from "@/services/accounts";
import {
  currenciesOf,
  inScope,
  isWallet,
  lastMonths,
  monthlyBalances,
  monthlyFlows,
  monthsAgoStart,
  purposeLabel,
} from "@/lib/ledger";
import { ScopedTransaction } from "@/types/account";

const MONTHS = 6;
const RECENT = 8;

type LoadState = "loading" | "ready" | "error";

// Ledger lines for these accounts over the last six months. Keyed on the
// account ids, so it refetches when an account is opened, not on every render.
function useLedgerLines(accountIds: string[]) {
  const key = accountIds.join(",");
  const [lines, setLines] = useState<ScopedTransaction[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const ids = key ? key.split(",") : [];
    const from = monthsAgoStart(MONTHS);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start of a fetch
    setState("loading");
    Promise.all(
      ids.map(async (id) =>
        (await listAccountTransactionsSince(id, from)).map((line) => ({ ...line, account_id: id })),
      ),
    )
      .then((perAccount) => {
        if (cancelled) return;
        setLines(perAccount.flat());
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  return { lines, state, retry: () => setAttempt((n) => n + 1) };
}

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

function Welcome({ purpose }: { purpose: "personal" | "business" | null }) {
  const title = purpose ? `No ${purpose} accounts yet` : "Open your first account";
  const body = purpose
    ? `Open a ${purpose} account to see its balance, cash flow and transactions here.`
    : "Your VergePay account number, balance and cash flow will live here. It takes a few seconds and starts at zero.";
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{body}</p>
        </div>
        <OpenAccountDialog
          defaultPurpose={purpose ?? "personal"}
          trigger={
            <Button className="bg-emerald-700 text-white hover:bg-emerald-800">
              <Plus className="mr-1.5 size-4" />
              Open an account
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { accounts, accountsState, reloadAccounts } = useAppData();
  const [scope] = useAccountScope();

  const allWallets = useMemo(() => accounts.filter(isWallet), [accounts]);
  const scoped = useMemo(() => allWallets.filter((a) => inScope(a, scope)), [allWallets, scope]);
  const scopedIds = useMemo(() => scoped.map((a) => a.account_id), [scoped]);
  const ledger = useLedgerLines(scopedIds);

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
    () =>
      [...ledger.lines]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, RECENT),
    [ledger.lines],
  );

  if (accountsState === "loading") return <DashboardSkeleton />;
  if (accountsState === "error") {
    return <ErrorCard message="We couldn't load your accounts." onRetry={() => void reloadAccounts()} />;
  }
  if (allWallets.length === 0) return <Welcome purpose={null} />;
  if (scoped.length === 0) return <Welcome purpose={scope === "combined" ? null : scope} />;

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
      {ledger.state === "loading" && <Skeleton className="h-44 w-full rounded-xl" />}
      {ledger.state === "error" && (
        <ErrorCard message="We couldn't load your transactions." onRetry={ledger.retry} />
      )}
      {ledger.state === "ready" && (
        <PerformanceOverview currency={currency} flows={flows} balances={balances} currencyPicker={currencyPicker} />
      )}

      <section aria-labelledby="accounts-heading" className="space-y-3">
        <h2 id="accounts-heading" className="text-sm font-semibold text-muted-foreground">
          {scope === "combined" ? "Your accounts" : `${purposeLabel(scope)} accounts`}
        </h2>
        <AccountCards accounts={scoped} defaultPurpose={scope === "business" ? "business" : "personal"} />
      </section>

      {ledger.state === "ready" && (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <CashFlowChart flows={flows} currency={currency} />
          </div>
          <div className="xl:col-span-2">
            <RecentTransactions lines={recent} accounts={accounts} showAccount={scoped.length > 1} />
          </div>
        </div>
      )}
    </div>
  );
}
