"use client";

import { useState } from "react";
import { useAppData } from "@/components/app-data";
import { MoneyInput } from "@/components/money/MoneyInput";
import { ErrorNote, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "@/components/money/parts";
import { VerifyIdentityStep } from "@/components/money/VerifyIdentityStep";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { contributeToGoal, withdrawFromGoal } from "@/services/goals";
import { Goal, GoalMove } from "@/types/goal";

type Step = "kyc" | "amount" | "done";

/**
 * Adds money to a goal from a wallet ("in"), or takes it back out to one
 * ("out"). Both move real money, in the goal's currency.
 */
export function GoalMoneyDialog({
  goal,
  direction,
  trigger,
  onMoved,
}: {
  goal: Goal;
  direction: "in" | "out";
  trigger: React.ReactElement;
  onMoved: (move: GoalMove) => void;
}) {
  const { user, accounts, reloadAccounts } = useAppData();
  const adding = direction === "in";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [receipt, setReceipt] = useState<GoalMove | null>(null);

  const money = (minor: number) => formatMinor(minor, goal.currency_code);
  const w = walletsOf(accounts);
  const wallets = [w.personal, w.business].filter(
    (a): a is NonNullable<typeof a> => !!a && a.currency_code === goal.currency_code && a.account_status === "active",
  );
  const wallet = wallets.find((a) => a.account_id === walletId) ?? wallets[0];
  // what the amount can't go over: the wallet's balance in, the goal's out
  const limit = adding ? (wallet?.balance_minor ?? 0) : goal.saved_minor;

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    // withdrawals don't need it: money only got in while verified
    setStep(adding && user?.kyc_status !== "verified" ? "kyc" : "amount");
    setWalletId(wallets[0]?.account_id ?? "");
    setAmount(null);
    setError(null);
    setReceipt(null);
    // one key per attempt: a retry replays instead of moving money twice
    setKey(crypto.randomUUID());
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet) return;
    if (!amount) return setError("Enter an amount.");
    if (amount > limit) {
      return setError(adding ? `Your ${walletName(wallet.purpose).toLowerCase()} has ${money(limit)}.` : `This goal holds ${money(limit)}.`);
    }
    setBusy(true);
    setError(null);
    try {
      const move = adding
        ? await contributeToGoal(goal.goal_id, wallet.account_id, amount, key)
        : await withdrawFromGoal(goal.goal_id, wallet.account_id, amount, key);
      setReceipt(move);
      setStep("done");
      onMoved(move);
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't go through. No money was moved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("amount")} />}

        {step === "amount" && (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <StepHeader
              title={adding ? `Add to ${goal.name}` : `Withdraw from ${goal.name}`}
              subtitle={`${money(goal.saved_minor)} saved of ${money(goal.target_minor)}`}
            />

            {wallets.length === 0 ? (
              <ErrorNote>
                You need a {goal.currency_code} wallet to {adding ? "save from" : "withdraw to"}.
              </ErrorNote>
            ) : (
              <>
                <fieldset className="space-y-2">
                  <legend className="mb-1.5 text-sm font-medium">{adding ? "From" : "To"}</legend>
                  {wallets.map((a) => (
                    <label
                      key={a.account_id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                        wallet?.account_id === a.account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{walletName(a.purpose)}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {money(a.balance_minor)} available · {a.account_number}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="goal-wallet"
                        checked={wallet?.account_id === a.account_id}
                        onChange={() => setWalletId(a.account_id)}
                        className="accent-emerald-700"
                      />
                    </label>
                  ))}
                </fieldset>

                <div className="space-y-1.5">
                  <MoneyInput id="goal-amount" currency={goal.currency_code} onChange={setAmount} invalid={Boolean(error)} autoFocus />
                  {!adding && (
                    <p className="text-xs text-muted-foreground">You can take out up to {money(goal.saved_minor)}.</p>
                  )}
                  {adding && !goal.is_funded && (
                    <p className="text-xs text-muted-foreground">{money(goal.remaining_minor)} to go to reach your target.</p>
                  )}
                </div>
              </>
            )}

            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={busy || !wallet} className={primaryButton}>
              {busy ? (adding ? "Saving…" : "Withdrawing…") : adding ? `Save${amount ? ` ${money(amount)}` : ""}` : `Withdraw${amount ? ` ${money(amount)}` : ""}`}
            </Button>
          </form>
        )}

        {step === "done" && receipt?.transaction && (
          <SuccessView
            title={adding ? `Saved towards ${receipt.goal.name}` : `Withdrawn to your ${wallet ? walletName(wallet.purpose).toLowerCase() : "wallet"}`}
            amount={money(receipt.transaction.amount_minor)}
            onDone={() => setOpen(false)}
          >
            <Summary>
              <SummaryRow label="Goal now holds" value={`${money(receipt.goal.saved_minor)} · ${receipt.goal.progress_percent}%`} />
              <SummaryRow label={adding ? "From" : "To"} value={wallet ? walletName(wallet.purpose) : "Your wallet"} />
              <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(receipt.transaction.transaction_id)}</span>} />
            </Summary>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  );
}
