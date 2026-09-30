"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { useAppData } from "@/components/app-data";
import { MoneyInput } from "./MoneyInput";
import { VerifyIdentityStep } from "./VerifyIdentityStep";
import { ErrorNote, Party, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "./parts";
import { lookupAccount, transfer } from "@/services/money";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName } from "@/lib/ledger";
import { Account } from "@/types/account";
import { AccountLookup, Transfer } from "@/types/money";

type Step = "kyc" | "recipient" | "amount" | "review" | "done";

/** Sends money from this wallet to another VergePay wallet, by account number. */
export function SendMoneyDialog({ wallet, trigger }: { wallet: Account; trigger: React.ReactElement }) {
  const { user, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("recipient");
  const [number, setNumber] = useState("");
  const [recipient, setRecipient] = useState<AccountLookup | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [receipt, setReceipt] = useState<Transfer | null>(null);
  const money = (minor: number) => formatMinor(minor, wallet.currency_code);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep(user?.kyc_status === "verified" ? "recipient" : "kyc");
      setNumber("");
      setRecipient(null);
      setAmount(null);
      setNote("");
      setError(null);
      setReceipt(null);
      setKey(crypto.randomUUID());
    }
  };

  const findRecipient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(number)) {
      setError("Enter the 10-digit VergePay account number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const found = await lookupAccount(number);
      if (found.is_own) setError("That's one of your own wallets. Use Transfer to move money between them.");
      else if (found.currency_code !== wallet.currency_code) {
        setError(`${found.account_name}'s wallet is in ${found.currency_code}. You can only send ${wallet.currency_code} to a ${wallet.currency_code} wallet.`);
      } else {
        setRecipient(found);
        setStep("amount");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't find that account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const checkAmount = (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount) return setError("Enter an amount.");
    if (amount > wallet.balance_minor) return setError(`That's more than your ${money(wallet.balance_minor)} balance.`);
    setError(null);
    setStep("review");
  };

  const send = async () => {
    if (!recipient || !amount) return;
    setBusy(true);
    setError(null);
    try {
      const result = await transfer(
        {
          sender_account_id: wallet.account_id,
          receiver_account_number: recipient.account_number,
          amount_minor: amount,
          currency_code: wallet.currency_code,
          description: note.trim() || undefined,
        },
        key,
      );
      setReceipt(result);
      setStep("done");
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The transfer didn't go through. No money was moved.");
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
      <DialogContent className="sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("recipient")} />}

        {step === "recipient" && (
          <form onSubmit={findRecipient} className="space-y-5" noValidate>
            <StepHeader title="Send money" subtitle={`From your ${walletName(wallet.purpose).toLowerCase()} · ${money(wallet.balance_minor)} available`} />
            <div className="space-y-2">
              <Label htmlFor="send-number">Recipient&apos;s VergePay account number</Label>
              <Input
                id="send-number"
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

        {step === "amount" && recipient && (
          <form onSubmit={checkAmount} className="space-y-5" noValidate>
            {back("recipient")}
            <StepHeader title="How much?" subtitle={`${money(wallet.balance_minor)} available`} />
            <Party name={recipient.account_name} detail={`VergePay · ${recipient.account_number}`} />
            <MoneyInput id="send-amount" currency={wallet.currency_code} onChange={setAmount} invalid={Boolean(error)} autoFocus />
            <div className="space-y-2">
              <Label htmlFor="send-note">Note (optional)</Label>
              <Input id="send-note" maxLength={120} placeholder="What's it for?" className="h-11 rounded-lg" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" className={primaryButton}>
              Continue
            </Button>
          </form>
        )}

        {step === "review" && recipient && amount && (
          <div className="space-y-5">
            {back("amount")}
            <StepHeader title="Check and send" subtitle="Transfers between VergePay wallets arrive instantly and can't be undone." />
            <Summary>
              <SummaryRow label="To" value={<>{recipient.account_name}<br /><span className="text-xs text-muted-foreground tabular-nums">{recipient.account_number}</span></>} />
              <SummaryRow label="From" value={walletName(wallet.purpose)} />
              {note.trim() && <SummaryRow label="Note" value={note.trim()} />}
              <SummaryRow label="Fee" value="Free" />
              <SummaryRow label="Amount" value={money(amount)} strong />
            </Summary>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={send} disabled={busy} className={primaryButton}>
              {busy ? "Sending…" : `Send ${money(amount)}`}
            </Button>
          </div>
        )}

        {step === "done" && receipt && recipient && (
          <SuccessView title={`Sent to ${recipient.account_name}`} amount={money(receipt.amount_minor)} onDone={() => setOpen(false)}>
            <Summary>
              <SummaryRow label="To" value={`${recipient.account_name} · ${recipient.account_number}`} />
              {receipt.description && <SummaryRow label="Note" value={receipt.description} />}
              <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(receipt.transaction_id)}</span>} />
            </Summary>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  );
}
