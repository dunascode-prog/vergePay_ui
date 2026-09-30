"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Check, ChevronRight, Copy, CreditCard, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TwoFactorStep, primaryButton } from "@/components/security/TwoFactorStep";
import { useAppData } from "@/components/app-data";
import { MoneyInput } from "./MoneyInput";
import { VerifyIdentityStep } from "./VerifyIdentityStep";
import { ErrorNote, StepHeader, Summary, SummaryRow, SuccessView } from "./parts";
import {
  chargeCard,
  createVirtualAccount,
  getVirtualAccount,
  listCards,
  startCardLink,
  syncPayment,
} from "@/services/money";
import { ApiError } from "@/lib/api";
import { formatMinor, walletName } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { Account } from "@/types/account";
import { Card, VirtualAccount } from "@/types/money";

type Step = "kyc" | "method" | "bank" | "card" | "card-2fa" | "done";

// Card and bank-transfer funding are naira only for now (Flutterwave setup).
const FUNDABLE = "NGN";

const back = (onClick: () => void) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeft className="size-4" /> Back
  </button>
);

function Method({ icon: Icon, title, body, onClick }: { icon: typeof Building2; title: string; body: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <Icon className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{body}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard blocked; it's on screen
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex items-center gap-1.5 font-semibold tabular-nums"
    >
      {value}
      {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4 text-muted-foreground" />}
    </button>
  );
}

/** Bank transfer: the wallet's permanent account number (created once, with the BVN). */
function BankTransfer({ wallet }: { wallet: Account }) {
  const { user } = useAppData();
  const [state, setState] = useState<"loading" | "none" | "ready">("loading");
  const [details, setDetails] = useState<VirtualAccount | null>(null);
  const [bvn, setBvn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getVirtualAccount(wallet.account_id)
      .then((va) => {
        setDetails(va);
        setState("ready");
      })
      .catch(() => setState("none"));
  }, [wallet.account_id]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{11}$/.test(bvn)) return setError("Your BVN is 11 digits.");
    setBusy(true);
    setError(null);
    try {
      setDetails(await createVirtualAccount(wallet.account_id, bvn));
      setState("ready");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account number. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return <Skeleton className="h-40 w-full rounded-xl" />;

  if (state === "none") {
    return (
      <form onSubmit={create} className="space-y-5" noValidate>
        <StepHeader
          title="Get your account number"
          subtitle="A permanent bank account number for this wallet. Anyone can send money to it from any Nigerian bank."
        />
        <div className="space-y-2">
          <Label htmlFor="va-bvn">Confirm your BVN</Label>
          <Input id="va-bvn" inputMode="numeric" autoComplete="off" placeholder="11 digits" className="h-11 rounded-lg tracking-widest tabular-nums" value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))} />
          <p className="text-xs text-muted-foreground">Banks need it to issue the account number in your name.</p>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "Creating…" : "Get account number"}
        </Button>
      </form>
    );
  }

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  return (
    <div className="space-y-5">
      <StepHeader title="Transfer to this account" subtitle="From any Nigerian bank app. The money lands in this wallet within minutes." />
      <Summary>
        <SummaryRow label="Bank" value={details!.bank_name} />
        <SummaryRow label="Account number" value={<CopyValue value={details!.account_number} label="account number" />} />
        {name && <SummaryRow label="Account name" value={name} />}
      </Summary>
      <p className="text-xs text-muted-foreground">This number is yours to keep. Share it with clients to get paid straight into your wallet.</p>
    </div>
  );
}

