"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/components/app-data";
import { primaryButton, TwoFactorStep } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { disableTwoFactor } from "@/services/profile";

/**
 * Turns two-factor sign-in on (a secret for an authenticator app, then a
 * code) or off (a fresh code first, which the API requires).
 */
export function TwoFactorDialog({ mode, trigger }: { mode: "on" | "off"; trigger: React.ReactElement }) {
  const { reloadUser } = useAppData();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  // a new step each time it opens, so a half-finished setup starts afresh
  const [attempt, setAttempt] = useState(0);
  // fixed while open: turning 2FA on flips the page's `mode` before "Done"
  const [shown, setShown] = useState(mode);

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      setDone(false);
      setShown(mode);
      setAttempt((n) => n + 1);
    }
  };

  const confirmed = async () => {
    if (shown === "off") await disableTwoFactor();
    await reloadUser();
    setDone(true);
    toast.success(shown === "on" ? "Two-factor authentication is on." : "Two-factor authentication is off.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {shown === "on" ? <ShieldCheck className="size-7" /> : <ShieldOff className="size-7" />}
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                {shown === "on" ? "Two-factor authentication is on" : "Two-factor authentication is off"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {shown === "on"
                  ? "Next time you sign in, we'll ask for a code from your authenticator app."
                  : "Signing in needs only your password now. You can turn it back on any time."}
              </p>
            </div>
            <Button onClick={() => setOpen(false)} className={primaryButton}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {shown === "off" && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                Without it, anyone with your password can sign in. Adding a card or linking a brokerage will ask you to turn it on again.
              </p>
            )}
            <TwoFactorStep
              key={attempt}
              action={shown === "on" ? "turn on two-factor authentication" : "turn off two-factor authentication"}
              onConfirmed={confirmed}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
