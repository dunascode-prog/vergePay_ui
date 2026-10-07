"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "@/components/money/parts";
import { VerifyIdentityStep } from "@/components/money/VerifyIdentityStep";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { groupDigits } from "@/lib/invoicing";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { MAX_RUN_PAYEES, nextPayLabel, PAY_TYPE_LABEL } from "@/lib/payroll";
import { cn } from "@/lib/utils";
import { createRun } from "@/services/payroll";
import { Payee, PayrollRun } from "@/types/payroll";
import { PayeeAvatar } from "./PayeeAvatar";

type Step = "kyc" | "pick" | "review" | "done";

const majorText = (minor: number) => groupDigits(String(minor / 100));

/**
 * Pays one or more payees from a wallet in one go. Everyone ticked is paid,
 * or no one is: the API checks every payee before any money moves.
 * `preselect` ticks those payees when it opens (for a payee's own Pay button);
 * otherwise everyone due is ticked.
 */
export function RunPayrollDialog({
  payees,
  preselect,
  trigger,
  onPaid,
}: {
  payees: Payee[];
  preselect?: string[];
  trigger: React.ReactElement;
  onPaid: (run: PayrollRun) => void;
}) {
  const { user, accounts, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [walletId, setWalletId] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [receipt, setReceipt] = useState<PayrollRun | null>(null);

  const w = walletsOf(accounts);
  const wallets = [w.personal, w.business].filter((a): a is NonNullable<typeof a> => !!a && a.account_status === "active");
  const wallet = wallets.find((a) => a.account_id === walletId) ?? wallets[0];
  const currency = wallet?.currency_code ?? "NGN";
  const money = (minor: number) => formatMinor(minor, currency);
  const active = payees.filter((p) => p.payee_status === "active" && p.wallet_status !== "closed");
  const payable = active.filter((p) => p.currency_code === currency);
  const chosen = payable.filter((p) => picked.has(p.payee_id));
  const amountOf = (p: Payee) => toMinor(amounts[p.payee_id] ?? "");
  const total = chosen.reduce((sum, p) => sum + (amountOf(p) ?? 0), 0);

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    const ticked = preselect ?? active.filter((p) => p.is_due).map((p) => p.payee_id);
    // start on a wallet in the currency of whoever is ticked first, preferring business
    const firstCurrency = active.find((p) => ticked.includes(p.payee_id))?.currency_code;
    const ordered = [w.business, w.personal].filter((a): a is NonNullable<typeof a> => !!a && a.account_status === "active");
    const start = ordered.find((a) => a.currency_code === firstCurrency) ?? ordered[0];
    setWalletId(start?.account_id ?? "");
    setPicked(new Set(ticked));
    setAmounts(Object.fromEntries(active.map((p) => [p.payee_id, majorText(p.rate_minor)])));
    setNote("");
    setError(null);
    setReceipt(null);
    setStep(user?.kyc_status === "verified" ? "pick" : "kyc");
    setKey(crypto.randomUUID());
  };

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const review = (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet) return;
    if (chosen.length === 0) return setError("Tick at least one payee.");
    if (chosen.length > MAX_RUN_PAYEES) return setError(`A run can pay up to ${MAX_RUN_PAYEES} people. Untick some and pay them in another run.`);
    const missing = chosen.find((p) => !amountOf(p));
    if (missing) return setError(`Enter an amount for ${missing.name}.`);
    if (total > wallet.balance_minor) {
      return setError(`This run pays ${money(total)}, but your ${walletName(wallet.purpose).toLowerCase()} has ${money(wallet.balance_minor)}.`);
    }
    setError(null);
    setStep("review");
  };

  const pay = async () => {
    if (!wallet) return;
    setBusy(true);
    setError(null);
    try {
      const run = await createRun(
        {
          source_account_id: wallet.account_id,
          items: chosen.map((p) => ({ payee_id: p.payee_id, amount_minor: amountOf(p)! })),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
        key,
      );
      setReceipt(run);
      setStep("done");
      onPaid(run);
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The run didn't go through. Nobody was paid.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("pick")} />}

        {step === "pick" && (
          <form onSubmit={review} className="space-y-5" noValidate>
            <StepHeader title="Run payroll" subtitle="Everyone you tick is paid at once, straight into their VergePay wallet." />

            {wallets.length === 0 ? (
              <ErrorNote>Open a wallet first: payroll is paid from it.</ErrorNote>
            ) : (
              <>
                {wallets.length > 1 && (
                  <fieldset className="space-y-2">
                    <legend className="mb-1.5 text-sm font-medium">Pay from</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
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
                            <span className="block text-xs text-muted-foreground tabular-nums">{formatMinor(a.balance_minor, a.currency_code)}</span>
                          </span>
                          <input type="radio" name="run-wallet" checked={wallet?.account_id === a.account_id} onChange={() => setWalletId(a.account_id)} className="accent-emerald-700" />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <fieldset className="space-y-2">
                  <legend className="mb-1.5 text-sm font-medium">Who to pay</legend>
                  {payable.length === 0 ? (
                    <p className="rounded-xl border px-3 py-4 text-center text-sm text-muted-foreground">No active payees are paid in {currency}.</p>
                  ) : (
                    <ul className="divide-y rounded-xl border">
                      {payable.map((p) => {
                        const on = picked.has(p.payee_id);
                        return (
                          <li key={p.payee_id} className="flex items-center gap-3 px-3 py-2.5">
                            <input
                              type="checkbox"
                              id={`run-${p.payee_id}`}
                              checked={on}
                              onChange={() => toggle(p.payee_id)}
                              className="size-4 accent-emerald-700"
                            />
                            <label htmlFor={`run-${p.payee_id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                              <PayeeAvatar name={p.name} size="sm" />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{p.name}</span>
                                <span className={cn("block truncate text-xs", p.is_due ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                                  {PAY_TYPE_LABEL[p.pay_type]} · {nextPayLabel(p)}
                                </span>
                              </span>
                            </label>
                            <Input
                              aria-label={`Amount for ${p.name}`}
                              inputMode="decimal"
                              disabled={!on}
                              value={amounts[p.payee_id] ?? ""}
                              onChange={(e) => setAmounts((a) => ({ ...a, [p.payee_id]: groupDigits(e.target.value) }))}
                              className="h-9 w-28 text-right tabular-nums"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {active.length > payable.length && (
                    <p className="text-xs text-muted-foreground">
                      Payees paid in another currency are paid from a wallet in that currency.
                    </p>
                  )}
                </fieldset>

                <div className="space-y-1.5">
                  <Label htmlFor="run-note">Note (optional)</Label>
                  <Input id="run-note" maxLength={120} placeholder="e.g. October" value={note} onChange={(e) => setNote(e.target.value)} className="h-11" />
                  <p className="text-xs text-muted-foreground">Each payee sees it on their payment.</p>
                </div>
              </>
            )}

            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" disabled={!wallet || chosen.length === 0} className={primaryButton}>
              {chosen.length ? `Review: ${chosen.length} payee${chosen.length === 1 ? "" : "s"}, ${money(total)}` : "Tick who to pay"}
            </Button>
          </form>
        )}

        {step === "review" && wallet && (
          <div className="space-y-5">
            <button type="button" onClick={() => { setError(null); setStep("pick"); }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Back
            </button>
            <StepHeader title="Check and pay" subtitle={`From your ${walletName(wallet.purpose).toLowerCase()}`} />
            <Summary>
              {chosen.map((p) => (
                <SummaryRow key={p.payee_id} label={p.name} value={money(amountOf(p)!)} />
              ))}
              {note.trim() && <SummaryRow label="Note" value={note.trim()} />}
              <SummaryRow label="Total" value={money(total)} strong />
            </Summary>
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={pay} disabled={busy} className={primaryButton}>
              {busy ? "Paying…" : `Pay ${money(total)}`}
            </Button>
          </div>
        )}

        {step === "done" && receipt && (
          <SuccessView
            title={`Paid ${receipt.payment_count} ${receipt.payment_count === 1 ? "person" : "people"}`}
            amount={formatMinor(receipt.total_minor, receipt.currency_code)}
            onDone={() => setOpen(false)}
          >
            <Summary>
              {receipt.payments.map((p) => (
                <SummaryRow key={p.payment_id} label={p.payee_name} value={formatMinor(p.amount_minor, receipt.currency_code)} />
              ))}
              <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(receipt.run_id)}</span>} />
            </Summary>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  );
}
