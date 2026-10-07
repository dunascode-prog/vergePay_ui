"use client";

import { ArrowLeft, Check, Copy, ExternalLink, Mail, MessageCircle, Pencil, Repeat, Send, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { dueLabel, formatDateTime, formatDay, money } from "@/lib/invoicing";
import { walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { cancelInvoice, deleteInvoice, getInvoice, payInvoice, refundInvoice, remindInvoice, sendInvoice } from "@/services/invoices";
import { ApiInvoice, InvoiceEmail } from "@/types/invoicing";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

type DialogKind = "send" | "remind" | "cancel" | "delete" | "refund" | "pay" | null;

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { dataVersion, reloadAccounts } = useAppData();
  const [invoice, setInvoice] = useState<ApiInvoice | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [justSent, setJustSent] = useState(params.get("sent") === "1");

  const load = useCallback(
    () =>
      getInvoice(invoiceId)
        .then((i) => {
          setInvoice(i);
          setLoadError(null);
        })
        .catch((err) => setLoadError(err instanceof ApiError && err.status === 404 ? "This invoice doesn't exist, or isn't yours." : "We couldn't load this invoice.")),
    [invoiceId],
  );

  // and again when money moves (a client paying the link credits the wallet)
  useEffect(() => {
    void load();
  }, [load, dataVersion]);

  // emails are sent by a background worker: check back while one is on its way
  const sending = invoice?.emails?.some((e) => e.status === "queued");
  useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(() => void load(), 2000);
    return () => clearTimeout(timer);
  }, [sending, invoice, load]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <BackLink />
        <ErrorNote>{loadError}</ErrorNote>
      </div>
    );
  }
  if (!invoice) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const issued = invoice.direction === "issued";
  const unpaid = invoice.invoice_status === "open" || invoice.invoice_status === "overdue";
  const title = invoice.invoice_number ?? "Draft invoice";
  const done = (next?: ApiInvoice) => {
    setDialog(null);
    if (next) setInvoice(next);
    void load();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <InvoiceStatusBadge status={invoice.invoice_status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {issued ? `To ${invoice.client?.name ?? `account ${invoice.billed_account_number}`}` : `From ${invoice.issuer_name}`} · {dueLabel(invoice)}
            {issued && invoice.recurring_plan_id && (
              <>
                {" · "}
                <Link href={`/dashboard/recurring/${invoice.recurring_plan_id}`} className="inline-flex items-center gap-1 underline-offset-2 hover:text-foreground hover:underline">
                  <Repeat className="size-3.5" /> From a recurring plan
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {issued && invoice.invoice_status === "draft" && (
            <>
              <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.invoice_id}/edit`)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="outline" onClick={() => setDialog("delete")} className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" /> Delete
              </Button>
              <Button onClick={() => setDialog("send")} className="bg-emerald-700 text-white hover:bg-emerald-800">
                <Send className="size-4" /> Send invoice
              </Button>
            </>
          )}
          {issued && unpaid && (
            <Button variant="outline" onClick={() => setDialog("cancel")}>
              <X className="size-4" /> Cancel invoice
            </Button>
          )}
          {issued && invoice.invoice_status === "paid" && invoice.paid_via === "wallet" && (
            <Button variant="outline" onClick={() => setDialog("refund")}>
              Refund
            </Button>
          )}
          {!issued && unpaid && (
            <Button onClick={() => setDialog("pay")} className="bg-emerald-700 text-white hover:bg-emerald-800">
              Pay {money(invoice.amount_due_minor, invoice.currency_code)}
            </Button>
          )}
        </div>
      </div>

      {justSent && unpaid && issued && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <span className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="font-medium">Invoice sent.</span>{" "}
              {invoice.emails?.some((e) => e.kind === "invoice")
                ? `We're emailing it to ${invoice.client?.email}. You can also share the pay link below.`
                : "Share the pay link below with your client."}
            </span>
          </span>
          <button onClick={() => setJustSent(false)} aria-label="Dismiss" className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <InvoiceDocument invoice={invoice} />
        <div className="space-y-5">
          {issued && unpaid && invoice.pay_url && <PayLinkCard invoice={invoice} onRemind={() => setDialog("remind")} />}
          <Activity invoice={invoice} />
        </div>
      </div>

      {dialog === "send" && <SendDialog invoice={invoice} onClose={() => setDialog(null)} onDone={(i) => { setJustSent(true); done(i); }} />}
      {dialog === "remind" && <RemindDialog invoice={invoice} onClose={() => setDialog(null)} onDone={() => done()} />}
      {dialog === "cancel" && (
        <ConfirmDialog
          title={`Cancel ${title}?`}
          body="Its pay link stops working and your client can no longer pay it. This can't be undone."
          action="Cancel invoice"
          destructive
          run={() => cancelInvoice(invoice.invoice_id)}
          onClose={() => setDialog(null)}
          onDone={(i) => done(i as ApiInvoice)}
        />
      )}
      {dialog === "delete" && (
        <ConfirmDialog
          title="Delete this draft?"
          body="It was never sent, so nobody has seen it."
          action="Delete draft"
          destructive
          run={() => deleteInvoice(invoice.invoice_id)}
          onClose={() => setDialog(null)}
          onDone={() => router.replace("/dashboard/invoices")}
        />
      )}
      {dialog === "refund" && (
        <RefundDialog
          invoice={invoice}
          onClose={() => setDialog(null)}
          onDone={() => {
            void reloadAccounts();
            done();
          }}
        />
      )}
      {dialog === "pay" && (
        <PayDialog
          invoice={invoice}
          onClose={() => setDialog(null)}
          onDone={() => {
            void reloadAccounts();
            done();
          }}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/invoices" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> Invoices
    </Link>
  );
}

/** The invoice itself, laid out like the document the client sees. */
function InvoiceDocument({ invoice }: { invoice: ApiInvoice }) {
  const { accounts } = useAppData();
  const wallet = accounts.find((a) => a.account_id === invoice.issuer_account_id);
  return (
    <article className="rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Amount due</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">{money(invoice.amount_due_minor, invoice.currency_code)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
          <dt className="text-muted-foreground">Issued</dt>
          <dd>{invoice.sent_at ? formatDay(invoice.sent_at) : "Not sent"}</dd>
          <dt className="text-muted-foreground">Due</dt>
          <dd>{formatDay(invoice.due_date)}</dd>
        </dl>
      </div>
      <div className="grid gap-4 border-b p-5 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-medium">{invoice.issuer_name}</p>
          {wallet && <p className="text-xs text-muted-foreground">Paid into your {walletName(wallet.purpose).toLowerCase()}</p>}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bill to</p>
          <p className="font-medium">{invoice.client?.name ?? `VergePay account ${invoice.billed_account_number}`}</p>
          {invoice.client?.email && <p className="truncate text-xs text-muted-foreground">{invoice.client.email}</p>}
        </div>
      </div>
      <div className="p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Item</th>
              <th className="hidden pb-2 text-right font-medium sm:table-cell">Qty</th>
              <th className="hidden pb-2 text-right font-medium sm:table-cell">Price</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.items.map((item, i) => (
              <tr key={item.item_id ?? i}>
                <td className="py-2.5 pr-3">
                  {item.description}
                  <span className="block text-xs text-muted-foreground sm:hidden">
                    {item.quantity} × {money(item.unit_amount_minor, invoice.currency_code)}
                  </span>
                </td>
                <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{item.quantity}</td>
                <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{money(item.unit_amount_minor, invoice.currency_code)}</td>
                <td className="py-2.5 text-right font-medium tabular-nums">{money(item.amount_minor, invoice.currency_code)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td className="pt-3 font-semibold" colSpan={1}>
                Total
              </td>
              <td className="hidden sm:table-cell" colSpan={2} />
              <td className="pt-3 text-right text-base font-semibold tabular-nums">{money(invoice.amount_due_minor, invoice.currency_code)}</td>
            </tr>
          </tfoot>
        </table>
        {invoice.notes && <p className="mt-5 rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-line text-muted-foreground">{invoice.notes}</p>}
      </div>
    </article>
  );
}

function PayLinkCard({ invoice, onRemind }: { invoice: ApiInvoice; onRemind: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = invoice.pay_url!;
  const message = `Hi${invoice.client ? ` ${invoice.client.name}` : ""}, here's invoice ${invoice.invoice_number} for ${money(invoice.amount_due_minor, invoice.currency_code)}, due ${formatDay(invoice.due_date)}. You can pay securely here: ${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the link is visible to copy by hand
    }
  };
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold">Pay link</h2>
        <p className="text-xs text-muted-foreground">Anyone with this link can pay the invoice by card, bank transfer or USSD.</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-1 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs" title={url}>
          {url.replace(/^https?:\/\//, "")}
        </span>
        <Button size="sm" variant="secondary" onClick={copy} aria-label="Copy pay link">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium hover:bg-muted"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        <Button
          variant="outline"
          className="h-9"
          onClick={onRemind}
          disabled={!invoice.client?.email}
          title={invoice.client?.email ? undefined : "This client has no email address"}
        >
          <Mail className="size-4" /> Remind
        </Button>
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        Preview what your client sees <ExternalLink className="size-3" />
      </a>
    </section>
  );
}

const EMAIL_WORD: Record<InvoiceEmail["kind"], string> = { invoice: "Invoice emailed", reminder: "Reminder emailed", receipt: "Receipt emailed" };

function Activity({ invoice }: { invoice: ApiInvoice }) {
  const events = useMemo(() => {
    // step: the natural order, for events with the same timestamp (created
    // and sent in one go share it)
    const list: { at: string; step: number; title: string; detail?: React.ReactNode; tone?: "good" | "bad" }[] = [
      { at: invoice.created_at, step: 0, title: "Created" },
    ];
    if (invoice.sent_at) list.push({ at: invoice.sent_at, step: 1, title: `Sent as ${invoice.invoice_number}` });
    for (const e of invoice.emails ?? []) {
      list.push({
        at: e.sent_at ?? e.created_at,
        step: 2,
        title: `${EMAIL_WORD[e.kind]} to ${e.to_address}`,
        tone: e.status === "failed" ? "bad" : undefined,
        detail:
          e.status === "queued" ? (
            "Sending…"
          ) : e.status === "failed" ? (
            `Couldn't send${e.error ? `: ${e.error}` : ""}`
          ) : e.preview_url ? (
            <a href={e.preview_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              View the email (test inbox) <ExternalLink className="size-3" />
            </a>
          ) : (
            "Delivered to the mail server"
          ),
      });
    }
    if (invoice.paid_at) {
      list.push({
        at: invoice.paid_at,
        step: 3,
        title: invoice.paid_via === "wallet" ? "Paid from a VergePay wallet" : "Paid by card or bank transfer",
        detail: invoice.paid_by_email ?? undefined,
        tone: "good",
      });
    }
    if (invoice.cancelled_at) list.push({ at: invoice.cancelled_at, step: 4, title: "Cancelled" });
    if (invoice.refunded_at) list.push({ at: invoice.refunded_at, step: 4, title: "Refunded", detail: invoice.refund_reason ?? undefined });
    const time = (iso: string) => new Date(iso).getTime();
    return list.sort((a, b) => time(b.at) - time(a.at) || b.step - a.step);
  }, [invoice]);

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Activity</h2>
      <ol className="space-y-3">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/40",
                e.tone === "good" && "bg-emerald-600",
                e.tone === "bad" && "bg-destructive",
              )}
            />
            <span className="min-w-0">
              <span className="block">{e.title}</span>
              <span className="block text-xs text-muted-foreground">
                {formatDateTime(e.at)}
                {e.detail ? <> · {e.detail}</> : null}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---- dialogs

function ActionDialog({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function useAction<T>(run: () => Promise<T>, onDone: (result: T) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await run());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };
  return { busy, error, go };
}

function ConfirmDialog<T>({ title, body, action, destructive, run, onClose, onDone }: { title: string; body: string; action: string; destructive?: boolean; run: () => Promise<T>; onClose: () => void; onDone: (r: T) => void }) {
  const { busy, error, go } = useAction(run, onDone);
  return (
    <ActionDialog title={title} description={body} onClose={onClose}>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Keep it
        </Button>
        <Button onClick={go} disabled={busy} className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : ""}>
          {busy ? "Working…" : action}
        </Button>
      </div>
    </ActionDialog>
  );
}

function SendDialog({ invoice, onClose, onDone }: { invoice: ApiInvoice; onClose: () => void; onDone: (i: ApiInvoice) => void }) {
  const hasEmail = !!invoice.client?.email;
  const [emailIt, setEmailIt] = useState(hasEmail);
  const { busy, error, go } = useAction(() => sendInvoice(invoice.invoice_id, emailIt), onDone);
  return (
    <ActionDialog
      title={`Send to ${invoice.client?.name}?`}
      description={`It gets a number and a pay link for ${money(invoice.amount_due_minor, invoice.currency_code)}. You can't edit it after this.`}
      onClose={onClose}
    >
      {hasEmail ? (
        <label className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3 text-sm">
          <input type="checkbox" checked={emailIt} onChange={(e) => setEmailIt(e.target.checked)} className="mt-0.5 accent-emerald-700" />
          <span>
            Email it to <span className="font-medium">{invoice.client?.email}</span>
          </span>
        </label>
      ) : (
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">This client has no email address, so share the pay link yourself after sending.</p>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button onClick={go} disabled={busy} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
        {busy ? "Sending…" : "Send invoice"}
      </Button>
    </ActionDialog>
  );
}

function RemindDialog({ invoice, onClose, onDone }: { invoice: ApiInvoice; onClose: () => void; onDone: () => void }) {
  const [message, setMessage] = useState("");
  const { busy, error, go } = useAction(() => remindInvoice(invoice.invoice_id, message.trim() || undefined), onDone);
  return (
    <ActionDialog title="Send a reminder" description={`We'll email ${invoice.client?.email} the invoice again, with its pay link.`} onClose={onClose}>
      <div className="space-y-1.5">
        <Label htmlFor="remind-message">Add a message (optional)</Label>
        <Textarea id="remind-message" rows={3} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Just checking this reached you." />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button onClick={go} disabled={busy} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
        {busy ? "Sending…" : "Send reminder"}
      </Button>
    </ActionDialog>
  );
}

function RefundDialog({ invoice, onClose, onDone }: { invoice: ApiInvoice; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const { busy, error, go } = useAction(() => refundInvoice(invoice.invoice_id, reason.trim() || undefined, key), onDone);
  return (
    <ActionDialog
      title={`Refund ${money(invoice.amount_due_minor, invoice.currency_code)}?`}
      description="The full amount goes back to the wallet it was paid from."
      onClose={onClose}
    >
      <div className="space-y-1.5">
        <Label htmlFor="refund-reason">Reason (optional)</Label>
        <Textarea id="refund-reason" rows={2} maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button onClick={go} disabled={busy} className="h-11 w-full rounded-lg">
        {busy ? "Refunding…" : "Refund"}
      </Button>
    </ActionDialog>
  );
}

function PayDialog({ invoice, onClose, onDone }: { invoice: ApiInvoice; onClose: () => void; onDone: () => void }) {
  const { accounts } = useAppData();
  const options = useMemo(() => {
    const { personal, business } = walletsOf(accounts);
    return [personal, business].filter((w): w is NonNullable<typeof w> => !!w && w.currency_code === invoice.currency_code && w.account_status === "active");
  }, [accounts, invoice.currency_code]);
  const [source, setSource] = useState(options[0]?.account_id ?? "");
  const [key] = useState(() => crypto.randomUUID());
  const { busy, error, go } = useAction(() => payInvoice(invoice.invoice_id, source, key), onDone);
  return (
    <ActionDialog title={`Pay ${invoice.issuer_name}`} description={`${invoice.invoice_number} · ${money(invoice.amount_due_minor, invoice.currency_code)}`} onClose={onClose}>
      {options.length === 0 ? (
        <ErrorNote>You need a {invoice.currency_code} wallet to pay this invoice.</ErrorNote>
      ) : (
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">Pay from</legend>
          {options.map((w) => (
            <label key={w.account_id} className={cn("flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm", source === w.account_id && "border-emerald-700")}>
              <span>
                <span className="block font-medium">{walletName(w.purpose)}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">Balance {money(w.balance_minor, w.currency_code)}</span>
              </span>
              <input type="radio" name="source" checked={source === w.account_id} onChange={() => setSource(w.account_id)} className="accent-emerald-700" />
            </label>
          ))}
        </fieldset>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button onClick={go} disabled={busy || !source} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
        {busy ? "Paying…" : `Pay ${money(invoice.amount_due_minor, invoice.currency_code)}`}
      </Button>
    </ActionDialog>
  );
}
