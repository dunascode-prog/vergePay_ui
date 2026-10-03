"use client";

import { useState } from "react";
import { Check, LineChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TwoFactorStep, primaryButton } from "@/components/security/TwoFactorStep";
import { startAlpacaLink } from "@/services/brokerage";
import { ApiError } from "@/lib/api";

type Step = "intro" | "code" | "done";

/**
 * Links the customer's Alpaca brokerage. The API only allows it right after a
 * 2FA confirmation, so on 403 it asks for a code (turning 2FA on if needed).
 * In the API's shared test mode the link is immediate; otherwise the browser
 * goes to Alpaca to approve and comes back to /dashboard/investments/linked.
 */
export function LinkAlpacaDialog({ trigger, onLinked }: { trigger: React.ReactElement; onLinked?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep("intro");
      setError(null);
    } else if (step === "done") {
      // Refresh the card only now: linked, it swaps this dialog's trigger for
      // the holdings, which would close the dialog before "Linked" is seen.
      onLinked?.();
    }
  };

  const link = async () => {
    const result = await startAlpacaLink();
    if ("authorization_url" in result) {
      window.location.assign(result.authorization_url);
      return;
    }
    setStep("done");
  };

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      await link();
    } catch (err) {
      if (err instanceof ApiError && err.code === "TWO_FACTOR_REQUIRED") setStep("code");
      else setError(err instanceof ApiError ? err.message : "Couldn't reach Alpaca. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step === "intro" && (
          <div className="space-y-5">
            <DialogHeader>
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <LineChart className="size-5" />
              </span>
              <DialogTitle>Link your Alpaca account</DialogTitle>
              <DialogDescription>
                See your stocks and crypto next to your money. VergePay only reads your holdings; it can&apos;t trade
                or move funds, and you can disconnect at any time.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You approve the connection on Alpaca&apos;s own site.</li>
              <li>• Holdings update automatically every 15 minutes.</li>
              <li>• Linking is protected by two-factor authentication.</li>
            </ul>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button onClick={begin} disabled={busy} className={primaryButton}>
              {busy ? "Connecting…" : "Continue"}
            </Button>
          </div>
        )}

        {step === "code" && (
          <TwoFactorStep action="link your brokerage" onConfirmed={link} />
        )}

        {step === "done" && (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="size-6" />
            </span>
            <DialogHeader className="items-center text-center">
              <DialogTitle>Linked</DialogTitle>
              <DialogDescription>Your Alpaca account is linked. Your holdings are syncing now.</DialogDescription>
            </DialogHeader>
            <Button onClick={() => reset(false)} className={primaryButton}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
