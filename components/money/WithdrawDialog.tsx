"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Landmark, Plus, Search, X } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import {
  createWithdrawal,
  listBankAccounts,
  listBanks,
  quoteWithdrawal,
  removeBankAccount,
  resolveBankAccount,
  saveBankAccount,
  syncWithdrawal,
} from "@/services/withdrawals";
import { Account } from "@/types/account";
import { Bank, ResolvedBankAccount, SavedBankAccount, Withdrawal, WithdrawalQuote } from "@/types/withdrawal";
import { MoneyInput } from "./MoneyInput";
import { VerifyIdentityStep } from "./VerifyIdentityStep";
import { ErrorNote, Party, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "./parts";

type Step = "kyc" | "account" | "add" | "amount" | "review" | "done";

const masked = (number: string) => `•••• ${number.slice(-4)}`;

/**
 * Withdraws from an NGN wallet to a Nigerian bank account. The wallet is
 * debited when it's accepted; the bank transfer follows, usually in minutes,
 * and if it fails everything comes back to the wallet.
 */
export function WithdrawDialog({ wallet, trigger }: { wallet: Account; trigger: React.ReactElement }) {
  const { user, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("account");
  const [saved, setSaved] = useState<SavedBankAccount[] | null>(null);
  const [chosenId, setChosenId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [quote, setQuote] = useState<WithdrawalQuote | null>(null);
  const [narration, setNarration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [result, setResult] = useState<Withdrawal | null>(null);
  const money = (minor: number) => formatMinor(minor, wallet.currency_code);
  const chosen = saved?.find((b) => b.bank_account_id === chosenId) ?? null;

  const loadSaved = async (select?: string) => {
    try {
      const list = await listBankAccounts();
      setSaved(list);
      setChosenId(select ?? list[0]?.bank_account_id ?? "");
      return list;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your bank accounts.");
      setSaved([]);
      return [];
    }
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    setSaved(null);
    setAmount(null);
    setQuote(null);
    setNarration("");
    setError(null);
    setResult(null);
    setKey(crypto.randomUUID());
    if (user?.kyc_status !== "verified") return setStep("kyc");
    setStep("account");
    void loadSaved().then((list) => list.length === 0 && setStep("add"));
  };

  // the fee and today's limit for the amount typed, once typing pauses
  useEffect(() => {
    if (step !== "amount" || !amount) return;
    let live = true;
    const timer = setTimeout(() => {
      quoteWithdrawal(amount)
        .then((q) => live && setQuote(q))
        .catch(() => live && setQuote(null));
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [amount, step]);

  // after it's sent: watch for the bank's answer for a little while
  useEffect(() => {
    if (step !== "done" || result?.status !== "pending") return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const now = await syncWithdrawal(result.withdrawal_id);
        if (now.status !== "pending") {
          setResult(now);
          void reloadAccounts();
        }
      } catch {
        // keep the last known state; the API's own checks carry on
      }
      if (tries >= 8) clearInterval(timer);
    }, 5000);
    return () => clearInterval(timer);
  }, [step, result?.status, result?.withdrawal_id, reloadAccounts]);

  const amountProblem = (): string | null => {
    if (!amount) return "Enter an amount.";
    if (!quote || quote.amount_minor !== amount) return "Working out the fee…";
    if (amount < quote.min_amount_minor) return `The smallest withdrawal is ${money(quote.min_amount_minor)}.`;
    if (amount > quote.daily_remaining_minor) {
      return quote.daily_remaining_minor === 0
        ? `You've reached today's ${money(quote.daily_limit_minor)} limit. Try again tomorrow.`
        : `You can withdraw ${money(quote.daily_remaining_minor)} more today (the limit is ${money(quote.daily_limit_minor)} a day).`;
    }
    if (quote.total_debit_minor > wallet.balance_minor) {
      return `With the ${money(quote.fee_minor)} fee that's ${money(quote.total_debit_minor)}, but your ${walletName(wallet.purpose).toLowerCase()} has ${money(wallet.balance_minor)}.`;
    }
    return null;
  };

  const toReview = (event: React.FormEvent) => {
    event.preventDefault();
    const problem = amountProblem();
    if (problem) return setError(problem);
    setError(null);
    setStep("review");
  };

  const withdraw = async () => {
    if (!chosen || !amount) return;
    setBusy(true);
    setError(null);
    try {
      const w = await createWithdrawal(
        {
          account_id: wallet.account_id,
          bank_account_id: chosen.bank_account_id,
          amount_minor: amount,
          ...(narration.trim() ? { narration: narration.trim() } : {}),
        },
        key,
      );
      setResult(w);
      setStep("done");
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The withdrawal didn't go through. No money was moved.");
    } finally {
      setBusy(false);
    }
  };

  const back = (to: Step) => (
    <button type="button" onClick={() => { setError(null); setStep(to); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Back
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => { setStep("account"); void loadSaved().then((l) => l.length === 0 && setStep("add")); }} />}

        {step === "account" && (
          <div className="space-y-5">
            <StepHeader title="Withdraw to your bank" subtitle={`From your ${walletName(wallet.purpose).toLowerCase()} · ${money(wallet.balance_minor)} available`} />
            {saved === null ? (
              <p className="text-sm text-muted-foreground">Loading your bank accounts…</p>
            ) : (
              <fieldset className="space-y-2">
                <legend className="mb-1.5 text-sm font-medium">To</legend>
                {saved.map((b) => (
                  <div
                    key={b.bank_account_id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                      chosenId === b.bank_account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                    )}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input type="radio" name="withdraw-bank" checked={chosenId === b.bank_account_id} onChange={() => setChosenId(b.bank_account_id)} className="accent-emerald-700" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{b.account_name}</span>
                        <span className="block truncate text-xs text-muted-foreground tabular-nums">
                          {b.bank_name} · {masked(b.account_number)}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove ${b.bank_name} ${masked(b.account_number)}`}
                      onClick={async () => {
                        try {
                          await removeBankAccount(b.bank_account_id);
                          const list = await loadSaved(chosenId === b.bank_account_id ? undefined : chosenId);
                          if (list.length === 0) setStep("add");
                        } catch (err) {
                          setError(err instanceof ApiError ? err.message : "Couldn't remove it.");
                        }
                      }}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                {saved.length < 10 && (
                  <button type="button" onClick={() => { setError(null); setStep("add"); }} className="flex w-full items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground hover:text-foreground">
                    <Plus className="size-4" /> Add a bank account
                  </button>
                )}
              </fieldset>
            )}
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={() => { setError(null); setStep("amount"); }} disabled={!chosen} className={primaryButton}>
              Continue
            </Button>
          </div>
        )}

        {step === "add" && (
          <AddBankAccount
            canGoBack={!!saved?.length}
            onBack={() => setStep("account")}
            onSaved={async (b) => {
              await loadSaved(b.bank_account_id);
              setStep("amount");
            }}
          />
        )}

        {step === "amount" && chosen && (
          <form onSubmit={toReview} className="space-y-5" noValidate>
            {back("account")}
            <StepHeader title="How much?" subtitle={`To ${chosen.account_name} · ${chosen.bank_name} ${masked(chosen.account_number)}`} />
            <MoneyInput id="withdraw-amount" currency={wallet.currency_code} onChange={(m) => { setAmount(m); setError(null); }} invalid={Boolean(error)} autoFocus />
            {quote && amount && quote.amount_minor === amount && (
              <Summary>
                <SummaryRow label="Fee" value={<span>{money(quote.fee_minor)} <span className="font-normal text-muted-foreground">(we cover {money(quote.vergepay_covers_minor)})</span></span>} />
                <SummaryRow label="Taken from your wallet" value={money(quote.total_debit_minor)} strong />
                <SummaryRow label="Left of today's limit" value={money(quote.daily_remaining_minor)} />
              </Summary>
            )}
            <div className="space-y-2">
              <Label htmlFor="withdraw-note">Note (optional)</Label>
              <Input id="withdraw-note" maxLength={100} placeholder="e.g. Rent" className="h-11 rounded-lg" value={narration} onChange={(e) => setNarration(e.target.value)} />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" className={primaryButton}>
              Continue
            </Button>
          </form>
        )}

        {step === "review" && chosen && amount && quote && (
          <div className="space-y-5">
            {back("amount")}
            <StepHeader title="Check and withdraw" />
            <Party name={chosen.account_name} detail={`${chosen.bank_name} · ${chosen.account_number}`} />
            <Summary>
              <SummaryRow label="Amount" value={money(amount)} />
              <SummaryRow label="Fee" value={money(quote.fee_minor)} />
              {narration.trim() && <SummaryRow label="Note" value={narration.trim()} />}
              <SummaryRow label="Taken from your wallet" value={money(quote.total_debit_minor)} strong />
            </Summary>
            <p className="text-xs text-muted-foreground">It usually arrives within minutes. If the bank turns it down, the money and the fee come straight back.</p>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={withdraw} disabled={busy} className={primaryButton}>
              {busy ? "Withdrawing…" : `Withdraw ${money(amount)}`}
            </Button>
          </div>
        )}

        {step === "done" && result && (
          <WithdrawalResult withdrawal={result} money={money} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function WithdrawalResult({ withdrawal: w, money, onDone }: { withdrawal: Withdrawal; money: (m: number) => string; onDone: () => void }) {
  const details = (
    <Summary>
      <SummaryRow label="To" value={`${w.bank_account_name} · ${w.bank_name}`} />
      <SummaryRow label="Fee" value={money(w.fee_minor)} />
      <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(w.withdrawal_id)}</span>} />
    </Summary>
  );
  if (w.status === "failed") {
    return (
      <div className="space-y-5">
        <div className="space-y-2 text-center">
          <DialogTitle className="text-lg font-semibold">The withdrawal didn&apos;t go through</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {money(w.total_debited_minor)} is back in your wallet{w.failure_reason ? `. The bank said: ${w.failure_reason}` : "."}
          </p>
        </div>
        {details}
        <Button onClick={onDone} className={primaryButton}>
          Done
        </Button>
      </div>
    );
  }
  return (
    <SuccessView title={w.status === "successful" ? "Arrived in your bank account" : "On its way to your bank"} amount={money(w.amount_minor)} onDone={onDone}>
      {details}
      {w.status === "pending" && <p className="text-center text-xs text-muted-foreground">Usually within minutes. You&apos;ll get an alert if anything goes wrong.</p>}
    </SuccessView>
  );
}

/** Pick a bank, type the number, see whose account it is, save it. */
function AddBankAccount({ canGoBack, onBack, onSaved }: { canGoBack: boolean; onBack: () => void; onSaved: (b: SavedBankAccount) => void }) {
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [search, setSearch] = useState("");
  const [bank, setBank] = useState<Bank | null>(null);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState<ResolvedBankAccount | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listBanks()
      .then(setBanks)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the list of banks."));
  }, []);

  // name enquiry as soon as there's a bank and ten digits; an answer for
  // digits that have since changed is dropped
  const latest = useRef("");
  const check = (b: Bank | null, digits: string) => {
    setHolder(null);
    setError(null);
    if (!b || digits.length !== 10) return;
    const asked = `${b.code}:${digits}`;
    latest.current = asked;
    setChecking(true);
    resolveBankAccount(b.code, digits)
      .then((found) => latest.current === asked && setHolder(found))
      .catch((err) => latest.current === asked && setError(err instanceof ApiError ? err.message : "Couldn't check that account."))
      .finally(() => latest.current === asked && setChecking(false));
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (banks ?? []).filter((b) => !q || b.name.toLowerCase().includes(q));
  }, [banks, search]);

  const save = async () => {
    if (!bank || !holder) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await saveBankAccount(bank.code, number));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the bank account.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {canGoBack && (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </button>
      )}
      <StepHeader title="Add a bank account" subtitle="We'll check whose account it is before you save it." />

      {bank ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Landmark className="size-4 text-muted-foreground" /> {bank.name}
          </span>
          <button type="button" onClick={() => { setBank(null); check(null, number); }} className="text-xs text-emerald-700 hover:underline dark:text-emerald-400">
            Change
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="bank-search">Bank</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="bank-search" autoFocus placeholder="Search banks" className="h-11 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <ul className="max-h-56 divide-y overflow-y-auto rounded-xl border" aria-label="Banks">
            {banks === null && !error && <li className="px-3 py-2.5 text-sm text-muted-foreground">Loading banks…</li>}
            {shown.map((b) => (
              <li key={b.code}>
                <button type="button" onClick={() => { setBank(b); check(b, number); }} className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted">
                  {b.name}
                </button>
              </li>
            ))}
            {banks && shown.length === 0 && <li className="px-3 py-2.5 text-sm text-muted-foreground">No bank matches “{search}”.</li>}
          </ul>
        </div>
      )}

      {bank && (
        <div className="space-y-2">
          <Label htmlFor="bank-number">Account number</Label>
          <Input
            id="bank-number"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="10 digits"
            className="h-11 rounded-lg tracking-widest tabular-nums"
            value={number}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setNumber(digits);
              check(bank, digits);
            }}
          />
          {checking && <p className="text-xs text-muted-foreground">Checking the account…</p>}
        </div>
      )}

      {holder && <Party name={holder.account_name} detail={`${holder.bank_name} · ${holder.account_number}`} />}
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button onClick={save} disabled={!holder || busy} className={primaryButton}>
        {busy ? "Saving…" : holder ? `Save and continue` : "Enter the account number"}
      </Button>
    </div>
  );
}
