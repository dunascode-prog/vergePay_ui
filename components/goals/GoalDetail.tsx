"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Minus, Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { GOAL_CATEGORY_LABEL, goalPace, monthlyNeeded, timeLeft } from "@/lib/goals";
import { formatDateTime, formatDay } from "@/lib/invoicing";
import { formatMinor, walletName } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { getGoal } from "@/services/goals";
import { GoalDetail as GoalDetailData } from "@/types/goal";
import { CloseGoalDialog } from "./CloseGoalDialog";
import { GoalFormDialog } from "./GoalFormDialog";
import { GoalMoneyDialog } from "./GoalMoneyDialog";
import { CATEGORY_ICON, GoalProgress, PaceBadge } from "./GoalsPage";
import { pageClass } from "@/lib/layout";

const primary = "bg-emerald-700 text-white hover:bg-emerald-800";

/** /dashboard/goals/[id]: one goal, every move in and out of it, editing and closing. */
export function GoalDetail({ goalId }: { goalId: string }) {
  const { dataVersion } = useAppData();
  const [goal, setGoal] = useState<GoalDetailData | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    getGoal(goalId)
      .then((g) => {
        if (!live) return;
        setGoal(g);
        setError(null);
      })
      .catch(
        (err) =>
          live &&
          setError({
            message: err instanceof ApiError ? err.message : "We couldn't load this goal.",
            notFound: err instanceof ApiError && err.status === 404,
          }),
      );
    return () => {
      live = false;
    };
  }, [goalId, dataVersion, attempt]);

  const back = (
    <Link href="/dashboard/goals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Goals
    </Link>
  );

  if (error) {
    return (
      <div className={pageClass("narrow")}>
        {back}
        <ErrorNote>{error.notFound ? "This goal doesn't exist, or isn't yours." : error.message}</ErrorNote>
        {!error.notFound && (
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  if (!goal) {
    return (
      <div className={pageClass("narrow")}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const money = (minor: number) => formatMinor(minor, goal.currency_code);
  const Icon = CATEGORY_ICON[goal.category];
  const isActive = goal.goal_status === "active";
  const pace = goalPace(goal);

  return (
    <div className={pageClass("narrow", { stack: false })}>
      {back}

      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">{goal.name}</h1>
              <p className="text-xs text-muted-foreground">
                {GOAL_CATEGORY_LABEL[goal.category]} goal · account {goal.account_number}
              </p>
            </div>
          </div>
          {isActive ? <PaceBadge goal={goal} /> : <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Closed</span>}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{money(goal.saved_minor)}</p>
            <p className="text-sm text-muted-foreground">saved of {money(goal.target_minor)}</p>
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{goal.progress_percent}%</p>
        </div>
        <GoalProgress goal={goal} className="mt-3" />

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Fact label="Target date" value={formatDay(goal.target_date)} sub={isActive ? timeLeft(goal.target_date) : undefined} />
          <Fact
            label={isActive ? "To stay on pace" : "Status"}
            value={isActive ? (goal.is_funded ? "Done" : `${money(monthlyNeeded(goal))}/mo`) : `Closed ${formatDay(goal.closed_at!)}`}
            warn={isActive && pace === "past_date"}
          />
          <Fact label="Added in total" value={money(goal.contributed_minor)} sub={`${goal.contribution_count} time${goal.contribution_count === 1 ? "" : "s"}`} />
          <Fact label="Withdrawn" value={money(goal.withdrawn_minor)} />
        </dl>

        {isActive && (
          <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
            <GoalMoneyDialog goal={goal} direction="in" onMoved={reload} trigger={<Button className={primary}><Plus className="size-4" /> Add money</Button>} />
            <GoalMoneyDialog
              goal={goal}
              direction="out"
              onMoved={reload}
              trigger={
                <Button variant="outline" disabled={goal.saved_minor === 0}>
                  <Minus className="size-4" /> Withdraw
                </Button>
              }
            />
            <GoalFormDialog goal={goal} onSaved={reload} trigger={<Button variant="outline"><Pencil className="size-4" /> Edit</Button>} />
            <CloseGoalDialog goal={goal} onClosed={reload} />
          </div>
        )}
      </section>

      <section className="mt-5 space-y-2 sm:mt-6">
        <h2 className="text-sm font-semibold">Activity</h2>
        {goal.activity.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">Nothing added yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {goal.activity.map((a) => {
              const into = a.kind === "contribution";
              const wallet = a.wallet_purpose ? walletName(a.wallet_purpose) : "a wallet";
              return (
                <li key={a.transaction_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        into ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {into ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{into ? `Added from your ${wallet.toLowerCase()}` : `Withdrawn to your ${wallet.toLowerCase()}`}</span>
                      <span className="block text-xs text-muted-foreground">{formatDateTime(a.created_at)}</span>
                    </span>
                  </span>
                  <span className="text-right">
                    <span className={cn("block font-medium tabular-nums", into && "text-emerald-700 dark:text-emerald-400")}>
                      {into ? "+" : "−"}
                      {money(a.amount_minor)}
                    </span>
                    <span className="block text-xs text-muted-foreground tabular-nums">{money(a.balance_after_minor)} in goal</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value, sub, warn = false }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-medium tabular-nums", warn && "text-red-600 dark:text-red-400")}>{value}</dd>
      {sub && <dd className="text-xs text-muted-foreground">{sub}</dd>}
    </div>
  );
}
