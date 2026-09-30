"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, LineChart, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/components/app-data";
import { verifyTwoFactor } from "@/services/auth";
import { startAlpacaLink, startTwoFactorSetup } from "@/services/brokerage";
import { ApiError } from "@/lib/api";
import { TwoFactorSetup } from "@/types/brokerage";

type Step =
  | { kind: "intro" }
  | { kind: "code"; setup: TwoFactorSetup | null } // setup set = 2FA being turned on now
  | { kind: "done"; message: string };

const primary = "h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800";

// "JBSWY3DPEHPK3PXP" → "JBSW Y3DP EHPK 3PXP", easier to type into an app.
const grouped = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim();

/**
 * Links the customer's Alpaca brokerage. The API only allows it right after a
 * 2FA confirmation, so this asks for a code first, turning 2FA on if the
 * customer hasn't yet. In the API's shared test mode the link is immediate;
 * otherwise the browser goes to Alpaca to approve and comes back to
 * /dashboard/investments/linked.
 */
export function LinkAlpacaDialog({ trigger, onLinked }: { trigger: React.ReactElement; onLinked?: () => void }) {
  const { user } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep({ kind: "intro" });
      setCode("");
      setError(null);
    }
  };

  const link = async () => {
    const result = await startAlpacaLink();
    if ("authorization_url" in result) {
      window.location.assign(result.authorization_url);
      return;
    }
    setStep({ kind: "done", message: "Your Alpaca account is linked. Your holdings are syncing now." });
    onLinked?.();
  };

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      await link();
    } catch (err) {
      if (err instanceof ApiError && err.code === "TWO_FACTOR_REQUIRED") {
        try {
          const setup = user?.two_factor_enabled ? null : await startTwoFactorSetup();
          setStep({ kind: "code", setup });
        } catch (setupErr) {
          // 409: 2FA is already on (turned on earlier this session), so just ask for a code
          if (setupErr instanceof ApiError && setupErr.status === 409) setStep({ kind: "code", setup: null });
          else setError(setupErr instanceof ApiError ? setupErr.message : "Something went wrong. Please try again.");
        }
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't reach Alpaca. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyTwoFactor(code);
      await link();
    } catch (err) {
      setCode("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
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

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step.kind === "intro" && (
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
            <Button onClick={begin} disabled={busy} className={primary}>
              {busy ? "Connecting…" : "Continue"}
            </Button>
          </div>
        )}

        {step.kind === "code" && (
          <form onSubmit={confirm} className="space-y-5">
            <DialogHeader>
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="size-5" />
              </span>
              <DialogTitle>{step.setup ? "Turn on two-factor authentication" : "Confirm it's you"}</DialogTitle>
              <DialogDescription>
                {step.setup
                  ? "Add VergePay to an authenticator app (Google Authenticator, Authy, 1Password), then enter the 6-digit code it shows. From now on, signing in will ask for a code too."
                  : "Enter the 6-digit code from your authenticator app to link your brokerage."}
              </DialogDescription>
            </DialogHeader>

            {step.setup && (
              <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Setup key</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="break-all font-mono text-sm tracking-wider">{grouped(step.setup.secret)}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copySecret(step.setup!.secret)}
                    aria-label={copied ? "Setup key copied" : "Copy setup key"}
                  >
                    {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <a
                  href={step.setup.otpauth_uri}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                >
                  Open in authenticator app <ExternalLink className="size-3.5" />
                </a>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="link-code">Authentication code</Label>
              <Input
                id="link-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="h-11 rounded-lg text-center text-lg tracking-[0.5em] tabular-nums"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                aria-invalid={Boolean(error)}
              />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" disabled={busy} className={primary}>
              {busy ? "Linking…" : step.setup ? "Turn on and link" : "Confirm and link"}
            </Button>
          </form>
        )}

        {step.kind === "done" && (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="size-6" />
            </span>
            <DialogHeader className="items-center text-center">
              <DialogTitle>Linked</DialogTitle>
              <DialogDescription>{step.message}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setOpen(false)} className={primary}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
