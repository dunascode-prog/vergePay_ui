"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { ErrorNote, StepHeader } from "@/components/money/parts";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDay } from "@/lib/invoicing";
import { formatMinor } from "@/lib/ledger";
import { LOAN_TERMS_PDF } from "@/lib/loans";
import { getLoanTerms } from "@/services/loans";
import { LoanTerms } from "@/types/loan";

/**
 * The loan terms, shown before an application is sent: how the loan works,
 * in plain language with the real numbers from the API, the full terms to
 * download, and one box to agree (which includes automatic repayments).
 * `onAgree` gets the version agreed to; the API records it on the application.
 * Give it a new `key` each time it opens, so the box starts unticked.
 */
export function LoanTermsDialog({
  open,
  onOpenChange,
  currency,
  busy,
  error,
  onAgree,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  busy: boolean;
  /** Shown under the box, e.g. the application was refused. */
  error?: string | null;
  onAgree: (termsVersion: string) => void;
}) {
  const [terms, setTerms] = useState<LoanTerms | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // fresh terms each time it opens, and the box unticked
  useEffect(() => {
    if (!open) return;
    let live = true;
    getLoanTerms()
      .then((t) => {
        if (!live) return;
        setTerms(t);
        setLoadError(null);
      })
      .catch((err) => live && setLoadError(err instanceof ApiError ? err.message : "Couldn't load the loan terms. Please try again."));
    return () => {
      live = false;
    };
  }, [open]);

  const change = (value: boolean) => onOpenChange(value);

  const money = (minor: number) => formatMinor(minor, "NGN", { compact: false }).replace(/\.00$/, "");
  const pdf = terms ? LOAN_TERMS_PDF[terms.version] : undefined;

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-lg">
        <StepHeader title="Loan terms" subtitle="Please read how your loan works before you apply." />

        {loadError ? (
          <ErrorNote>{loadError}</ErrorNote>
        ) : !terms ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border bg-muted/30 p-4 text-sm" tabIndex={0} aria-label="How your loan works">
              <Section title="How it's paid out">
                If it&apos;s approved, the loan goes straight into the wallet you chose, in that wallet&apos;s currency ({currency}). We set a fixed
                interest rate when we approve it, and you&apos;ll see the rate and your full repayment schedule in the app.
              </Section>
              <Section title="How you repay">
                Equal monthly instalments at a fixed rate, the first one a month after payout. Each instalment&apos;s date and amount are in the app from day one.
              </Section>
              <Section title="Automatic repayments">
                On each due date we take the instalment from that wallet. If there isn&apos;t enough, we take nothing and try again each day, and tell you
                (at most every 3 days). You can switch this off, and on again, from your loan.
              </Section>
              <Section title="Paying early, more, or off">
                Pay any amount from {money(terms.min_repayment_minor)}. It goes to late fees first, then to what&apos;s overdue, then your next instalment;
                anything more shortens your loan. Pay it all off at any time and you only pay interest up to that day.
              </Section>
              <Section title="If you pay late">
                {terms.grace_days} days after a due date, a one-off late fee of {terms.late_fee_bps / 100}% of that instalment (at least{" "}
                {money(terms.late_fee_min_minor)}) is added. It never grows.
              </Section>
              <Section title="Default">
                {`If a payment is more than ${terms.default_after_days} days overdue, your loan is in default and you can't take another loan until you catch up.`}
              </Section>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" aria-hidden />
                Version {terms.version} · effective {formatDay(terms.effective_date)}
              </span>
              {pdf && (
                <a
                  href={pdf}
                  download
                  className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  <Download className="size-3.5" aria-hidden /> Download the full terms (PDF)
                </a>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" aria-label="I agree to the loan terms" />
              <span>
                I&apos;ve read and agree to the loan terms, including automatic repayments from my wallet.
              </span>
            </label>
          </>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => change(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => terms && onAgree(terms.version)} disabled={!terms || !agreed || busy} className={`${primaryButton} sm:w-auto sm:px-5`}>
            {busy ? "Sending…" : "Agree and apply"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-0.5 text-muted-foreground">{children}</p>
    </section>
  );
}
