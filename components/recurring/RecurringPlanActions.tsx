"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { RecurringPlan } from "@/types/recurring";
import { LuPause, LuPlay, LuBan } from "react-icons/lu";

interface RecurringPlanActionsProps {
  plan: RecurringPlan;
  onPause: (id: string) => Promise<void>;
  onResume: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function RecurringPlanActions({ plan, onPause, onResume, onCancel }: RecurringPlanActionsProps) {
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (plan.status === "cancelled") {
    return <p className="text-sm text-gray-400">This plan has been cancelled.</p>;
  }

  async function handlePauseOrResume() {
    setIsPending(true);
    if (plan.status === "paused") {
      await onResume(plan.id);
    } else {
      await onPause(plan.id);
    }
    setIsPending(false);
    router.refresh();
  }

  async function handleConfirmCancel() {
    setIsPending(true);
    await onCancel(plan.id);
    setIsPending(false);
    setConfirmingCancel(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={isPending}
        onClick={handlePauseOrResume}
      >
        {isPending ? (
          "Updating…"
        ) : plan.status === "paused" ? (
          <>
            <LuPlay className="h-4 w-4 mr-1.5" />
            Resume plan
          </>
        ) : (
          <>
            <LuPause className="h-4 w-4 mr-1.5" />
            Pause plan
          </>
        )}
      </Button>
      <Button
        variant="outline"
        className="text-red-600 hover:text-red-600"
        disabled={isPending}
        onClick={() => setConfirmingCancel(true)}
      >
        <LuBan className="h-4 w-4 mr-1.5" />
        Cancel
      </Button>

      <AlertDialog open={confirmingCancel} onOpenChange={setConfirmingCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this recurring plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This stops future billing for {plan.client.name}. This can't be undone — you'd need
              to create a new plan to resume billing this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
              onClick={handleConfirmCancel}
            >
              {isPending ? "Cancelling…" : "Cancel plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
