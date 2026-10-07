"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote } from "@/components/money/parts";
import { VerifyIdentityStep } from "@/components/money/VerifyIdentityStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { groupDigits, money } from "@/lib/invoicing";
import { walletName, walletsOf } from "@/lib/ledger";
import { LOAN_TYPE_HINT, LOAN_TYPE_LABEL, LOAN_TYPES, MAX_LOAN_MINOR, MIN_LOAN_MINOR, termLabel } from "@/lib/loans";
import { cn } from "@/lib/utils";
import { applyForLoan, listLoanApplications } from "@/services/loans";
import { LoanTermsDialog } from "./LoanTermsDialog";
import { LoanType } from "@/types/loan";

const TERMS = [3, 6, 12, 24, 36];

type Errors = Partial<Record<"amount" | "term" | "wallet" | "purpose", string>>;

/** /dashboard/loans/apply */
export function LoanApplyForm() {
  const router = useRouter();
  const { user, accounts, accountsState } = useAppData();
  const w = walletsOf(accounts);
  const wallets = [w.personal, w.business].filter((a): a is NonNullable<typeof a> => !!a && a.account_status === "active");

  const [type, setType] = useState<LoanType>("personal");
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState(6);
  const [customTerm, setCustomTerm] = useState("");
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  // the loan terms pop-up: opened before anything is sent; new key per opening
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsKey, setTermsKey] = useState(0);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState<boolean | null>(null);

  useEffect(() => {
    listLoanApplications()
      .then((list) => setHasPending(list.some((a) => a.status === "pending_review")))
      .catch(() => setHasPending(false));
  }, []);

  const wallet = wallets.find((a) => a.account_id === walletId) ?? wallets[0];
  const currency = wallet?.currency_code ?? "NGN";
  const amountMinor = toMinor(amount);
  const months = customTerm ? Number(customTerm) : term;
  const verified = user?.kyc_status === "verified";

  const summary = useMemo(
    () => `${LOAN_TYPE_LABEL[type]} · ${Number.isInteger(months) && months > 0 ? termLabel(months) : "choose a term"}`,
    [type, months],
  );

  const check = (): Errors => {
    const e: Errors = {};
    if (!amountMinor) e.amount = "Enter how much you'd like to borrow.";
    else if (amountMinor < MIN_LOAN_MINOR) e.amount = `The smallest loan is ${money(MIN_LOAN_MINOR, currency)}.`;
    else if (amountMinor > MAX_LOAN_MINOR) e.amount = `The largest loan is ${money(MAX_LOAN_MINOR, currency)}.`;
    if (!Number.isInteger(months) || months < 1 || months > 360) e.term = "Choose a term from 1 to 360 months.";
    if (!wallet) e.wallet = "Open a wallet first: the loan is paid into it.";
    return e;
  };

  const openTerms = () => {
    setTermsError(null);
    setTermsKey((k) => k + 1);
    setTermsOpen(true);
  };

  // justVerified: the identity check just passed (the profile hasn't reloaded yet)
  const submit = (justVerified = false) => {
    const e = check();
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;
    if (!verified && !justVerified) return setVerifyOpen(true);
    // nothing is sent until they've read and agreed to the loan terms
    openTerms();
  };

  const send = async (termsVersion: string) => {
    setBusy(true);
    setTermsError(null);
    try {
      await applyForLoan({
        account_id: wallet!.account_id,
        loan_type: type,
        requested_amount_minor: amountMinor!,
        currency_code: currency,
        term_months: months,
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
        auto_debit_consent: true,
        terms_version: termsVersion,
      });
      setTermsOpen(false);
      router.push("/dashboard/loans");
    } catch (err) {
      setBusy(false);
      // the terms changed while they were reading: show the new ones
      if (err instanceof ApiError && err.field === "terms_version") {
        setTermsKey((k) => k + 1);
        setTermsError("The loan terms were just updated. Please read and agree to the current version.");
        return;
      }
      if (err instanceof ApiError) {
        const f = err.fieldErrors();
        setErrors({ amount: f.requested_amount_minor, term: f.term_months, wallet: f.account_id ?? f.currency_code, purpose: f.purpose });
      }
      setTermsOpen(false);
      setFormError(err instanceof ApiError ? err.message : "Couldn't send your application. Please try again.");
    }
  };

  if (accountsState === "loading" || hasPending === null) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const back = (
    <Link href="/dashboard/loans" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Loans
    </Link>
  );

  if (hasPending) {
    return (
      <div className="mx-auto max-w-xl">
        {back}
        <ErrorNote>You already have an application waiting for a decision. You can apply again once it&apos;s decided.</ErrorNote>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {back}
      <h1 className="text-2xl font-semibold tracking-tight">Apply for a loan</h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">It takes a minute. Nothing is paid out or charged until it&apos;s approved.</p>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          <section className="space-y-3 rounded-xl border bg-card p-4 sm:p-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">What kind of loan</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {LOAN_TYPES.map((t) => (
                  <label
                    key={t}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                      type === t && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                    )}
                  >
                    <input type="radio" name="loan-type" value={t} checked={type === t} onChange={() => setType(t)} className="mt-0.5 accent-emerald-700" />
                    <span>
                      <span className="block font-medium">{LOAN_TYPE_LABEL[t]}</span>
                      <span className="block text-xs text-muted-foreground">{LOAN_TYPE_HINT[t]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="space-y-1.5">
              <Label htmlFor="loan-amount">How much ({currency})</Label>
              <Input
                id="loan-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(groupDigits(e.target.value));
                  setErrors((er) => ({ ...er, amount: undefined }));
                }}
                aria-invalid={!!errors.amount}
                className="h-11 tabular-nums"
              />
              {errors.amount ? (
                <p className="text-xs text-destructive">{errors.amount}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  From {money(MIN_LOAN_MINOR, currency)} to {money(MAX_LOAN_MINOR, currency)}.
                </p>
              )}
            </div>

            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Repay over</legend>
              <div className="flex flex-wrap gap-1.5">
                {TERMS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={!customTerm && term === m}
                    onClick={() => {
                      setTerm(m);
                      setCustomTerm("");
                      setErrors((er) => ({ ...er, term: undefined }));
                    }}
                    className={cn(
                      "h-9 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground",
                      !customTerm && term === m && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                    )}
                  >
                    {termLabel(m)}
                  </button>
                ))}
                <Input
                  aria-label="Other term, in months"
                  inputMode="numeric"
                  placeholder="Other (months)"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className={cn("h-9 w-36", customTerm && "border-emerald-700")}
                />
              </div>
              {errors.term && <p className="text-xs text-destructive">{errors.term}</p>}
            </fieldset>
          </section>

          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            {wallets.length > 1 ? (
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Paid into</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {wallets.map((a) => (
                    <label
                      key={a.account_id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                        wallet?.account_id === a.account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{walletName(a.purpose)}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {a.currency_code} · {a.account_number}
                        </span>
                      </span>
                      <input type="radio" name="wallet" checked={wallet?.account_id === a.account_id} onChange={() => setWalletId(a.account_id)} className="accent-emerald-700" />
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">The loan is in this wallet&apos;s currency, and repaid from it by default.</p>
              </fieldset>
            ) : wallet ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Paid into your </span>
                {walletName(wallet.purpose).toLowerCase()} ({wallet.currency_code} · {wallet.account_number})
              </p>
            ) : null}
            {errors.wallet && <p className="text-xs text-destructive">{errors.wallet}</p>}

            <div className="space-y-1.5">
              <Label htmlFor="loan-purpose">What it&apos;s for (optional)</Label>
              <Input id="loan-purpose" maxLength={255} placeholder="e.g. A new laptop for client work" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-11" />
              {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
          <div>
            <p className="text-xs text-muted-foreground">{summary}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{money(amountMinor ?? 0, currency)}</p>
          </div>
          <ul className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <li>The rate is set when your application is reviewed. You&apos;ll see it with the monthly payment before you pay anything.</li>
            <li>If it&apos;s approved, the money goes straight into your wallet. You repay one fixed installment a month, starting a month after.</li>
            <li>You can have one application in review at a time.</li>
            <li>Before it&apos;s sent you&apos;ll read the loan terms, including automatic repayments, and can download a copy.</li>
          </ul>
          {!verified && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> We&apos;ll check your identity (BVN) first. It&apos;s a one-time step.
            </p>
          )}
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <Button onClick={() => submit()} disabled={busy || !wallet} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
            {busy ? "Sending…" : verified ? "Review terms and apply" : "Verify identity and apply"}
          </Button>
        </aside>
      </div>

      <LoanTermsDialog
        key={termsKey}
        open={termsOpen}
        onOpenChange={(v) => !busy && setTermsOpen(v)}
        currency={currency}
        busy={busy}
        error={termsError}
        onAgree={send}
      />

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="sm:max-w-md">
          {verifyOpen && (
            <VerifyIdentityStep
              onVerified={() => {
                setVerifyOpen(false);
                submit(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
