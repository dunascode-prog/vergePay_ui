"use client";

import { ArrowLeft, Mail, Repeat } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { NewClientDialog } from "@/components/invoices/NewClientDialog";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { formatDay, groupDigits, isoDay, money } from "@/lib/invoicing";
import { walletName, walletsOf } from "@/lib/ledger";
import { EVERY, FREQUENCY_LABEL, firstBillingDates, termsLabel } from "@/lib/recurring";
import { cn } from "@/lib/utils";
import { listClients } from "@/services/invoices";
import { createRecurringPlan } from "@/services/recurring";
import { ApiClient } from "@/types/invoicing";
import { RecurringFrequency } from "@/types/recurring";
import { pageClass } from "@/lib/layout";

const NEW_CLIENT = "__new__";
const FREQUENCIES: RecurringFrequency[] = ["weekly", "monthly", "quarterly", "yearly"];
const TERMS = [0, 7, 14, 30];

const fieldClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-emerald-600 focus-visible:ring-3 focus-visible:ring-emerald-600/15";

function firstOfNextMonth() {
  const d = new Date();
  return isoDayOf(new Date(d.getFullYear(), d.getMonth() + 1, 1));
}
const isoDayOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** /dashboard/recurring/new */
export function RecurringPlanForm() {
  const router = useRouter();
  const { accounts, accountsState } = useAppData();
  const wallets = useMemo(() => {
    const { personal, business } = walletsOf(accounts);
    return [business, personal].filter((a): a is NonNullable<typeof a> => !!a && a.account_status === "active");
  }, [accounts]);

  const params = useSearchParams();
  const [clients, setClients] = useState<ApiClient[] | null>(null);
  // ?client=<id>: started from the clients page
  const [clientId, setClientId] = useState(() => params.get("client") ?? "");
  const [chosenWalletId, setWalletId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [startDate, setStartDate] = useState(isoDay());
  const [terms, setTerms] = useState(14);
  const [emailIt, setEmailIt] = useState(true);
  const [notes, setNotes] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  // default wallet: business if there is one
  const walletId = chosenWalletId || wallets[0]?.account_id || "";
  const wallet = wallets.find((w) => w.account_id === walletId);
  const currency = wallet?.currency_code ?? "NGN";
  const client = clients?.find((c) => c.client_id === clientId);
  const amountMinor = toMinor(amount);
  const startsToday = startDate === isoDay();
  const dates = startDate ? firstBillingDates(startDate, frequency, 3) : [];

  const validate = () => {
    const next: Record<string, string> = {};
    if (!clientId) next.client = "Choose who you're billing.";
    if (!walletId) next.wallet = "Choose the wallet to be paid into.";
    if (!description.trim()) next.description = "Say what the invoices are for.";
    if (!amountMinor) next.amount = "Enter an amount.";
    if (!startDate || startDate < isoDay()) next.start = "Pick today or a later date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setFormError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const plan = await createRecurringPlan({
        issuer_account_id: walletId,
        client_id: clientId,
        description: description.trim(),
        amount_minor: amountMinor!,
        frequency,
        start_date: startDate,
        days_until_due: terms,
        send_email: emailIt && !!client?.email,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      router.push(`/dashboard/recurring/${plan.plan_id}?created=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        const f = err.fieldErrors();
        setErrors({ start: f.start_date, client: f.client_id, amount: f.amount_minor, description: f.description, wallet: f.issuer_account_id });
      }
      setFormError(err instanceof ApiError ? err.message : "Couldn't create the plan. Please try again.");
      setBusy(false);
    }
  };

  if (accountsState === "loading") {
    return (
      <div className={pageClass("narrow")}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (wallets.length === 0) {
    return <ErrorNote>Open a wallet first: recurring invoices are paid into it.</ErrorNote>;
  }

  return (
    <div className={pageClass("narrow", { stack: false })}>
      <Link href="/dashboard/recurring" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Recurring billing
      </Link>
      <h1 className="mb-5 text-xl font-semibold tracking-tight sm:mb-6">New plan</h1>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          {/* who and where */}
          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="space-y-1.5">
              <Label htmlFor="client">Bill to</Label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => (e.target.value === NEW_CLIENT ? setNewClientOpen(true) : setClientId(e.target.value))}
                aria-invalid={!!errors.client}
                className={cn(fieldClass, errors.client && "border-destructive")}
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
                <p className="truncate text-xs text-muted-foreground">{client.email ?? "No email: you'll share each pay link yourself."}</p>
              ) : null}
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

          {/* what and how much */}
          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="space-y-1.5">
              <Label htmlFor="description">What it&apos;s for</Label>
              <Input
                id="description"
                placeholder="e.g. Monthly retainer, website care"
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={!!errors.description}
                className="h-11"
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Each invoice has this as its line, with the dates it covers.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(groupDigits(e.target.value))}
                  aria-invalid={!!errors.amount}
                  className="h-11 tabular-nums"
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">How often</legend>
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={frequency === f}
                      onClick={() => setFrequency(f)}
                      className={cn(
                        "h-9 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground sm:text-sm",
                        frequency === f && "bg-background text-foreground shadow-sm",
                      )}
                    >
                      {FREQUENCY_LABEL[f]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          {/* when */}
          <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start">First invoice</Label>
                <Input id="start" type="date" min={isoDay()} value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-invalid={!!errors.start} className="h-11" />
                <div className="flex gap-1.5">
                  {[
                    { label: "Today", value: isoDay() },
                    { label: "1st of next month", value: firstOfNextMonth() },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setStartDate(p.value)}
                      aria-pressed={startDate === p.value}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-sm text-muted-foreground hover:text-foreground",
                        startDate === p.value && "border-emerald-700 text-emerald-800 dark:text-emerald-300",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {errors.start && <p className="text-xs text-destructive">{errors.start}</p>}
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
                <p className="text-xs text-muted-foreground">How long the client has to pay each invoice.</p>
              </fieldset>
            </div>
          </section>

          <section className="space-y-1.5 rounded-xl border bg-card p-4 sm:p-5">
            <Label htmlFor="notes">Note on each invoice (optional)</Label>
            <Textarea id="notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thanks for your business. Project reference…" />
          </section>
        </div>

        {/* summary and action */}
        <aside className="space-y-4 rounded-xl border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Repeat className="size-3.5" /> {client ? client.name : "No client yet"}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{money(amountMinor ?? 0, currency)}</p>
            <p className="text-sm text-muted-foreground">
              {EVERY[frequency]} · {termsLabel(terms).toLowerCase()}
            </p>
          </div>
          {dates.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-1.5 text-xs text-muted-foreground">Invoices go out on</p>
              <ol className="space-y-1">
                {dates.map((d, i) => (
                  <li key={d} className="flex justify-between gap-2 tabular-nums">
                    <span>{formatDay(d)}</span>
                    <span className="text-xs text-muted-foreground">{i === 0 && startsToday ? "now" : i === 0 ? "first" : ""}</span>
                  </li>
                ))}
                <li className="text-xs text-muted-foreground">…and {EVERY[frequency]} after, until you pause or cancel.</li>
              </ol>
            </div>
          )}
          {client?.email && (
            <label className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3 text-sm">
              <input type="checkbox" checked={emailIt} onChange={(e) => setEmailIt(e.target.checked)} className="mt-0.5 accent-emerald-700" />
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="size-3.5" /> Email each invoice
                </span>
                <span className="block truncate text-xs text-muted-foreground">{client.email}</span>
              </span>
            </label>
          )}
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <Button onClick={submit} disabled={busy} className="h-11 w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800">
            {busy ? "Creating…" : startsToday ? "Create and send the first invoice" : "Create plan"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Each invoice gets a number and a pay link, and is paid into your {wallet ? walletName(wallet.purpose).toLowerCase() : "wallet"}. You&apos;re notified every time one goes
            out.
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
