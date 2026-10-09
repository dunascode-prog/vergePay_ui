"use client";

import { AlertTriangle, ArrowLeft, Ban, Check, Pause, Pencil, Play, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAppData } from "@/components/app-data";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { formatDay, groupDigits, money } from "@/lib/invoicing";
import { walletName } from "@/lib/ledger";
import { EVERY, FREQUENCY_LABEL, billingDate, termsLabel } from "@/lib/recurring";
import { cn } from "@/lib/utils";
import { cancelRecurringPlan, getRecurringPlan, pauseRecurringPlan, resumeRecurringPlan, updateRecurringPlan } from "@/services/recurring";
import { ApiRecurringPlan } from "@/types/recurring";
import { RecurringStatusBadge } from "./RecurringStatusBadge";
import { pageClass } from "@/lib/layout";

type DialogKind = "edit" | "cancel" | null;
const TERMS = [0, 7, 14, 30];

/** The next `count` billing dates from the plan's next one. */
function upcoming(plan: ApiRecurringPlan, count = 3): string[] {
  if (!plan.next_billing_date) return [];
  let n = 0;
  while (billingDate(plan.start_date, plan.frequency, n) < plan.next_billing_date && n < 6000) n++;
  return Array.from({ length: count }, (_, i) => billingDate(plan.start_date, plan.frequency, n + i));
}

