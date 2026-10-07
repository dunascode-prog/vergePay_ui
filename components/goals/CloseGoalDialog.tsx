"use client";

import { useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote, StepHeader, Summary, SummaryRow } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { closeGoal } from "@/services/goals";
import { Goal } from "@/types/goal";

/**
 * Closes a goal for good. Whatever it holds goes back to the wallet picked
 * here, in the same step.
 */
export function CloseGoalDialog({ goal, onClosed }: { goal: Goal; onClosed: () => void }) {
  const { accounts, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");

  const money = (minor: number) => formatMinor(minor, goal.currency_code);
  const holdsMoney = goal.saved_minor > 0;
  const w = walletsOf(accounts);
  const wallets = [w.personal, w.business].filter(
    (a): a is NonNullable<typeof a> => !!a && a.currency_code === goal.currency_code && a.account_status !== "closed",
  );
  const wallet = wallets.find((a) => a.account_id === walletId) ?? wallets[0];

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    setWalletId(wallets[0]?.account_id ?? "");
    setError(null);
    setKey(crypto.randomUUID());
  };

  const close = async () => {
    if (holdsMoney && !wallet) return;
    setBusy(true);
    setError(null);
    try {
      await closeGoal(goal.goal_id, holdsMoney ? wallet!.account_id : null, key);
      setOpen(false);
      onClosed();
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't close the goal. Nothing was moved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="ghost" className="text-red-600 hover:text-red-700 dark:text-red-400 sm:ml-auto">Close goal</Button>} />
      <DialogContent className="sm:max-w-md">
        <div className="space-y-5">
          <StepHeader
            title={`Close ${goal.name}?`}
            subtitle={holdsMoney ? "The money in it goes back to your wallet, and the goal can't be reopened." : "It's empty, so nothing moves. A closed goal can't be reopened."}
          />

          {holdsMoney && wallets.length === 0 && <ErrorNote>You need a {goal.currency_code} wallet to move its money to.</ErrorNote>}

          {holdsMoney && wallets.length > 1 && (
            <fieldset className="space-y-2">
              <legend className="mb-1.5 text-sm font-medium">Move the money to</legend>
              {wallets.map((a) => (
                <label
                  key={a.account_id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                    wallet?.account_id === a.account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                  )}
                >
                  <span className="font-medium">{walletName(a.purpose)}</span>
                  <input type="radio" name="close-wallet" checked={wallet?.account_id === a.account_id} onChange={() => setWalletId(a.account_id)} className="accent-emerald-700" />
                </label>
              ))}
            </fieldset>
          )}

          {holdsMoney && wallet && (
            <Summary>
              <SummaryRow label="To" value={walletName(wallet.purpose)} />
              <SummaryRow label="Amount" value={money(goal.saved_minor)} strong />
            </Summary>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button onClick={close} disabled={busy || (holdsMoney && !wallet)} className="bg-red-600 text-white hover:bg-red-700">
              {busy ? "Closing…" : holdsMoney ? `Close and move ${money(goal.saved_minor)}` : "Close goal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