export function AddMoneyDialog({ wallet, trigger }: { wallet: Account; trigger: React.ReactElement }) {
  const { user, reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("method");
  const [cards, setCards] = useState<Card[] | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [key, setKey] = useState("");
  const money = (minor: number) => formatMinor(minor, wallet.currency_code);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep(user?.kyc_status === "verified" ? "method" : "kyc");
      setCards(null);
      setAmount(null);
      setError(null);
      setAdded(null);
      setProcessing(false);
      setKey(crypto.randomUUID());
    }
  };

  const openCards = async () => {
    setStep("card");
    setError(null);
    try {
      const active = (await listCards(wallet.account_id)).filter((c) => c.card_status === "active");
      setCards(active);
      setCardId(active[0]?.card_id ?? null);
    } catch (err) {
      setCards([]);
      setError(err instanceof ApiError ? err.message : "Couldn't load your cards.");
    }
  };

  // Linking a card is a hosted Flutterwave checkout (₦100 lands in the wallet).
  const linkCard = async () => {
    const started = await startCardLink(wallet.account_id, key);
    if (!started.checkout_url) throw new ApiError(502, { message: "The card checkout couldn't be opened. Please try again." });
    window.location.assign(started.checkout_url);
  };

  const beginLink = async () => {
    setBusy(true);
    setError(null);
    try {
      await linkCard();
    } catch (err) {
      if (err instanceof ApiError && err.code === "TWO_FACTOR_REQUIRED") setStep("card-2fa");
      else setError(err instanceof ApiError ? err.message : "Couldn't start linking the card.");
      setBusy(false);
    }
  };

  const topUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cardId) return;
    if (!amount) return setError("Enter an amount.");
    setBusy(true);
    setError(null);
    try {
      const charge = await chargeCard(cardId, amount, key);
      if (charge.authorization_url) {
        // 3-D Secure: the bank's own page, then back to /dashboard/payments/complete
        window.location.assign(charge.authorization_url);
        return;
      }
      if (charge.status === "failed") throw new ApiError(402, { message: charge.failure_reason ?? "The card was declined." });
      if (charge.status === "pending") {
        setProcessing(true);
        // ask the processor a few times before leaving it to settle later
        for (let i = 0; i < 4; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const state = await syncPayment(charge.transaction_id);
          if (state.status === "settled") break;
          if (state.status === "failed") throw new ApiError(402, { message: state.failure_reason ?? "The card was declined." });
        }
      }
      setAdded(amount);
      setStep("done");
      void reloadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The top-up didn't go through. You weren't charged.");
      setKey(crypto.randomUUID()); // a new attempt, not a replay of the failed one
    } finally {
      setBusy(false);
      setProcessing(false);
    }
  };

  const fundable = wallet.currency_code === FUNDABLE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {step === "kyc" && <VerifyIdentityStep onVerified={() => setStep("method")} />}

        {step === "method" && (
          <div className="space-y-5">
            <StepHeader title="Add money" subtitle={`To your ${walletName(wallet.purpose).toLowerCase()} · ${money(wallet.balance_minor)} now`} />
            {fundable ? (
              <div className="space-y-3">
                <Method icon={Building2} title="Bank transfer" body="Your own account number. Free, from any bank." onClick={() => setStep("bank")} />
                <Method icon={CreditCard} title="Debit card" body="Top up instantly with a saved card." onClick={openCards} />
              </div>
            ) : (
              <ErrorNote>
                Adding money to a {wallet.currency_code} wallet isn&apos;t available yet. Card and bank transfers work
                with naira wallets for now.
              </ErrorNote>
            )}
          </div>
        )}

        {step === "bank" && (
          <div className="space-y-4">
            {back(() => setStep("method"))}
            <BankTransfer wallet={wallet} />
          </div>
        )}

        {step === "card" && (
          <div className="space-y-4">
            {back(() => setStep("method"))}
            {cards === null ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : cards.length === 0 ? (
              <div className="space-y-5">
                <StepHeader
                  title="Link a debit card"
                  subtitle="You'll enter your card on Flutterwave's secure page. We charge ₦100 to check it, and that ₦100 goes straight into your wallet."
                />
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• VergePay never sees your full card number.</li>
                  <li>• After this, top-ups take one tap.</li>
                </ul>
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button onClick={beginLink} disabled={busy} className={primaryButton}>
                  {busy ? "Opening checkout…" : "Link a card"}
                </Button>
              </div>
            ) : processing ? (
              <div className="space-y-3 py-6 text-center" role="status">
                <Loader2 className="mx-auto size-8 animate-spin text-emerald-700" aria-hidden />
                <DialogTitle className="text-sm font-normal text-muted-foreground">Confirming with your bank…</DialogTitle>
              </div>
            ) : (
              <form onSubmit={topUp} className="space-y-5" noValidate>
                <StepHeader title="Top up with a card" />
                <fieldset className="space-y-2">
                  <legend className="sr-only">Card</legend>
                  {cards.map((card) => (
                    <label
                      key={card.card_id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3",
                        "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/60 dark:has-[:checked]:bg-emerald-950/40",
                      )}
                    >
                      <input type="radio" name="card" className="sr-only" checked={cardId === card.card_id} onChange={() => setCardId(card.card_id)} />
                      <CreditCard className="size-5 text-muted-foreground" aria-hidden />
                      <span className="flex-1 text-sm">
                        <span className="font-medium">{card.issuer ?? "Card"} •••• {card.pan_last_four}</span>
                        <span className="block text-xs text-muted-foreground">
                          Expires {String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).slice(-2)}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <MoneyInput id="card-amount" currency={wallet.currency_code} onChange={setAmount} invalid={Boolean(error)} autoFocus />
                {error && <ErrorNote>{error}</ErrorNote>}
                <Button type="submit" disabled={busy} className={primaryButton}>
                  {busy ? "Adding…" : amount ? `Add ${money(amount)}` : "Add money"}
                </Button>
              </form>
            )}
          </div>
        )}

        {step === "card-2fa" && <TwoFactorStep action="add a card" onConfirmed={linkCard} />}

        {step === "done" && added && (
          <SuccessView title={`Added to your ${walletName(wallet.purpose).toLowerCase()}`} amount={money(added)} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
