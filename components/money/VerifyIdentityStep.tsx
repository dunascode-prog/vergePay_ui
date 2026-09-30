"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { useAppData } from "@/components/app-data";
import { getKycSubmission, submitKyc } from "@/services/money";
import { ApiError } from "@/lib/api";

const POLL_MS = 1000;
const GIVE_UP_MS = 30_000;

type Fields = { bvn: string; first_name: string; last_name: string; date_of_birth: string };

/**
 * Identity verification, the first time someone moves money: BVN, legal
 * name and date of birth. The API decides asynchronously, so this waits for
 * the verdict ("Checking your details…"), then carries on with `onVerified`.
 */
export function VerifyIdentityStep({ onVerified }: { onVerified: () => void }) {
  const { user, reloadUser } = useAppData();
  const [fields, setFields] = useState<Fields>({
    bvn: "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [stillPending, setStillPending] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const cancelled = useRef(false);
  // reset on mount too: StrictMode (dev) mounts, unmounts and mounts again
  useEffect(() => {
    cancelled.current = false;
    return () => void (cancelled.current = true);
  }, []);

  const set = (name: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [name]: name === "bvn" ? e.target.value.replace(/\D/g, "").slice(0, 11) : e.target.value }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!/^\d{11}$/.test(fields.bvn)) next.bvn = "Your BVN is 11 digits. Dial *565*0# to get it.";
    if (!fields.first_name.trim()) next.first_name = "Enter your first name as on your BVN.";
    if (!fields.last_name.trim()) next.last_name = "Enter your last name as on your BVN.";
    if (!fields.date_of_birth) next.date_of_birth = "Enter your date of birth.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const waitForVerdict = async (kycId: string) => {
    const started = Date.now();
    while (!cancelled.current && Date.now() - started < GIVE_UP_MS) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      const s = await getKycSubmission(kycId);
      if (s.verification_status === "approved") {
        await reloadUser();
        onVerified();
        return;
      }
      if (s.verification_status === "rejected") {
        setChecking(false);
        setFormError(s.rejection_reason ?? "We couldn't verify these details. Check them and try again.");
        return;
      }
    }
    // Still pending (a real provider or a manual review can take longer).
    setStillPending(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setChecking(true);
    try {
      // a fresh key per attempt after a rejection; the same one on a network retry
      const submission = await submitKyc(
        { document_type: "bvn", ...fields, first_name: fields.first_name.trim(), last_name: fields.last_name.trim() },
        formError ? crypto.randomUUID() : key,
      );
      await waitForVerdict(submission.kyc_id);
    } catch (err) {
      setChecking(false);
      if (err instanceof ApiError) {
        const fieldErrors = err.fieldErrors();
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors as typeof errors);
        else setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  if (stillPending) {
    return (
      <div className="space-y-3 py-4 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-emerald-700" aria-hidden />
        <DialogTitle className="text-lg font-semibold">We&apos;re still checking your details</DialogTitle>
        <p className="text-sm text-muted-foreground">
          This can take a little longer. You&apos;ll be able to move money as soon as it&apos;s done.
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="space-y-3 py-6 text-center" role="status">
        <Loader2 className="mx-auto size-8 animate-spin text-emerald-700" aria-hidden />
        <DialogTitle className="text-lg font-semibold">Checking your details…</DialogTitle>
        <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <BadgeCheck className="size-5" />
        </span>
        <DialogTitle className="text-lg font-semibold">Verify your identity</DialogTitle>
        <p className="text-sm text-muted-foreground">
          To move money, the law requires us to confirm who you are. It&apos;s a one-time check with your BVN, which
          we store encrypted and never show again.
        </p>
      </div>

      {formError && (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="kyc-bvn">BVN</Label>
        <Input
          id="kyc-bvn"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11 digits"
          className="h-11 rounded-lg tracking-widest tabular-nums"
          value={fields.bvn}
          onChange={set("bvn")}
          aria-invalid={Boolean(errors.bvn)}
        />
        {errors.bvn && <p className="text-sm text-destructive">{errors.bvn}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kyc-first">First name</Label>
          <Input id="kyc-first" autoComplete="given-name" className="h-11 rounded-lg" value={fields.first_name} onChange={set("first_name")} aria-invalid={Boolean(errors.first_name)} />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="kyc-last">Last name</Label>
          <Input id="kyc-last" autoComplete="family-name" className="h-11 rounded-lg" value={fields.last_name} onChange={set("last_name")} aria-invalid={Boolean(errors.last_name)} />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kyc-dob">Date of birth</Label>
        <Input id="kyc-dob" type="date" autoComplete="bday" className="h-11 rounded-lg" value={fields.date_of_birth} onChange={set("date_of_birth")} aria-invalid={Boolean(errors.date_of_birth)} />
        {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
      </div>

      <Button type="submit" className={primaryButton}>
        Verify identity
      </Button>
    </form>
  );
}
