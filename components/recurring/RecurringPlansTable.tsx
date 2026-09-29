"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { RecurringPlan, RecurringStatus } from "@/types/recurring";
import { RecurringStatusBadge } from "./RecurringStatusBadge";
import { formatMoney, formatShortDate } from "@/lib/format";
import { LuPause, LuPlay, LuEllipsisVertical, LuBan } from "react-icons/lu";

interface RecurringPlansTableProps {
  plans: RecurringPlan[];
  onPause: (id: string) => Promise<void>;
  onResume: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

type Filter = "all" | RecurringStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

const FREQUENCY_LABEL: Record<RecurringPlan["frequency"], string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function RecurringPlansTable({
  plans,
  onPause,
  onResume,
  onCancel,
}: RecurringPlansTableProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RecurringPlan | null>(null);

  const visible = useMemo(
    () => plans.filter((plan) => filter === "all" || plan.status === filter),
    [plans, filter],
  );

  async function handlePauseOrResume(plan: RecurringPlan) {
    setPendingId(plan.id);
    if (plan.status === "paused") {
      await onResume(plan.id);
    } else {
      await onPause(plan.id);
    }
    setPendingId(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    const id = cancelTarget.id;
    setPendingId(id);
    await onCancel(id);
    setPendingId(null);
    setCancelTarget(null);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-sm">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Next billing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableHead
                  colSpan={7}
                  className="h-24 text-center text-sm font-normal text-gray-400"
                >
                  {filter === "all"
                    ? "No recurring plans yet — create one to get started."
                    : `No ${filter} plans.`}
                </TableHead>
              </TableRow>
            ) : (
              visible.map((plan) => {
                const rowBusy = pendingId === plan.id;
                return (
                  <TableRow
                    key={plan.id}
                    className={rowBusy ? "opacity-60" : undefined}
                  >
                    <TableCell className="font-medium text-gray-800">
                      <Link
                        href={`/dashboard/recurring/${plan.id}`}
                        className="hover:underline"
                      >
                        {plan.client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-500 max-w-[220px] truncate">
                      {plan.description}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {FREQUENCY_LABEL[plan.frequency]}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatMoney(plan.amount, plan.currency)}
                    </TableCell>
                    <TableCell className="text-gray-500 whitespace-nowrap">
                      {formatShortDate(plan.nextBillingDate)}
                    </TableCell>
                    <TableCell>
                      <RecurringStatusBadge status={plan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {plan.status !== "cancelled" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={rowBusy}
                            onClick={() => handlePauseOrResume(plan)}
                          >
                            {rowBusy ? (
                              "Updating…"
                            ) : plan.status === "paused" ? (
                              <>
                                <LuPlay className="h-3.5 w-3.5 mr-1.5" />
                                Resume
                              </>
                            ) : (
                              <>
                                <LuPause className="h-3.5 w-3.5 mr-1.5" />
                                Pause
                              </>
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400"
                                  disabled={rowBusy}
                                >
                                  <LuEllipsisVertical className="h-4 w-4" />
                                </Button>
                              }
                            />

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setCancelTarget(plan)}
                              >
                                <LuBan className="h-3.5 w-3.5 mr-2" />
                                Cancel plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this recurring plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && (
                <>
                  This stops future billing for{" "}
                  <strong>{cancelTarget.client.name}</strong> (
                  {formatMoney(cancelTarget.amount, cancelTarget.currency)} /{" "}
                  {FREQUENCY_LABEL[cancelTarget.frequency].toLowerCase()}). This
                  can&apos;t be undone — you&apos;d need to create a new plan to
                  resume billing this client.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingId !== null}>
              Keep plan
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={pendingId !== null}
              onClick={confirmCancel}
            >
              {pendingId === cancelTarget?.id ? "Cancelling…" : "Cancel plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
