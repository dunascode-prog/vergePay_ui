"use client";

import { useState } from "react";
import { Briefcase, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { useAppData } from "@/components/app-data";
import { openAccount } from "@/services/accounts";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Account, AccountPurpose } from "@/types/account";

const PURPOSES: { value: AccountPurpose; title: string; body: string; Icon: typeof Wallet }[] = [
  { value: "personal", title: "Personal wallet", body: "For your own spending, saving and goals.", Icon: Wallet },
  { value: "business", title: "Business wallet", body: "For client payments, invoices and business expenses.", Icon: Briefcase },
];

const CURRENCIES = [
  { value: "NGN", label: "Naira · NGN" },
  { value: "USD", label: "US dollar · USD" },
];

/**
 * Creates one of the customer's two wallets. `purpose` fixes which one (when
 * adding the second); otherwise the customer picks. Each attempt keeps one
 * Idempotency-Key, so a retry after a network error can't open two.
 */
export function CreateWalletForm({
  purpose: fixedPurpose,
  taken = [],
  submitLabel = "Create wallet",
  onCreated,
}: {
  purpose?: AccountPurpose;
  /** Purposes the customer already has a wallet for. */
  taken?: AccountPurpose[];
  submitLabel?: string;
  onCreated?: (account: Account) => void;
}) {
  const { reloadAccounts } = useAppData();
  const firstFree = PURPOSES.find((p) => !taken.includes(p.value))?.value ?? "personal";
  const [purpose, setPurpose] = useState<AccountPurpose>(fixedPurpose ?? firstFree);
  const [currency, setCurrency] = useState("NGN");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const account = await openAccount({ account_type: "current", currency_code: currency, purpose }, idempotencyKey);
      await reloadAccounts();
      onCreated?.(account);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the wallet. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {!fixedPurpose && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">What&apos;s this wallet for?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {PURPOSES.map(({ value, title, body, Icon }) => {
              const disabled = taken.includes(value);
              return (
                <label
                  key={value}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors",
                    "has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/60 dark:has-[:checked]:bg-emerald-950/40",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600/40",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={value}
                    checked={purpose === value}
                    disabled={disabled}
                    onChange={() => setPurpose(value)}
                    className="sr-only"
                  />
                  <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {disabled ? "You already have one." : body}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium" id="wallet-currency-label">
          Currency
        </p>
        <SegmentedToggle
          options={CURRENCIES}
          value={currency}
          onChange={setCurrency}
          aria-label="Wallet currency"
        />
        <p className="text-xs text-muted-foreground">
          The currency can&apos;t be changed later.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800"
      >
        {submitting ? "Creating…" : submitLabel}
      </Button>
    </form>
  );
}
