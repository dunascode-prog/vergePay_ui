"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useAppData } from "@/components/app-data";
import { syncPayment } from "@/services/money";
import { ApiError } from "@/lib/api";
import { formatMinor } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { PaymentState } from "@/types/money";

const ATTEMPTS = 6;
const WAIT_MS = 1500;

type View = { kind: "checking" } | { kind: "done"; state: PaymentState } | { kind: "error"; message: string };

/** Asks the API how the payment ended (it checks with Flutterwave), a few times if it's still pending. */
export function PaymentResult({ transactionId }: { transactionId: string | null }) {
  const { reloadAccounts } = useAppData();
  const [view, setView] = useState<View>(
    transactionId ? { kind: "checking" } : { kind: "error", message: "This link is missing its payment reference." },
  );

  useEffect(() => {
    if (!transactionId) return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < ATTEMPTS && !cancelled; i++) {
        try {
          const state = await syncPayment(transactionId);
          if (state.status !== "pending" || i === ATTEMPTS - 1) {
            if (!cancelled) setView({ kind: "done", state });
            void reloadAccounts();
            return;
          }
        } catch (err) {
          if (!cancelled) setView({ kind: "error", message: err instanceof ApiError ? err.message : "We couldn't check this payment." });
          return;
        }
        await new Promise((r) => setTimeout(r, WAIT_MS));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [transactionId, reloadAccounts]);

  let icon = <Loader2 className="size-7 animate-spin" />;
  let tone = "bg-muted text-muted-foreground";
  let title = "Checking your payment…";
  let body = "This takes a moment.";

  if (view.kind === "error") {
    icon = <X className="size-7" />;
    tone = "bg-destructive/10 text-destructive";
    title = "Something went wrong";
    body = view.message;
  } else if (view.kind === "done") {
    const { state } = view;
    const amount = formatMinor(state.amount_minor, state.currency_code);
    const linking = Boolean(state.card_link_id);
    if (state.status === "settled") {
      icon = <Check className="size-7" />;
      tone = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
      title = linking ? "Card linked" : `${amount} added`;
      body = linking
        ? `Your card is saved for one-tap top-ups, and the ${amount} check payment is in your wallet.`
        : "The money is in your wallet.";
    } else if (state.status === "failed") {
      icon = <X className="size-7" />;
      tone = "bg-destructive/10 text-destructive";
      title = linking ? "Card not linked" : "Payment failed";
      body = state.card_link_failure_reason ?? state.failure_reason ?? "The payment didn't go through. You weren't charged.";
    } else {
      title = "Still processing";
      body = "Your bank hasn't confirmed yet. Your balance will update as soon as it does.";
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center">
      <Card className="w-full">
        <CardContent className="space-y-5 py-10 text-center" role="status">
          <span className={cn("mx-auto flex size-14 items-center justify-center rounded-full", tone)}>{icon}</span>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
          {view.kind !== "checking" && (
            <Link href="/dashboard" className={cn(buttonVariants(), "h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800")}>
              Back to dashboard
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
