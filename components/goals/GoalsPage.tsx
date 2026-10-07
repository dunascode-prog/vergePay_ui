"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CircleCheck, Laptop, Minus, PiggyBank, Plus, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { goalPace, GoalPace, MAX_ACTIVE_GOALS, monthlyNeeded, PACE_LABEL, savedByCurrency, timeLeft } from "@/lib/goals";
import { formatDay, moneyByCurrency } from "@/lib/invoicing";
import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { listGoals } from "@/services/goals";
import { Goal, GoalCategory } from "@/types/goal";
import { GoalFormDialog } from "./GoalFormDialog";
import { GoalMoneyDialog } from "./GoalMoneyDialog";

const primary = "bg-emerald-700 text-white hover:bg-emerald-800";

export const CATEGORY_ICON: Record<GoalCategory, React.ComponentType<{ className?: string }>> = {
  emergency_fund: ShieldCheck,
  equipment: Laptop,
  investment: TrendingUp,
  other: PiggyBank,
};

export const PACE_TONE: Record<GoalPace, string> = {
  funded: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  on_track: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  behind: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  past_date: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
};

/** /dashboard/goals: what you're saving towards, with real money in each goal. */
export function GoalsPage() {
  const { dataVersion } = useAppData();
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    listGoals("all")
      .then((list) => {
        if (!live) return;
        setGoals(list);
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your goals."));
    return () => {
      live = false;
    };
  }, [dataVersion, attempt]);

  if (error) {
    return (
      <div className="space-y-3">
        <ErrorNote>{error}</ErrorNote>
        <Button variant="outline" size="sm" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }
  if (goals === null) return <GoalsSkeleton />;

  const active = goals.filter((g) => g.goal_status === "active");
  const closed = goals.filter((g) => g.goal_status === "closed");
  const atLimit = active.length >= MAX_ACTIVE_GOALS;

  const newButton = (
    <GoalFormDialog
      onSaved={reload}
      trigger={
        <Button className={primary} disabled={atLimit}>
          <Plus className="size-4" /> New goal
        </Button>
      }
    />
  );

  if (!active.length && !closed.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card px-4 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Target className="size-5" aria-hidden />
        </span>
        <p className="mt-3 font-medium">Save towards something</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Set a target and a date. Money you add sits in the goal&apos;s own pot, apart from your wallet, and you can take it back out any time.
        </p>
        <div className="mt-4">{newButton}</div>
      </div>
    );
  }

  const saved = savedByCurrency(active);
  const funded = active.filter((g) => g.is_funded).length;
  const behind = active.filter((g) => ["behind", "past_date"].includes(goalPace(g))).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {atLimit ? `You have ${MAX_ACTIVE_GOALS} goals, the most at once. Close one to start another.` : "Each goal holds real money, apart from your wallet."}
        </p>
        {newButton}
      </div>

      {active.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Tile icon={PiggyBank} label="Saved in goals" value={moneyByCurrency(saved)} sub={`Across ${active.length} goal${active.length === 1 ? "" : "s"}`} />
          <Tile icon={CircleCheck} label="Fully funded" value={`${funded} of ${active.length}`} sub={funded ? "Target reached" : "None yet"} />
          <Tile
            className="col-span-2 lg:col-span-1"
            icon={CalendarClock}
            label="Need attention"
            value={String(behind)}
            sub={behind ? "Behind pace or past their date" : "Every goal is on pace"}
            warn={behind > 0}
          />
        </div>
      )}

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Active</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((g) => (
              <GoalCard key={g.goal_id} goal={g} onChanged={reload} />
            ))}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Closed</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {closed.map((g) => (
              <li key={g.goal_id}>
                <Link href={`/dashboard/goals/${g.goal_id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{g.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Saved {formatMinor(g.contributed_minor, g.currency_code)} in total · closed {formatDay(g.closed_at!)}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub, warn = false, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; warn?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-1.5 truncate text-xl font-semibold tracking-tight tabular-nums" title={value}>
        {value}
      </p>
      <p className={cn("mt-0.5 truncate text-xs", warn ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")} title={sub}>
        {sub}
      </p>
    </div>
  );
}

export function GoalProgress({ goal, className }: { goal: Goal; className?: string }) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-label={`${goal.name}: ${goal.progress_percent}% saved`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={goal.progress_percent}
    >
      <div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" style={{ width: `${goal.progress_percent}%` }} />
    </div>
  );
}

export function PaceBadge({ goal }: { goal: Goal }) {
  const pace = goalPace(goal);
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", PACE_TONE[pace])}>{PACE_LABEL[pace]}</span>;
}

/** One active goal: how far along it is, what it takes to finish on time, and moving money. */
function GoalCard({ goal, onChanged }: { goal: Goal; onChanged: () => void }) {
  const money = (minor: number) => formatMinor(minor, goal.currency_code);
  const Icon = CATEGORY_ICON[goal.category];
  const pace = goalPace(goal);
  const perMonth = monthlyNeeded(goal);

  return (
    <article className={cn("flex flex-col rounded-xl border bg-card p-4 sm:p-5", pace === "past_date" && "border-red-300 dark:border-red-900")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Icon className="size-4" />
          </span>
          <Link href={`/dashboard/goals/${goal.goal_id}`} className="min-w-0 hover:underline">
            <p className="truncate font-medium">{goal.name}</p>
          </Link>
        </div>
        <PaceBadge goal={goal} />
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{money(goal.saved_minor)}</p>
      <p className="text-xs text-muted-foreground">of {money(goal.target_minor)}</p>

      <GoalProgress goal={goal} className="mt-3" />
      <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          By {formatDay(goal.target_date)} ({timeLeft(goal.target_date)})
        </span>
        <span className="font-medium text-emerald-700 dark:text-emerald-400">{goal.progress_percent}%</span>
      </div>

      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
        {goal.is_funded
          ? "Target reached. Keep saving, or withdraw when you need it."
          : pace === "past_date"
            ? `${money(goal.remaining_minor)} short. Move the date or keep adding.`
            : `Save ${money(perMonth)} a month to make it.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <GoalMoneyDialog
          goal={goal}
          direction="in"
          onMoved={onChanged}
          trigger={
            <Button className={cn(primary, "flex-1")}>
              <Plus className="size-4" /> Add money
            </Button>
          }
        />
        <GoalMoneyDialog
          goal={goal}
          direction="out"
          onMoved={onChanged}
          trigger={
            <Button variant="outline" disabled={goal.saved_minor === 0}>
              <Minus className="size-4" /> Withdraw
            </Button>
          }
        />
        <Link href={`/dashboard/goals/${goal.goal_id}`} className={buttonVariants({ variant: "ghost" })} aria-label={`${goal.name}: details`}>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function GoalsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-64" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
