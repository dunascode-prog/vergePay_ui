"use client";

import { AlertTriangle, Ban, EllipsisVertical, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api";
import { formatDay, money } from "@/lib/invoicing";
import { FREQUENCY_LABEL } from "@/lib/recurring";
import { cn } from "@/lib/utils";
import { cancelRecurringPlan, pauseRecurringPlan, resumeRecurringPlan } from "@/services/recurring";
import { ApiRecurringPlan, RecurringStatus } from "@/types/recurring";
import { RecurringStatusBadge } from "./RecurringStatusBadge";

type Filter = "all" | RecurringStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

/** The customer's plans, with pause, resume and cancel on each row. */
export function RecurringPlansTable({ plans, onChanged }: { plans: ApiRecurringPlan[]; onChanged: (plan: ApiRecurringPlan) => void }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ApiRecurringPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => plans.filter((p) => filter === "all" || p.plan_status === filter), [plans, filter]);
  const count = (f: Filter) => (f === "all" ? plans.length : plans.filter((p) => p.plan_status === f).length);

  const run = async (plan: ApiRecurringPlan, action: (id: string) => Promise<ApiRecurringPlan>) => {
    setBusyId(plan.plan_id);
    setError(null);
    try {
      onChanged(await action(plan.plan_id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label="Filter plans">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground",
              filter === f.value && "bg-muted font-medium text-foreground",
            )}
          >
            {f.label} <span className="text-xs tabular-nums text-muted-foreground">{count(f.value)}</span>
          </button>
        ))}
      </div>

      {error && <p className="border-b px-4 py-2.5 text-sm text-destructive">{error}</p>}

      {shown.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">
          {filter === "all" ? "No plans yet. A plan sends an invoice to a client on a schedule, so you don't have to." : `No ${filter} plans.`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-normal">Client</th>
                <th className="hidden px-4 py-2.5 font-normal md:table-cell">Frequency</th>
                <th className="px-4 py-2.5 text-right font-normal">Amount</th>
                <th className="hidden px-4 py-2.5 font-normal sm:table-cell">Next invoice</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map((plan) => {
                const busy = busyId === plan.plan_id;
                const href = `/dashboard/recurring/${plan.plan_id}`;
                return (
                  <tr key={plan.plan_id} className={cn("cursor-pointer hover:bg-muted/40", busy && "opacity-60")} onClick={() => router.push(href)}>
                    <td className="max-w-[16rem] px-4 py-3">
                      <Link href={href} onClick={(e) => e.stopPropagation()} className="block truncate font-medium hover:underline">
                        {plan.client.name}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">{plan.description}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{FREQUENCY_LABEL[plan.frequency]}</td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap tabular-nums">{money(plan.amount_minor, plan.currency_code)}</td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground sm:table-cell">
                      {plan.plan_status === "active" && plan.next_billing_date ? formatDay(plan.next_billing_date) : "—"}
                      {plan.plan_status === "active" && plan.last_error && (
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300" title={plan.last_error}>
                          <AlertTriangle className="size-3" /> Last invoice didn&apos;t send
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RecurringStatusBadge status={plan.plan_status} />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {plan.plan_status !== "cancelled" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => run(plan, plan.plan_status === "paused" ? resumeRecurringPlan : pauseRecurringPlan)}
                            className="hidden sm:inline-flex"
                          >
                            {plan.plan_status === "paused" ? (
                              <>
                                <Play className="size-3.5" /> Resume
                              </>
                            ) : (
                              <>
                                <Pause className="size-3.5" /> Pause
                              </>
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" disabled={busy} aria-label={`More for ${plan.client.name}`} className="text-muted-foreground">
                                  <EllipsisVertical className="size-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="sm:hidden" onClick={() => run(plan, plan.plan_status === "paused" ? resumeRecurringPlan : pauseRecurringPlan)}>
                                {plan.plan_status === "paused" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                                {plan.plan_status === "paused" ? "Resume" : "Pause"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setCancelTarget(plan)}>
                                <Ban className="size-3.5" /> Cancel plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && (
                <>
                  No more invoices go to <strong>{cancelTarget.client.name}</strong> for {cancelTarget.description}. Invoices already sent stay as they
                  are. This can&apos;t be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                const plan = cancelTarget;
                setCancelTarget(null);
                if (plan) void run(plan, cancelRecurringPlan);
              }}
            >
              Cancel plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
