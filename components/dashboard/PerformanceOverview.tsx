"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/sparkline";
import { cn } from "@/lib/utils";
import { formatMinor, MonthFlow, percentChange } from "@/lib/ledger";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface Props {
  currency: string;
  flows: MonthFlow[]; // oldest → this month
  balances: number[]; // closing balance per month, same order
  currencyPicker?: React.ReactNode;
}

type Tone = "good" | "bad" | "neutral";

function Stat({
  title,
  value,
  exact,
  change,
  tone,
  chart,
}: {
  title: string;
  value: string;
  exact: string;
  change: string;
  tone: Tone;
  chart: React.ReactNode;
}) {
  const Icon = tone === "good" ? TrendingUp : tone === "bad" ? TrendingDown : Minus;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight tabular-nums sm:text-3xl" title={exact}>
            {value}
          </p>
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs sm:text-sm",
              tone === "good" && "text-emerald-700 dark:text-emerald-400",
              tone === "bad" && "text-red-600 dark:text-red-400",
              tone === "neutral" && "text-muted-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{change}</span>
          </p>
        </div>
        {chart && <div className="hidden h-12 w-20 shrink-0 overflow-hidden sm:block">{chart}</div>}
      </div>
    </div>
  );
}

/** "+12% vs Aug", with a tone that depends on whether up is good for this number. */
function comparison(current: number, previous: number, previousLabel: string, upIsGood: boolean) {
  const pct = percentChange(current, previous);
  if (pct === null) {
    return { change: `No ${previousLabel} data`, tone: "neutral" as Tone };
  }
  if (pct === 0) return { change: `Same as ${previousLabel}`, tone: "neutral" as Tone };
  const up = pct > 0;
  return {
    change: `${up ? "+" : ""}${pct}% vs ${previousLabel}`,
    tone: (up === upIsGood ? "good" : "bad") as Tone,
  };
}

export function PerformanceOverview({ currency, flows, balances, currencyPicker }: Props) {
  const now = flows[flows.length - 1];
  const prev = flows[flows.length - 2];
  const money = (minor: number) => formatMinor(minor, currency, { compact: true });
  const exact = (minor: number) => formatMinor(minor, currency);
  const series = (values: number[]) =>
    values.map((value, i) => ({ value: value / 100, label: flows[i].label }));
  const fmtMajor = (major: number) => formatMinor(Math.round(major * 100), currency, { compact: true });

  const income = comparison(now.income, prev.income, prev.label, true);
  const spent = comparison(now.spent, prev.spent, prev.label, false);
  const balanceNow = balances[balances.length - 1];
  const balancePrev = balances[balances.length - 2];
  const balance = comparison(balanceNow, balancePrev, prev.label, true);
  // A trend needs at least two months with something in them.
  const hasTrend = flows.filter((f) => f.income !== 0 || f.spent !== 0).length >= 2;
  const spark = (values: number[], color: string) =>
    hasTrend ? <Sparkline data={series(values)} color={color} formatValue={fmtMajor} /> : null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Performance overview</CardTitle>
          <CardDescription>{now.label} so far, from your ledger</CardDescription>
        </div>
        {currencyPicker}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 xl:grid-cols-4">
          <Stat
            title="Income"
            value={money(now.income)}
            exact={exact(now.income)}
            {...income}
            chart={spark(flows.map((f) => f.income), "var(--chart-income)")}
          />
          <Stat
            title="Spent"
            value={money(now.spent)}
            exact={exact(now.spent)}
            {...spent}
            chart={spark(flows.map((f) => f.spent), "var(--chart-spending)")}
          />
          <Stat
            title="Net"
            value={formatMinor(now.net, currency, { compact: true, signed: true })}
            exact={formatMinor(now.net, currency, { signed: true })}
            change={now.net >= 0 ? "More in than out" : "More out than in"}
            tone={now.net > 0 ? "good" : now.net < 0 ? "bad" : "neutral"}
            chart={spark(flows.map((f) => f.net), "var(--chart-income)")}
          />
          <Stat
            title="Balance"
            value={money(balanceNow)}
            exact={exact(balanceNow)}
            {...balance}
            chart={spark(balances, "var(--chart-income)")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
