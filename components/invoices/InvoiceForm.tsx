"use client";

import { ArrowLeft, Mail, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { toMinor } from "@/components/money/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { formatDay, groupDigits, isoDay, lineAmount, money } from "@/lib/invoicing";
import { walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { createInvoice, getInvoice, listClients, sendInvoice, updateInvoice } from "@/services/invoices";
import { ApiClient, ApiInvoice } from "@/types/invoicing";
import { NewClientDialog } from "./NewClientDialog";

interface Line {
  key: number;
  description: string;
  quantity: string;
  rate: string;
}

const NEW_CLIENT = "__new__";
const DUE_PRESETS = [7, 14, 30];
let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, description: "", quantity: "1", rate: "" });

const minorToText = (minor: number) => groupDigits(String(minor / 100));
const parseQuantity = (text: string) => (/^\d+(\.\d{1,2})?$/.test(text.trim()) ? Number(text) : null);

/** New invoice, or editing a draft (invoiceId). */
export function InvoiceForm({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const { accounts, accountsState } = useAppData();
  const wallets = useMemo(() => {
    const { personal, business } = walletsOf(accounts);
    return [business, personal].filter((a): a is NonNullable<typeof a> => !!a && a.account_status === "active");
  }, [accounts]);

  const [clients, setClients] = useState<ApiClient[] | null>(null);
  const [clientId, setClientId] = useState("");
  const [chosenWalletId, setWalletId] = useState("");
  const [dueDate, setDueDate] = useState(isoDay(14));
  const [lines, setLines] = useState<Line[]>(() => [emptyLine()]);
  const [notes, setNotes] = useState("");
  const [emailIt, setEmailIt] = useState(true);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draft" | "send" | null>(null);
  const [loaded, setLoaded] = useState(!invoiceId);

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  // editing: start from the draft
  useEffect(() => {
    if (!invoiceId) return;
    getInvoice(invoiceId)
      .then((invoice: ApiInvoice) => {
        if (invoice.invoice_status !== "draft") return router.replace(`/dashboard/invoices/${invoiceId}`);
        setClientId(invoice.client?.client_id ?? "");
        setWalletId(invoice.issuer_account_id);
        setDueDate(invoice.due_date);
        setNotes(invoice.notes ?? "");
        setLines(invoice.items.map((i) => ({ key: nextKey++, description: i.description, quantity: String(i.quantity), rate: minorToText(i.unit_amount_minor) })));
        setLoaded(true);
      })
      .catch(() => setFormError("We couldn't load this draft."));
  }, [invoiceId, router]);

  // default wallet: business if there is one
  const walletId = chosenWalletId || wallets[0]?.account_id || "";
  const wallet = wallets.find((w) => w.account_id === walletId);
  const currency = wallet?.currency_code ?? "NGN";
  const client = clients?.find((c) => c.client_id === clientId);
  const priced = lines.map((l) => {
    const quantity = parseQuantity(l.quantity);
    const rate = toMinor(l.rate);
    return { ...l, quantityValue: quantity, rateMinor: rate, amount: quantity && rate ? lineAmount({ quantity, unit_amount_minor: rate }) : 0 };
  });
  const total = priced.reduce((sum, l) => sum + l.amount, 0);

  const update = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!clientId) next.client = "Choose who you're billing.";
    if (!walletId) next.wallet = "Choose the wallet to be paid into.";
    if (!dueDate || dueDate < isoDay()) next.due = "Pick today or a later date.";
    priced.forEach((l, i) => {
      if (!l.description.trim()) next[`line-${i}-description`] = "Describe the work.";
      if (!l.quantityValue || l.quantityValue <= 0) next[`line-${i}-quantity`] = "Up to 2 decimals.";
      if (!l.rateMinor) next[`line-${i}-rate`] = "Enter a price.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (mode: "draft" | "send") => {
    setFormError(null);
    if (!validate()) return;
    setBusy(mode);
    const items = priced.map((l) => ({ description: l.description.trim(), quantity: l.quantityValue!, unit_amount_minor: l.rateMinor! }));
    const sendEmail = emailIt && !!client?.email;
    try {
      let saved: ApiInvoice;
      if (invoiceId) {
        saved = await updateInvoice(invoiceId, { issuer_account_id: walletId, client_id: clientId, items, due_date: dueDate, notes: notes.trim() || null });
        if (mode === "send") saved = await sendInvoice(invoiceId, sendEmail);
      } else {
        saved = await createInvoice({
          issuer_account_id: walletId,
          client_id: clientId,
          items,
          due_date: dueDate,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          send: mode === "send",
          send_email: sendEmail,
        });
      }
      router.push(`/dashboard/invoices/${saved.invoice_id}${mode === "send" ? "?sent=1" : ""}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save the invoice. Please try again.");
      setBusy(null);
    }
  };

  if (!loaded || accountsState === "loading") {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (wallets.length === 0) {
    return <ErrorNote>Open a wallet first: invoices are paid into it.</ErrorNote>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={invoiceId ? `/dashboard/invoices/${invoiceId}` : "/dashboard/invoices"} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {invoiceId ? "Back to invoice" : "Invoices"}
      </Link>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">{invoiceId ? "Edit draft" : "New invoice"}</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          {/* who and where */}
          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="client">Bill to</Label>
                <select
                  id="client"
                  value={clientId}
                  onChange={(e) => (e.target.value === NEW_CLIENT ? setNewClientOpen(true) : setClientId(e.target.value))}
                  aria-invalid={!!errors.client}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-emerald-600 focus-visible:ring-3 focus-visible:ring-emerald-600/15",
                    errors.client && "border-destructive",
                  )}
                >
                  <option value="" disabled>
                    {clients === null ? "Loading clients…" : clients.length ? "Choose a client" : "No clients yet"}
                  </option>
                  {clients?.map((c) => (
                    <option key={c.client_id} value={c.client_id}>
                      {c.name}
                    </option>
                  ))}
                  <option value={NEW_CLIENT}>＋ New client…</option>
                </select>
                {errors.client ? (
                  <p className="text-xs text-destructive">{errors.client}</p>
                ) : client ? (
                  <p className="truncate text-xs text-muted-foreground">{client.email ?? "No email: you'll share the pay link yourself."}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due">Due date</Label>
                <Input id="due" type="date" min={isoDay()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-invalid={!!errors.due} className="h-11" />
                <div className="flex gap-1.5">
                  {DUE_PRESETS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDueDate(isoDay(days))}
                      aria-pressed={dueDate === isoDay(days)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground",
                        dueDate === isoDay(days) && "border-emerald-700 text-emerald-800 dark:text-emerald-300",
                      )}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
                {errors.due && <p className="text-xs text-destructive">{errors.due}</p>}
              </div>
            </div>

            {wallets.length > 1 && (
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Paid into</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {wallets.map((w) => (
                    <label
                      key={w.account_id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm has-focus-visible:ring-3 has-focus-visible:ring-emerald-600/15",
                        walletId === w.account_id && "border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{walletName(w.purpose)}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {w.currency_code} · {w.account_number}
                        </span>
                      </span>
                      <input type="radio" name="wallet" value={w.account_id} checked={walletId === w.account_id} onChange={() => setWalletId(w.account_id)} className="accent-emerald-700" />
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>

          {/* items */}
          <section className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold">Items</h2>
              <span className="text-xs text-muted-foreground">{currency}</span>
            </div>
            <div className="hidden grid-cols-[1fr_5rem_9rem_8rem_2rem] gap-2 px-5 pt-3 text-xs text-muted-foreground sm:grid">
              <span>Description</span>
              <span>Qty</span>
              <span>Price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            <ul className="divide-y sm:divide-y-0">
              {priced.map((l, i) => (
                <li key={l.key} className="grid grid-cols-[1fr_auto] gap-2 px-4 py-3 sm:grid-cols-[1fr_5rem_9rem_8rem_2rem] sm:items-start sm:px-5 sm:py-1.5">
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      aria-label={`Item ${i + 1} description`}
                      placeholder="e.g. Logo design"
                      value={l.description}
                      onChange={(e) => update(l.key, { description: e.target.value })}
                      aria-invalid={!!errors[`line-${i}-description`]}
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2 sm:contents">
                    <Input
                      aria-label={`Item ${i + 1} quantity`}
                      inputMode="decimal"
                      value={l.quantity}
                      onChange={(e) => update(l.key, { quantity: e.target.value.replace(/[^\d.]/g, "") })}
                      aria-invalid={!!errors[`line-${i}-quantity`]}
                      className="h-10 w-20 tabular-nums"
                    />
                    <Input
                      aria-label={`Item ${i + 1} price`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={l.rate}
                      onChange={(e) => update(l.key, { rate: groupDigits(e.target.value) })}
                      aria-invalid={!!errors[`line-${i}-rate`]}
                      className="h-10 w-32 tabular-nums sm:w-full"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1 sm:contents">
                    <span className="self-center text-right text-sm font-medium tabular-nums sm:pt-2.5">{money(l.amount, currency)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove item ${i + 1}`}
                      disabled={lines.length === 1}
                      onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {(errors[`line-${i}-description`] || errors[`line-${i}-quantity`] || errors[`line-${i}-rate`]) && (
                    <p className="col-span-2 text-xs text-destructive sm:col-span-5">
                      {errors[`line-${i}-description`] ?? errors[`line-${i}-quantity`] ?? errors[`line-${i}-rate`]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="px-4 pt-1 pb-4 sm:px-5">
              <Button type="button" variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, emptyLine()])} disabled={lines.length >= 50}>
                <Plus className="size-4" /> Add item
              </Button>
            </div>
          </section>

          <section className="space-y-1.5 rounded-xl border bg-card p-4 sm:p-5">
            <Label htmlFor="notes">Note to client (optional)</Label>
            <Textarea id="notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thanks for your business. Payment terms, project reference…" />
          </section>
        </div>

        {/* summary and actions */}
        <aside className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
          <div>
            <p className="text-xs text-muted-foreground">Total due</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{money(total, currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {client ? client.name : "No client yet"} · due {dueDate ? formatDay(dueDate) : "—"}
            </p>
          </div>
          {client?.email && (
            <label className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3 text-sm">
              <input type="checkbox" checked={emailIt} onChange={(e) => setEmailIt(e.target.checked)} className="mt-0.5 accent-emerald-700" />
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="size-3.5" /> Email it to the client
                </span>
                <span className="block truncate text-xs text-muted-foreground">{client.email}</span>
              </span>
            </label>
          )}
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <div className="space-y-2">
            <Button onClick={() => submit("send")} disabled={busy !== null} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
              {busy === "send" ? "Sending…" : "Send invoice"}
            </Button>
            <Button variant="outline" onClick={() => submit("draft")} disabled={busy !== null} className="h-11 w-full rounded-lg">
              {busy === "draft" ? "Saving…" : invoiceId ? "Save draft" : "Save as draft"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sending gives it a number and a secure pay link. Your client pays by card, bank transfer or USSD, straight into your {wallet ? walletName(wallet.purpose).toLowerCase() : "wallet"}.
          </p>
        </aside>
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onCreated={(created) => {
          setClients((cs) => [...(cs ?? []), created].sort((a, b) => a.name.localeCompare(b.name)));
          setClientId(created.client_id);
          setNewClientOpen(false);
        }}
      />
    </div>
  );
}
