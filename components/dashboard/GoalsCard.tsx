"use client";

import Link from "next/link";
import { ArrowRight, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { listGoals } from "@/services/goals";
import { Goal } from "@/types/goal";

const SHOWN = 3;

/** Home: the goals due soonest, with what each has saved. */
export function GoalsCard() {
  const { dataVersion } = useAppData();
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    listGoals("active")
      .then((list) => {
        if (!live) return;
        setGoals([...list].sort((a, b) => a.target_date.localeCompare(b.target_date)));
        setFailed(false);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [dataVersion]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4 text-emerald-700" aria-hidden />
          Goals
        </CardTitle>
        <CardDescription>What you&apos;re saving towards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {failed ? (
          <p className="text-sm text-muted-foreground">Your goals couldn&apos;t be loaded right now.</p>
        ) : goals === null ? (
          <div className="space-y-3">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        ) : goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Set a target and a date, and put money aside for it apart from your wallet.</p>
        ) : (
          goals.slice(0, SHOWN).map((goal) => (
            <Link key={goal.goal_id} href={`/dashboard/goals/${goal.goal_id}`} className="block space-y-1.5 rounded-md hover:opacity-80">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{goal.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatMinor(goal.saved_minor, goal.currency_code, { compact: true })} of{" "}
                  {formatMinor(goal.target_minor, goal.currency_code, { compact: true })} · {goal.progress_percent}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={goal.name}
                aria-valuenow={goal.progress_percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-emerald-700" style={{ width: `${goal.progress_percent}%` }} />
              </div>
            </Link>
          ))
        )}
        <Link href="/dashboard/goals" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full text-emerald-700")}>
          {goals?.length === 0 ? (
            <>
              <Plus className="mr-1 size-4" /> Start a goal
            </>
          ) : (
            <>
              {goals && goals.length > SHOWN ? `All ${goals.length} goals` : "Manage goals"} <ArrowRight className="ml-1 size-4" />
            </>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
