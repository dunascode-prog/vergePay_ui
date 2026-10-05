"use client";

import { useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote, StepHeader, Summary, SummaryRow, SuccessView, shortRef } from "@/components/money/parts";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { formatDay } from "@/lib/invoicing";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { dueIn, LOAN_TYPE_LABEL } from "@/lib/loans";
import { cn } from "@/lib/utils";
import { repayLoan } from "@/services/loans";
import { Loan, Repayment } from "@/types/loan";

/**
 * Pays a loan's next installment from one of your wallets. The API takes
 * exactly the installment due, in order, so there's no amount to type.
 */
export function RepayDialog({ loan, trigger, onPaid }: { loan: Loan; trigger: React.ReactElement; onPaid: (r: Repayment) => void }) {
  const { accounts, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [sourceId, setSourceId] = useState(loan.account_id);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [receipt, setReceipt] = useState<Repayment | null>(null);

  const next = loan.next_installment;
  const money = (minor: number) => formatMinor(minor, loan.currency_code);
  const w = walletsOf(accounts);
  const sources = [w.personal, w.business].filter((a): a is NonNullable<typeof a> => !!a && a.currency_code === loan.currency_code && a.account_status === "active");
  const source = sources.find((a) => a.account_id === sourceId) ?? sources[0];
  const short = !!source && !!next && source.balance_minor < next.installment_amount_minor;

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setError(null);
      setReceipt(null);
      setSourceId(sources.some((a) => a.account_id === loan.account_id) ? loan.account_id : (sources[0]?.account_id ?? loan.account_id));
      // one key per attempt: a retried request replays instead of paying twice
      setKey(crypto.randomUUID());
    }
  };

  const pay = async () => {
    if (!next || !source) return;
    setBusy(true);
    setError(null);
    try {
      const result = await repayLoan(loan.loan_id, source.account_id, next.installment_amount_minor, key);
      setReceipt(result);
      onPaid(result);
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The payment didn't go through. No money was moved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {!receipt && next && (
          <div className="space-y-5">
            <StepHeader
              title={`Pay installment ${next.installment_number} of ${loan.term_months}`}
              subtitle={`${LOAN_TYPE_LABEL[loan.loan_type]} · ${dueIn(next.due_date)} (${formatDay(next.due_date)})`}
            />

            {sources.length === 0 ? (
              <ErrorNote>You need a {loan.currency_code} wallet to pay this loan from.</ErrorNote>
            ) : (
              <fieldset className="space-y-2">
                <legend className="mb-1.5 text-sm font-medium">Pay from</legend>
                {sources.map((a) => (
                  <label
                    key={a.account_id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                      source?.account_id === a.account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                    )}
                  >
                    <span>
                      <span className="block font-medium">{walletName(a.purpose)}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {money(a.balance_minor)} available · {a.account_number}
                      </span>
                    </span>
                    <input type="radio" name="repay-source" checked={source?.account_id === a.account_id} onChange={() => setSourceId(a.account_id)} className="accent-emerald-700" />
                  </label>
                ))}
              </fieldset>
            )}

            <Summary>
              <SummaryRow label="Installment" value={`${next.installment_number} of ${loan.term_months}`} />
              <SummaryRow label="Still owed after this" value={money(loan.balance_remaining_minor - next.installment_amount_minor)} />
              <SummaryRow label="Amount" value={money(next.installment_amount_minor)} strong />
            </Summary>

            {short && <ErrorNote>Your {walletName(source!.purpose).toLowerCase()} has {money(source!.balance_minor)}. Add money first, or pay from another wallet.</ErrorNote>}
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button onClick={pay} disabled={busy || !source || short} className={primaryButton}>
              {busy ? "Paying…" : `Pay ${money(next.installment_amount_minor)}`}
            </Button>
          </div>
        )}

        {receipt && (
          <SuccessView
            title={receipt.new_balance_remaining_minor === 0 ? "Loan paid off" : `Installment ${receipt.schedule_installment_marked_paid} paid`}
            amount={money(receipt.amount_minor)}
            onDone={() => setOpen(false)}
          >
            <Summary>
              <SummaryRow label="From" value={source ? walletName(source.purpose) : "Your wallet"} />
              <SummaryRow label="Still owed" value={money(receipt.new_balance_remaining_minor)} />
              <SummaryRow label="Reference" value={<span className="font-mono text-xs">{shortRef(receipt.transaction_id)}</span>} />
            </Summary>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  );
}
