"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { useAppData } from "@/components/app-data";
import { MoneyInput } from "./MoneyInput";
import { VerifyIdentityStep } from "./VerifyIdentityStep";
import { ErrorNote, Party, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "./parts";
import { transfer } from "@/services/money";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName } from "@/lib/ledger";
import { Account } from "@/types/account";
import { Transfer } from "@/types/money";

type Step = "kyc" | "amount" | "review" | "done";

/** Moves money between the customer's own two wallets (personal ⇄ business). */
export function TransferDialog({ from, to, trigger }: { from: Account; to: Account; trigger: React.ReactElement }) {
  const { user, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [receipt, setReceipt] = useState<Transfer | null>(null);
  const money = (minor: number) => formatMinor(minor, from.currency_code);
  const sameCurrency = from.currency_code === to.currency_code;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep(user?.kyc_status === "verified" ? "amount" : "kyc");
      setAmount(null);
      setNote("");
      setError(null);
      setReceipt(null);
      setKey(crypto.randomUUID());
    }
  };

  const checkAmount = (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount) return setError("Enter an amount.");
    if (amount > from.balance_minor) return setError(`That's more than your ${money(from.balance_minor)} balance.`);
    setError(null);
    setStep("review");
  };

  const move = async () => {
    if (!amount) return;
    setBusy(true);
    setError(null);
    try {
      const result = await transfer(
        {
          sender_account_id: from.account_id,
          receiver_account_id: to.account_id,
          amount_minor: amount,
          currency_code: from.currency_code,
          description: note.trim() || `${walletName(from.purpose)} → ${walletName(to.purpose)}`,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("amount")} />}

        {step === "amount" && !sameCurrency && (
          <div className="space-y-4">
            <StepHeader title="Transfer between your wallets" />
            <ErrorNote>
              Your {walletName(from.purpose).toLowerCase()} is in {from.currency_code} and your{" "}
              {walletName(to.purpose).toLowerCase()} is in {to.currency_code}. Transfers between currencies aren&apos;t available yet.
            </ErrorNote>
          </div>
        )}

        {step === "amount" && sameCurrency && (
          <form onSubmit={checkAmount} className="space-y-5" noValidate>
            <StepHeader title="Transfer between your wallets" subtitle="Instant and free." />
            <div className="space-y-2">
              <Party name={walletName(from.purpose)} detail={`${money(from.balance_minor)} available · ${from.account_number}`} />
              <div className="flex justify-center text-muted-foreground" aria-hidden>
                <ArrowDown className="size-4" />
              </div>
              <Party name={walletName(to.purpose)} detail={`${money(to.balance_minor)} · ${to.account_number}`} />
            </div>
            <MoneyInput id="transfer-amount" currency={from.currency_code} onChange={setAmount} invalid={Boolean(error)} autoFocus />
            <div className="space-y-2">
              <Label htmlFor="transfer-note">Note (optional)</Label>
              <Input id="transfer-note" maxLength={120} placeholder="e.g. Owner's pay for October" className="h-11 rounded-lg" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" className={primaryButton}>
              Continue
            </Button>
          </form>
        )}

        {step === "review" && amount && (
          <div className="space-y-5">
            <button type="button" onClick={() => { setError(null); setStep("amount"); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Back
            </button>
            <StepHeader title="Check and transfer" />
            <Summary>
              <SummaryRow label="From" value={walletName(from.purpose)} />
              <SummaryRow label="To" value={walletName(to.purpose)} />
              {note.trim() && <SummaryRow label="Note" value={note.trim()} />}
              <SummaryRow label="Amount" value={money(amount)} strong />
            </Summary>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={move} disabled={busy} className={primaryButton}>
              {busy ? "Transferring…" : `Transfer ${money(amount)}`}
            </Button>
          </div>
        )}

        {step === "done" && receipt && (
          <SuccessView title={`Moved to your ${walletName(to.purpose).toLowerCase()}`} amount={money(receipt.amount_minor)} onDone={() => setOpen(false)}>
            <Summary>
              <SummaryRow label="From" value={walletName(from.purpose)} />
              <SummaryRow label="To" value={walletName(to.purpose)} />
              <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(receipt.transaction_id)}</span>} />
            </Summary>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  );
}