/** /dashboard/recurring/[id] */
export function RecurringPlanDetail({ planId }: { planId: string }) {
  const params = useSearchParams();
  const { dataVersion } = useAppData();
  const [plan, setPlan] = useState<ApiRecurringPlan | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(params.get("created") === "1");

  const load = useCallback(
    () =>
      getRecurringPlan(planId)
        .then((p) => {
          setPlan(p);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof ApiError && err.status === 404 ? "This plan doesn't exist, or isn't yours." : "We couldn't load this plan.")),
    [planId],
  );

  // and again when something changes, e.g. the plan sends an invoice or a client pays one
  useEffect(() => {
    void load();
  }, [load, dataVersion]);

  const act = async (run: () => Promise<ApiRecurringPlan>) => {
    setBusy(true);
    setActionError(null);
    try {
      setPlan(await run());
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className={pageClass("narrow")}>
        <BackLink />
        <ErrorNote>{loadError}</ErrorNote>
      </div>
    );
  }
  if (!plan) {
    return (
      <div className={pageClass("narrow")}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  const invoices = plan.invoices ?? [];
  const live = plan.plan_status !== "cancelled";
  const dates = plan.plan_status === "active" ? upcoming(plan) : [];

  return (
    <div className={pageClass("narrow", { stack: false })}>
      <BackLink />
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-xl font-semibold tracking-tight">{plan.description}</h1>
            <RecurringStatusBadge status={plan.plan_status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.client.name} · {money(plan.amount_minor, plan.currency_code)} {EVERY[plan.frequency]}
          </p>
        </div>
        {live && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDialog("edit")} disabled={busy}>
              <Pencil className="size-4" /> Edit
            </Button>
            {plan.plan_status === "paused" ? (
              <Button onClick={() => act(() => resumeRecurringPlan(plan.plan_id))} disabled={busy} className="bg-emerald-700 text-white hover:bg-emerald-800">
                <Play className="size-4" /> {busy ? "Resuming…" : "Resume"}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => act(() => pauseRecurringPlan(plan.plan_id))} disabled={busy}>
                <Pause className="size-4" /> {busy ? "Pausing…" : "Pause"}
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialog("cancel")} disabled={busy} className="text-destructive hover:text-destructive">
              <Ban className="size-4" /> Cancel plan
            </Button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="mb-5">
          <ErrorNote>{actionError}</ErrorNote>
        </div>
      )}

      {justCreated && (
        <Banner tone="success" onDismiss={() => setJustCreated(false)}>
          <span className="font-medium">Plan created.</span>{" "}
          {invoices[0]
            ? plan.send_email && plan.client.email
              ? `${invoices[0].invoice_number} is on its way to ${plan.client.name} at ${plan.client.email}.`
              : `${invoices[0].invoice_number} is ready: share its pay link with ${plan.client.name} from the invoice.`
            : plan.next_billing_date
              ? `The first invoice goes out on ${formatDay(plan.next_billing_date)}.`
              : ""}
        </Banner>
      )}

      {plan.plan_status === "active" && plan.last_error && (
        <Banner tone="warning">
          <span className="font-medium">The last invoice didn&apos;t send.</span> {plan.last_error} We&apos;ll try again shortly; fix it, or pause the plan.
        </Banner>
      )}

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-xl border bg-card">
            <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2">
              <Item label="Bill to" value={plan.client.name} sub={plan.client.email ?? "No email: share each pay link yourself"} />
              <Item label="Amount" value={money(plan.amount_minor, plan.currency_code)} sub={`${FREQUENCY_LABEL[plan.frequency]} · ${termsLabel(plan.days_until_due).toLowerCase()}`} />
              <Item
                label="Next invoice"
                value={plan.plan_status === "active" && plan.next_billing_date ? formatDay(plan.next_billing_date) : "—"}
                sub={plan.plan_status === "paused" ? "Paused: resuming picks up from the next date" : plan.plan_status === "cancelled" ? "Cancelled" : undefined}
              />
              <Item label="Paid into" value={walletName(plan.issuer_account_purpose)} sub={`${plan.currency_code} · ${plan.issuer_account_number}`} />
              <Item label="Emails the client" value={plan.send_email && plan.client.email ? "Yes, each invoice" : "No"} />
              <Item label="Started" value={formatDay(plan.start_date)} sub={`${plan.invoices_generated} invoice${plan.invoices_generated === 1 ? "" : "s"} sent`} />
              {plan.notes && <Item label="Note on each invoice" value={plan.notes} wide />}
            </dl>
          </section>

          <section className="rounded-xl border bg-card">
            <h2 className="border-b px-5 py-3 text-sm font-semibold">Invoices sent</h2>
            {invoices.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                None yet.{plan.plan_status === "active" && plan.next_billing_date ? ` The first goes out on ${formatDay(plan.next_billing_date)}.` : ""}
              </p>
            ) : (
              <ul className="divide-y">
                {invoices.map((i) => (
                  <li key={i.invoice_id}>
                    <Link href={`/dashboard/invoices/${i.invoice_id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/40">
                      <span className="min-w-0">
                        <span className="block font-medium">{i.invoice_number}</span>
                        <span className="block text-xs text-muted-foreground">
                          Sent {i.sent_at ? formatDay(i.sent_at) : "—"} · due {formatDay(i.due_date)}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-medium tabular-nums">{money(i.amount_due_minor, i.currency_code)}</span>
                        <InvoiceStatusBadge status={i.invoice_status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
          <p className="text-xs text-muted-foreground">Coming up</p>
          {dates.length ? (
            <ol className="space-y-2 text-sm">
              {dates.map((d) => (
                <li key={d} className="flex justify-between gap-2 tabular-nums">
                  <span>{formatDay(d)}</span>
                  <span className="text-muted-foreground">{money(plan.amount_minor, plan.currency_code)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">{plan.plan_status === "paused" ? "Nothing while paused." : "Nothing: this plan is cancelled."}</p>
          )}
          {live && <p className="text-xs text-muted-foreground">Changes to the amount or terms apply to invoices not sent yet.</p>}
        </aside>
      </div>

      {dialog === "edit" && (
        <EditDialog
          plan={plan}
          onClose={() => setDialog(null)}
          onSaved={(p) => {
            setPlan(p);
            setDialog(null);
          }}
        />
      )}
      {dialog === "cancel" && (
        <Dialog open onOpenChange={(open) => !open && setDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel this plan?</DialogTitle>
              <DialogDescription>
                No more invoices go to {plan.client.name} for {plan.description}. Invoices already sent stay as they are. This can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Keep plan
              </Button>
              <Button
                onClick={async () => {
                  setDialog(null);
                  await act(() => cancelRecurringPlan(plan.plan_id));
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Cancel plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/recurring" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Recurring billing
    </Link>
  );
}

function Item({ label, value, sub, wide }: { label: string; value: string; sub?: string; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-break-word">{value}</dd>
      {sub && <dd className="truncate text-xs text-muted-foreground">{sub}</dd>}
    </div>
  );
}

function Banner({ tone, children, onDismiss }: { tone: "success" | "warning"; children: React.ReactNode; onDismiss?: () => void }) {
  const Icon = tone === "success" ? Check : AlertTriangle;
  return (
    <div
      role={tone === "warning" ? "alert" : "status"}
      className={cn(
        "mb-5 flex items-start justify-between gap-3 rounded-xl border p-4 text-sm",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
          : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
      )}
    >
      <span className="flex gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <span>{children}</span>
      </span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function EditDialog({ plan, onClose, onSaved }: { plan: ApiRecurringPlan; onClose: () => void; onSaved: (p: ApiRecurringPlan) => void }) {
  const [description, setDescription] = useState(plan.description);
  const [amount, setAmount] = useState(groupDigits(String(plan.amount_minor / 100)));
  const [terms, setTerms] = useState(plan.days_until_due);
  const [emailIt, setEmailIt] = useState(plan.send_email);
  const [notes, setNotes] = useState(plan.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountMinor = toMinor(amount);

  const save = async () => {
    if (!description.trim()) return setError("Say what the invoices are for.");
    if (!amountMinor) return setError("Enter an amount.");
    setBusy(true);
    setError(null);
    try {
      onSaved(
        await updateRecurringPlan(plan.plan_id, {
          description: description.trim(),
          amount_minor: amountMinor,
          days_until_due: terms,
          send_email: emailIt,
          notes: notes.trim() || null,
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit plan</DialogTitle>
          <DialogDescription>Applies to invoices not sent yet. To change the client or how often, cancel this plan and make a new one.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">What it&apos;s for</Label>
            <Input id="edit-description" maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-amount">Amount ({plan.currency_code})</Label>
            <Input id="edit-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(groupDigits(e.target.value))} className="tabular-nums" />
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Payment due</legend>
            <div className="flex flex-wrap gap-1.5">
              {TERMS.map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={terms === days}
                  onClick={() => setTerms(days)}
                  className={cn(
                    "h-9 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground",
                    terms === days && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  )}
                >
                  {days === 0 ? "On receipt" : `${days} days`}
                </button>
              ))}
            </div>
          </fieldset>
          {plan.client.email && (
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={emailIt} onChange={(e) => setEmailIt(e.target.checked)} className="accent-emerald-700" />
              Email each invoice to {plan.client.email}
            </label>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Note on each invoice</Label>
            <Textarea id="edit-notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy} className="bg-emerald-700 text-white hover:bg-emerald-800">
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
