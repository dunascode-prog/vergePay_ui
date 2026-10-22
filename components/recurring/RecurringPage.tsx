"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { listRecurringPlans } from "@/services/recurring";
import { ApiRecurringPlan } from "@/types/recurring";
import { RecurringPlansTable } from "./RecurringPlansTable";
import { RecurringSummaryCards } from "./RecurringSummaryCards";
import { pageClass } from "@/lib/layout";

/** /dashboard/recurring: plans that invoice clients on a schedule. */
export function RecurringPage() {
  const { dataVersion } = useAppData();
  const [plans, setPlans] = useState<ApiRecurringPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // refetched when something changes (dataVersion): a plan sending an invoice
  // arrives as a notification
  useEffect(() => {
    let live = true;
    listRecurringPlans()
      .then((p) => {
        if (!live) return;
        setPlans(p);
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your plans."));
    return () => {
      live = false;
    };
  }, [dataVersion]);

  const replace = (updated: ApiRecurringPlan) => setPlans((ps) => (ps ?? []).map((p) => (p.plan_id === updated.plan_id ? updated : p)));

  return (
    <div className={pageClass()}>
      <p className="max-w-xl text-sm text-muted-foreground">
        Bill a client the same amount on a schedule. Each invoice goes out by itself, with a pay link, and you&apos;re told when it does.
      </p>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : plans === null ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </>
      ) : (
        <>
          <RecurringSummaryCards plans={plans} />
          <RecurringPlansTable plans={plans} onChanged={replace} />
        </>
      )}
    </div>
  );
}
