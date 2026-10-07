"use client";

import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/components/app-data";
import { ErrorNote, StepHeader } from "@/components/money/parts";
import { primaryButton, TwoFactorStep } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { cancelEmailChange, confirmEmailChange, startEmailChange } from "@/services/profile";

type Step = "form" | "2fa" | "code" | "done";
const RESEND_SECONDS = 60; // the API sends at most one code a minute

/**
 * Changing the email: the new address and the current password (and a 2FA
 * code if 2FA is on), then the 6-digit code sent to the new address.
 * `resume` opens straight at the code for a change already in progress.
 * One instance on the page, controlled, so it stays open on "Done" even
 * though the pending-change banner that opened it goes away.
 */
export function EmailChangeDialog({
  open,
  resume,
  onOpenChange,
}: {
  open: boolean;
  resume: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, reloadUser } = useAppData();
  const setOpen = onOpenChange;
  const [step, setStep] = useState<Step>("form");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [errors, setErrors] = useState<{ new_email?: string; password?: string; code?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startOver = (atCode: boolean) => {
    setStep(atCode && user?.pending_email ? "code" : "form");
    setNewEmail(atCode ? (user?.pending_email ?? "") : "");
    setPassword("");
    setCode("");
    setSentAt(0);
    setErrors({});
    setError(null);
  };

  // each time it opens: a fresh form, or the code for the change in progress
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) startOver(resume);
  }

  // sends the code; throws so the 2FA step can show what went wrong
  const send = async () => {
    await startEmailChange({ new_email: newEmail.trim(), password });
    setSentAt(Date.now());
    setCode("");
    setStep("code");
    void reloadUser();
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) next.new_email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setError(null);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await send();
    } catch (err) {
      if (err instanceof ApiError && err.code === "TWO_FACTOR_REQUIRED") {
        setStep("2fa");
      } else {
        const fields = err instanceof ApiError ? err.fieldErrors() : {};
        if (fields.new_email || fields.password) setErrors({ new_email: fields.new_email, password: fields.password });
        else setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return setErrors({ code: "Enter the 6-digit code from the email." });
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      await confirmEmailChange(code);
      await reloadUser();
      setStep("done");
      toast.success("Your email address has been changed.");
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      if (fields.code) setErrors({ code: fields.code });
      else setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    await cancelEmailChange().catch(() => {});
    await reloadUser();
    setBusy(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        {step === "form" && (
          <form onSubmit={submitForm} noValidate className="space-y-5">
            <StepHeader title="Change your email" subtitle="We'll send a code to the new address to make sure it's yours." />
            <div className="space-y-2">
              <Label htmlFor="new-email">New email address</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                className="h-11 rounded-lg"
                value={newEmail}
                aria-invalid={Boolean(errors.new_email)}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              {errors.new_email && <p className="text-sm text-destructive">{errors.new_email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Your current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                className="h-11 rounded-lg"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Sending code…" : "Send code"}
            </Button>
          </form>
        )}

        {step === "2fa" && <TwoFactorStep action="change your email" onConfirmed={send} />}

        {step === "code" && (
          <form onSubmit={submitCode} noValidate className="space-y-5">
            <div className="space-y-2">
              <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <MailCheck className="size-5" />
              </span>
              <StepHeader
                title="Check your new inbox"
                subtitle={
                  <>
                    Enter the 6-digit code we sent to <span className="font-medium text-foreground break-all">{newEmail}</span>. It expires in 15 minutes.
                  </>
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-code">Code from the email</Label>
              <Input
                id="email-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="000000"
                className="h-11 rounded-lg text-center text-lg tracking-[0.5em] tabular-nums"
                value={code}
                aria-invalid={Boolean(errors.code)}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Confirming…" : "Confirm new email"}
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <Resend sentAt={sentAt} canResend={Boolean(password)} onResend={() => send().catch((err) => setError(err instanceof ApiError ? err.message : "We couldn't send another code."))} onStartOver={() => startOver(false)} />
              <button type="button" onClick={cancel} disabled={busy} className="font-medium text-destructive hover:underline">
                Cancel the change
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <MailCheck className="size-7" />
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">Email changed</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Sign in with <span className="font-medium text-foreground break-all">{user?.email}</span> from now on. We&apos;ve let your old address know.
              </p>
            </div>
            <Button onClick={() => setOpen(false)} className={primaryButton}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// "Send another code" after the API's one-a-minute limit. Coming back to a
// change later, the password isn't in memory, so it starts over instead.
function Resend({ sentAt, canResend, onResend, onStartOver }: { sentAt: number; canResend: boolean; onResend: () => void; onStartOver: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, Math.ceil((sentAt + RESEND_SECONDS * 1000 - Math.max(now, sentAt)) / 1000));

  if (!canResend) {
    return (
      <button type="button" onClick={onStartOver} className="font-medium text-emerald-700 hover:underline">
        Send a new code
      </button>
    );
  }
  return left > 0 ? (
    <span className="tabular-nums">Send another in {left}s</span>
  ) : (
    <button type="button" onClick={onResend} className="font-medium text-emerald-700 hover:underline">
      Send another code
    </button>
  );
}
