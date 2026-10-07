"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote, Party, StepHeader } from "@/components/money/parts";
import { VerifyIdentityStep } from "@/components/money/VerifyIdentityStep";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { groupDigits } from "@/lib/invoicing";
import { FREQUENCIES, FREQUENCY_LABEL, PAY_TYPES, PAY_TYPE_LABEL, RATE_LABEL } from "@/lib/payroll";
import { cn } from "@/lib/utils";
import { lookupAccount } from "@/services/money";
import { createPayee, updatePayee } from "@/services/payroll";
import { AccountLookup } from "@/types/money";
import { Payee, PayFrequency, PayType } from "@/types/payroll";

type Step = "kyc" | "wallet" | "details";
type Errors = Partial<Record<"name" | "role" | "rate", string>>;

const chip = (on: boolean) =>
  cn(
    "h-9 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground",
    on && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  );

/**
 * Adds a payee by their VergePay account number (showing whose wallet it is
 * before anything is saved), or edits one when `payee` is given. The wallet
 * can't change: paying someone else's wallet means a new payee.
 */
export function PayeeFormDialog({ payee, trigger, onSaved }: { payee?: Payee; trigger: React.ReactElement; onSaved: (payee: Payee) => void }) {
  const { user } = useAppData();
  const editing = !!payee;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("wallet");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState<AccountLookup | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [payType, setPayType] = useState<PayType>("retainer");
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currency = payee?.currency_code ?? holder?.currency_code ?? "NGN";

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    setStep(editing ? "details" : user?.kyc_status === "verified" ? "wallet" : "kyc");
    setNumber("");
    setHolder(null);
    setName(payee?.name ?? "");
    setRole(payee?.role ?? "");
    setPayType(payee?.pay_type ?? "retainer");
    setFrequency(payee?.frequency ?? "monthly");
    setRate(payee ? groupDigits(String(payee.rate_minor / 100)) : "");
    setErrors({});
    setError(null);
  };

  const findWallet = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(number)) return setError("Enter the 10-digit VergePay account number.");
    setBusy(true);
    setError(null);
    try {
      const found = await lookupAccount(number);
      if (found.is_own) {
        setError("That's one of your own wallets. Move money between your wallets with a transfer.");
      } else {
        setHolder(found);
        setName(found.account_name);
        setStep("details");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't find that account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const rateMinor = toMinor(rate);
    const e: Errors = {};
    if (!name.trim()) e.name = "Enter a name.";
    if (!rateMinor) e.rate = "Enter the usual amount you pay them.";
    setErrors(e);
    setError(null);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const saved = editing
        ? await updatePayee(payee.payee_id, { name: name.trim(), role: role.trim() || null, pay_type: payType, frequency, rate_minor: rateMinor! })
        : await createPayee({
            account_number: holder!.account_number,
            name: name.trim(),
            ...(role.trim() ? { role: role.trim() } : {}),
            pay_type: payType,
            frequency,
            rate_minor: rateMinor!,
          });
      onSaved(saved);
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const f = err.fieldErrors();
        setErrors({ name: f.name, role: f.role, rate: f.rate_minor });
      }
      setError(err instanceof ApiError ? err.message : "Couldn't save the payee. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("wallet")} />}

        {step === "wallet" && (
          <form onSubmit={findWallet} className="space-y-5" noValidate>
            <StepHeader title="Add a payee" subtitle="Someone you pay with VergePay. They're paid straight into their wallet." />
            <div className="space-y-2">
              <Label htmlFor="payee-number">Their VergePay account number</Label>
              <Input
                id="payee-number"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="10 digits"
                className="h-11 rounded-lg tracking-widest tabular-nums"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                aria-invalid={Boolean(error)}
              />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Checking…" : "Continue"}
            </Button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={save} className="space-y-5" noValidate>
            {!editing && (
              <button type="button" onClick={() => { setError(null); setStep("wallet"); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
            <StepHeader title={editing ? `Edit ${payee.name}` : "How you pay them"} />
            <Party
              name={payee?.account_name ?? holder?.account_name ?? ""}
              detail={`${payee?.account_number ?? holder?.account_number} · ${currency} wallet`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="payee-name">Name on your payroll</Label>
                <Input id="payee-name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} className="h-11" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payee-role">Role (optional)</Label>
                <Input id="payee-role" maxLength={80} placeholder="e.g. Designer" value={role} onChange={(e) => setRole(e.target.value)} className="h-11" />
                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
              </div>
            </div>

            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Pay type</legend>
              <div className="flex flex-wrap gap-1.5">
                {PAY_TYPES.map((t) => (
                  <button key={t} type="button" aria-pressed={payType === t} onClick={() => setPayType(t)} className={chip(payType === t)}>
                    {PAY_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">How often</legend>
              <div className="flex flex-wrap gap-1.5">
                {FREQUENCIES.map((f) => (
                  <button key={f} type="button" aria-pressed={frequency === f} onClick={() => setFrequency(f)} className={chip(frequency === f)}>
                    {FREQUENCY_LABEL[f]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="payee-rate">
                {RATE_LABEL[payType]} ({currency})
              </Label>
              <Input
                id="payee-rate"
                inputMode="decimal"
                placeholder="0.00"
                value={rate}
                onChange={(e) => setRate(groupDigits(e.target.value))}
                aria-invalid={!!errors.rate}
                className="h-11 tabular-nums"
              />
              {errors.rate ? (
                <p className="text-xs text-destructive">{errors.rate}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Filled in when you pay them; you can change it on each run.</p>
              )}
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy} className={primaryButton}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add payee"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
