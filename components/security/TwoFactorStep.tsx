"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/components/app-data";
import { verifyTwoFactor } from "@/services/auth";
import { startTwoFactorSetup } from "@/services/brokerage";
import { ApiError } from "@/lib/api";
import { TwoFactorSetup } from "@/types/brokerage";

// "JBSWY3DPEHPK3PXP" → "JBSW Y3DP EHPK 3PXP", easier to type into an app.
const grouped = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim();

export const primaryButton = "h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800";

/**
 * Some actions (adding a card, linking a brokerage) need a 2FA code confirmed
 * in the last few minutes; the API answers 403 TWO_FACTOR_REQUIRED otherwise.
 * This step gets that code, turning 2FA on first if the customer hasn't yet,
 * then runs `onConfirmed` (usually the action again).
 */
export function TwoFactorStep({
  action,
  onConfirmed,
}: {
  /** What it unlocks, e.g. "add a card". */
  action: string;
  onConfirmed: () => Promise<void>;
}) {
  const { user, reloadUser } = useAppData();
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [ready, setReady] = useState(Boolean(user?.two_factor_enabled));
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  // the code was accepted; what's left is the action it unlocks
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 2FA off: start setting it up (a secret for the authenticator app).
  useEffect(() => {
    if (ready) return;
    startTwoFactorSetup()
      .then(setSetup)
      .catch((err) => {
        // 409: it's already on (turned on earlier this session), so just ask for a code
        if (!(err instanceof ApiError && err.status === 409)) {
          setError(err instanceof ApiError ? err.message : "Couldn't start two-factor setup.");
        }
      })
      .finally(() => setReady(true));
  }, [ready]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    // The code was accepted but the action itself failed: the confirmation
    // still counts for a few minutes, so just try the action again.
    if (confirmed) return finish();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyTwoFactor(code);
    } catch (err) {
      setCode("");
      setError(
        err instanceof ApiError && err.code === "INVALID_TWO_FACTOR_CODE"
          ? "That code didn't work. Each code can be used once, so if you just used it to sign in, wait for the next one in your app."
          : err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
      );
      setBusy(false);
      return;
    }
    setConfirmed(true);
    void reloadUser();
    await finish();
  };

  // runs the action the code unlocked (linking a card or a brokerage)
  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirmed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const copySecret = async (secret: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; the key is on screen
    }
  };

  if (!ready) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="size-5" />
        </span>
        <DialogTitle className="text-base font-semibold">{setup ? "Turn on two-factor authentication" : "Confirm it's you"}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          {setup
            ? `To ${action}, add VergePay to an authenticator app (Google Authenticator, Authy, 1Password) and enter the 6-digit code it shows. From now on, signing in will ask for a code too.`
            : `Enter the 6-digit code from your authenticator app to ${action}.`}
        </p>
      </div>

      {setup && (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Setup key</p>
          <div className="flex items-center justify-between gap-2">
            <code className="break-all font-mono text-sm tracking-wider">{grouped(setup.secret)}</code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copySecret(setup.secret)}
              aria-label={copied ? "Setup key copied" : "Copy setup key"}
            >
              {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <a href={setup.otpauth_uri} className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline">
            Open in authenticator app <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      {confirmed ? (
        <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <Check className="size-4" /> Code confirmed
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="two-factor-code">Authentication code</Label>
          <Input
            id="two-factor-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="h-11 rounded-lg text-center text-lg tracking-[0.5em] tabular-nums"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-invalid={Boolean(error)}
          />
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={busy} className={primaryButton}>
        {confirmed
          ? busy
            ? "Code confirmed. Finishing up…"
            : "Try again"
          : busy
            ? "Checking code…"
            : setup
              ? "Turn on and continue"
              : "Confirm and continue"}
      </Button>
    </form>
  );
}
