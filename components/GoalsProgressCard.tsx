"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { goalPace, PACE_LABEL } from "@/lib/goals";
import { formatDay } from "@/lib/invoicing";
import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { listGoals } from "@/services/goals";
import { Goal } from "@/types/goal";

/** Analytics: every active savings goal, how far along it is and whether it's on pace. */
export function GoalsProgressCard() {
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
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {failed && <p className="text-sm text-muted-foreground">Your goals couldn&apos;t be loaded right now.</p>}
        {!failed && goals === null && <Skeleton className="h-24" />}
        {goals?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No savings goals yet.{" "}
            <Link href="/dashboard/goals" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Start one
            </Link>
          </p>
        )}
        {goals?.map((goal) => {
          const pace = goalPace(goal);
          return (
            <Link key={goal.goal_id} href={`/dashboard/goals/${goal.goal_id}`} className="block hover:opacity-80">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="truncate text-sm text-foreground/90">{goal.name}</p>
                <p className="shrink-0 text-xs text-muted-foreground">by {formatDay(goal.target_date)}</p>
              </div>
              <Progress value={goal.progress_percent} className="h-2" />
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatMinor(goal.saved_minor, goal.currency_code)} of {formatMinor(goal.target_minor, goal.currency_code)}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    pace === "behind" ? "text-amber-700 dark:text-amber-400" : pace === "past_date" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  {goal.progress_percent}% · {PACE_LABEL[pace]}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
