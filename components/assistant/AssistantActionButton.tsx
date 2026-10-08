"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { remindInvoice } from "@/services/invoices";
import { AssistantAction } from "@/types/assistant";

/**
 * One action from the assistant or a recommendation: a link in the app, or
 * "send reminder", which emails the client straight away.
 */
export function AssistantActionButton({
  action,
  primary = false,
  onDone,
  onNavigate,
}: {
  action: AssistantAction;
  primary?: boolean;
  /** after an action that changes something (a reminder sent) */
  onDone?: () => void;
  /** after following a link (e.g. to close the chat panel) */
  onNavigate?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const look = primary
    ? "h-8 bg-emerald-700 px-3 text-white hover:bg-emerald-800"
    : "h-8 px-3";

  if (action.kind === "remind") {
    const remind = async () => {
      setBusy(true);
      try {
        await remindInvoice(action.invoice_id);
        setSent(true);
        toast.success("Reminder sent.");
        onDone?.();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "We couldn't send the reminder.");
      } finally {
        setBusy(false);
      }
    };
    return (
      <Button size="sm" variant={primary ? "default" : "outline"} className={look} onClick={remind} disabled={busy || sent}>
        {sent ? "Reminder sent" : busy ? "Sending…" : action.label}
      </Button>
    );
  }
  return (
    <Link href={action.href} onClick={onNavigate} className={cn(buttonVariants({ size: "sm", variant: primary ? "default" : "outline" }), look)}>
      {action.label}
    </Link>
  );
}
