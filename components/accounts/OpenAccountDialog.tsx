"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SegmentedToggle } from "@/components/SegmentedToggle";
import { useAppData } from "@/components/app-data";
import { openAccount } from "@/services/accounts";
import { ApiError } from "@/lib/api";
import { AccountPurpose, OpenAccountRequest } from "@/types/account";

type OpenableType = OpenAccountRequest["account_type"];

const TYPES: { value: OpenableType; label: string; hint: string }[] = [
  { value: "current", label: "Current", hint: "For everyday money in and out." },
  { value: "savings", label: "Savings", hint: "For money you're putting aside." },
  { value: "investment_wallet", label: "Investment wallet", hint: "Holds your synced brokerage holdings." },
];

const CURRENCIES = [
  { value: "NGN", label: "Naira (NGN)" },
  { value: "USD", label: "US dollar (USD)" },
];

/**
 * Opens a new account. `trigger` is the element that opens the dialog (Base
 * UI's render prop); `defaultPurpose` pre-selects Personal or Business.
 */
export function OpenAccountDialog({
  trigger,
  defaultPurpose = "personal",
  onOpened,
}: {
  trigger: React.ReactElement;
  defaultPurpose?: AccountPurpose;
  onOpened?: () => void;
}) {
  const { reloadAccounts } = useAppData();
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState<AccountPurpose>(defaultPurpose);
  const [type, setType] = useState<OpenableType>("current");
  const [currency, setCurrency] = useState("NGN");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // One key per opening of the dialog: a retry after a network error reuses
  // it, so the API can't open the same account twice.
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setPurpose(defaultPurpose);
      setType("current");
      setCurrency("NGN");
      setError(null);
      setIdempotencyKey(crypto.randomUUID());
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await openAccount({ account_type: type, currency_code: currency, purpose }, idempotencyKey);
      await reloadAccounts();
      setOpen(false);
      onOpened?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't open the account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Open an account</DialogTitle>
            <DialogDescription>
              It gets its own 10-digit account number and starts at zero.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Who is it for?</Label>
            <SegmentedToggle
              options={[
                { value: "personal", label: "Personal" },
                { value: "business", label: "Business" },
              ]}
              value={purpose}
              onChange={setPurpose}
              aria-label="Account purpose"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Account type</legend>
            <div className="grid gap-2">
              {TYPES.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/60 dark:has-[:checked]:bg-emerald-950/40"
                >
                  <input
                    type="radio"
                    name="account_type"
                    value={option.value}
                    checked={type === option.value}
                    onChange={() => setType(option.value)}
                    className="mt-0.5 accent-emerald-700"
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="open-account-currency">Currency</Label>
            <select
              id="open-account-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {submitting ? "Opening…" : "Open account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
