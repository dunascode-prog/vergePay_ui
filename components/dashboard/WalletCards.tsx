"use client";

import { useState } from "react";
import { Briefcase, Check, Copy, Plus, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { AccountScope, formatMinor, walletName, Wallets } from "@/lib/ledger";
import { Account, AccountPurpose } from "@/types/account";

const ICON: Record<AccountPurpose, typeof Wallet> = { personal: Wallet, business: Briefcase };
const BLURB: Record<AccountPurpose, string> = {
  personal: "Keep your own spending apart from business money.",
  business: "Receive client payments and track business costs separately.",
};

function CopyNumber({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. insecure context); the number is on screen anyway
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground tabular-nums hover:text-foreground"
      aria-label={copied ? "Account number copied" : `Copy account number ${number}`}
    >
      {number}
      {copied ? <Check className="size-3.5 text-emerald-700" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function WalletCard({ wallet }: { wallet: Account }) {
  const Icon = ICON[wallet.purpose];
  return (
    <Card className="flex flex-col">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="size-4" />
            </span>
            <p className="truncate text-sm font-semibold">{walletName(wallet.purpose)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {wallet.account_status === "frozen" && <Badge variant="secondary">Frozen</Badge>}
            <Badge variant="outline">{wallet.currency_code}</Badge>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatMinor(wallet.balance_minor, wallet.currency_code)}
          </p>
        </div>

        <CopyNumber number={wallet.account_number} />
      </CardContent>
    </Card>
  );
}

function AddWalletCard({ purpose }: { purpose: AccountPurpose }) {
  const Icon = ICON[purpose];
  return (
    <AddWalletDialog
      purpose={purpose}
      trigger={
        <button
          type="button"
          className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors hover:border-emerald-600 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Icon className="size-5" />
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Plus className="size-4" aria-hidden /> Add a {walletName(purpose).toLowerCase()}
          </span>
          <span className="max-w-60 text-xs text-muted-foreground">{BLURB[purpose]}</span>
        </button>
      }
    />
  );
}

/**
 * The wallets in view: Personal shows the personal wallet, Business the
 * business one, Combined both. A wallet the customer hasn't created yet is
 * an "Add" card in its place.
 */
export function WalletCards({ wallets, scope }: { wallets: Wallets; scope: AccountScope }) {
  const slots: AccountPurpose[] = scope === "combined" ? ["personal", "business"] : [scope];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {slots.map((purpose) =>
        wallets[purpose] ? (
          <WalletCard key={purpose} wallet={wallets[purpose]!} />
        ) : (
          <AddWalletCard key={purpose} purpose={purpose} />
        ),
      )}
    </div>
  );
}
