"use client";

import { Check, Clock, Loader2, Lock, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDay, money } from "@/lib/invoicing";
import { walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { currentUserOrNull, getPayLink, listMyAccountsPublic, payLinkFromWallet, startPayLinkCheckout, syncPayLink } from "@/services/invoices";
import { Account } from "@/types/account";
import { PayLink, PayLinkSync } from "@/types/invoicing";

const SYNC_ATTEMPTS = 8;
const SYNC_DELAY_MS = 1500;

type ReturnState = { kind: "checking" } | { kind: "result"; sync: PayLinkSync } | { kind: "unknown" };

/**
 * /pay/[token]: the page a client opens from an invoice email or a shared
 * link. No VergePay account needed. Coming back from Flutterwave's checkout
 * (?transaction_id=…), it asks the API how the payment went rather than
 * trusting the redirect.
 */
export function PayPage({ token, returnedTransactionId }: { token: string; returnedTransactionId?: string }) {
  const [link, setLink] = useState<PayLink | null>(null);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [returned, setReturned] = useState<ReturnState | null>(returnedTransactionId ? { kind: "checking" } : null);

  const load = useCallback(
    () =>
      getPayLink(token)
        .then(setLink)
        .catch((err) => (err instanceof ApiError && err.status === 404 ? setMissing(true) : setLoadError("We couldn't load this invoice. Please refresh."))),
    [token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // back from checkout: confirm with the API (which asks Flutterwave)
  useEffect(() => {
    if (!returnedTransactionId) return;
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < SYNC_ATTEMPTS && !cancelled; attempt++) {
        try {
          const sync = await syncPayLink(token, returnedTransactionId);
          if (sync.status !== "pending" || attempt === SYNC_ATTEMPTS - 1) {
            if (!cancelled) setReturned({ kind: "result", sync });
            void load();
            return;
          }
        } catch {
          if (!cancelled) setReturned({ kind: "unknown" });
          return;
        }
        await new Promise((r) => setTimeout(r, SYNC_DELAY_MS));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, returnedTransactionId, load]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-muted/40 px-4 py-8 sm:py-14">
      <div className="w-full max-w-md">
        {missing ? (
          <Card>
            <Notice icon={<X className="size-6" />} tone="muted" title="This payment link isn't valid" body="Check the link you were sent, or ask the sender for a new one." />
          </Card>
        ) : loadError ? (
          <Card>
            <ErrorNote>{loadError}</ErrorNote>
          </Card>
        ) : !link ? (
          <Card>
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </Card>
        ) : (
          <InvoiceCard link={link} token={token} returned={returned} onRetry={() => setReturned(null)} />
        )}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" /> Payments secured by Flutterwave · Powered by <span className="font-medium text-foreground">VergePay</span>
        </p>
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">{children}</div>;
}

function Notice({ icon, tone, title, body }: { icon: React.ReactNode; tone: "good" | "muted" | "warn"; title: string; body?: React.ReactNode }) {
  return (
    <div className="space-y-2 py-2 text-center">
      <span
        className={cn(
          "mx-auto flex size-12 items-center justify-center rounded-full",
          tone === "good" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          tone === "muted" && "bg-muted text-muted-foreground",
          tone === "warn" && "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        )}
      >
        {icon}
      </span>
      <p className="text-base font-semibold">{title}</p>
      {body && <p className="text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}

function InvoiceCard({ link, token, returned, onRetry }: { link: PayLink; token: string; returned: ReturnState | null; onRetry: () => void }) {
  const total = money(link.amount_due_minor, link.currency_code);
  const payable = link.invoice_status === "open" || link.invoice_status === "overdue";

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
          {link.issuer_name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{link.issuer_name}</p>
          <p className="text-xs text-muted-foreground">
            Invoice {link.invoice_number}
            {link.billed_to ? ` · for ${link.billed_to}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">{link.invoice_status === "paid" ? "Amount paid" : "Amount due"}</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{total}</p>
        {payable && (
          <p className={cn("mt-1 text-sm", link.invoice_status === "overdue" ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground")}>
            {link.invoice_status === "overdue" ? `Was due ${formatDay(link.due_date)}` : `Due ${formatDay(link.due_date)}`}
          </p>
        )}
      </div>

      <details className="group mt-5 rounded-xl border" open={link.items.length <= 3}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
          {link.items.length} {link.items.length === 1 ? "item" : "items"}
          <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
        </summary>
        <ul className="divide-y border-t">
          {link.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block">{item.description}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {item.quantity} × {money(item.unit_amount_minor, link.currency_code)}
                </span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">{money(item.amount_minor, link.currency_code)}</span>
            </li>
          ))}
        </ul>
      </details>
      {link.notes && <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{link.notes}</p>}

      <div className="mt-6">
        {returned?.kind === "checking" ? (
          <Notice icon={<Loader2 className="size-6 animate-spin" />} tone="muted" title="Confirming your payment…" body="This takes a few seconds." />
        ) : returned?.kind === "result" && returned.sync.status === "settled" ? (
          <Notice
            icon={<Check className="size-6" />}
            tone="good"
            title="Payment received"
            body={
              returned.sync.settled_invoice
                ? `Thank you. ${link.issuer_name} has been paid, and a receipt is on its way to your email.`
                : `We received your payment, but this invoice had already been paid. ${link.issuer_name} has been told to return it to you.`
            }
          />
        ) : returned?.kind === "result" && returned.sync.status === "failed" && payable ? (
          <div className="space-y-3">
            <ErrorNote>Your payment didn&apos;t go through, and you weren&apos;t charged. You can try again.</ErrorNote>
            <Button variant="outline" onClick={onRetry} className="h-11 w-full rounded-lg">
              Try again
            </Button>
          </div>
        ) : returned?.kind === "result" && returned.sync.status === "pending" ? (
          <Notice icon={<Clock className="size-6" />} tone="warn" title="Still confirming" body="Your bank hasn't confirmed the payment yet. You'll get a receipt by email once it does." />
        ) : link.invoice_status === "paid" ? (
          <Notice icon={<Check className="size-6" />} tone="good" title={`Paid${link.paid_at ? ` on ${formatDay(link.paid_at)}` : ""}`} body="Nothing more to pay. Thank you." />
        ) : link.invoice_status === "cancelled" ? (
          <Notice icon={<X className="size-6" />} tone="muted" title="This invoice was cancelled" body={`There's nothing to pay. Contact ${link.issuer_name} if this is unexpected.`} />
        ) : link.invoice_status === "refunded" ? (
          <Notice icon={<Check className="size-6" />} tone="muted" title="This invoice was refunded" />
        ) : (
          <PayOptions link={link} token={token} total={total} />
        )}
      </div>
    </Card>
  );
}

function PayOptions({ link, token, total }: { link: PayLink; token: string; total: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const checkout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setEmailError(null);
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setEmailError("Enter a valid email address.");
    setBusy(true);
    try {
      const { checkout_url } = await startPayLinkCheckout(token, email.trim() ? { email: email.trim() } : {});
      window.location.assign(checkout_url);
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      if (fields.email) setEmailError(fields.email);
      else setError(err instanceof ApiError ? err.message : "We couldn't start the payment. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {link.payment_methods.checkout ? (
        <form onSubmit={checkout} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="payer-email">Email for your receipt</Label>
            <Input
              id="payer-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              aria-invalid={!!emailError}
              className="h-11"
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-800">
            {busy ? "Opening secure checkout…" : `Pay ${total}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Card, bank transfer or USSD</p>
        </form>
      ) : (
        <ErrorNote>Card and bank-transfer payments aren&apos;t available right now.</ErrorNote>
      )}
      {link.payment_methods.wallet && <WalletOption link={link} token={token} total={total} />}
    </div>
  );
}

/** For VergePay customers: pay from a wallet, no card needed. */
function WalletOption({ link, token, total }: { link: PayLink; token: string; total: string }) {
  const [state, setState] = useState<"checking" | "signed-out" | "ready" | "paid">("checking");
  const [wallets, setWallets] = useState<Account[]>([]);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key] = useState(() => crypto.randomUUID());

  useEffect(() => {
    currentUserOrNull().then(async (user) => {
      if (!user) return setState("signed-out");
      try {
        const { personal, business } = walletsOf(await listMyAccountsPublic());
        const usable = [personal, business].filter((w): w is Account => !!w && w.currency_code === link.currency_code && w.account_status === "active");
        setWallets(usable);
        setSource(usable[0]?.account_id ?? "");
        setState("ready");
      } catch {
        setState("signed-out");
      }
    });
  }, [link.currency_code]);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      await payLinkFromWallet(token, source, key);
      setState("paid");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The payment didn't go through. Please try again.");
      setBusy(false);
    }
  };

  if (state === "checking") return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      {state === "signed-out" ? (
        <p className="text-center text-sm text-muted-foreground">
          Have VergePay?{" "}
          <Link href={`/signin?next=${encodeURIComponent(`/pay/${token}`)}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Sign in to pay from your wallet
          </Link>
        </p>
      ) : state === "paid" ? (
        <Notice icon={<Check className="size-6" />} tone="good" title="Paid from your wallet" />
      ) : wallets.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">You don&apos;t have a {link.currency_code} wallet to pay from.</p>
      ) : (
        <div className="space-y-2">
          {wallets.length > 1 &&
            wallets.map((w) => (
              <label key={w.account_id} className={cn("flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm", source === w.account_id && "border-emerald-700")}>
                <span>
                  <span className="block font-medium">{walletName(w.purpose)}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">Balance {money(w.balance_minor, w.currency_code)}</span>
                </span>
                <input type="radio" name="wallet" checked={source === w.account_id} onChange={() => setSource(w.account_id)} className="accent-emerald-700" />
              </label>
            ))}
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button variant="outline" onClick={pay} disabled={busy || !source} className="h-11 w-full rounded-xl">
            {busy ? "Paying…" : `Pay ${total} from your VergePay wallet`}
          </Button>
        </div>
      )}
    </div>
  );
}
