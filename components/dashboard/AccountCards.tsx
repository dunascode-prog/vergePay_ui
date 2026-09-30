"use client";

import { useState } from "react";
import { Building2, Check, Copy, Plus, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpenAccountDialog } from "@/components/accounts/OpenAccountDialog";
import { accountName, formatMinor } from "@/lib/ledger";
import { Account, AccountPurpose } from "@/types/account";

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

function AccountCard({ account }: { account: Account }) {
  const Icon = account.purpose === "business" ? Building2 : Wallet;
  return (
    <Card className="flex flex-col">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="size-4" />
            </span>
            <p className="truncate text-sm font-semibold">{accountName(account)}</p>
          </div>
          {account.account_status === "frozen" && <Badge variant="secondary">Frozen</Badge>}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatMinor(account.balance_minor, account.currency_code)}
          </p>
        </div>

        <CopyNumber number={account.account_number} />
      </CardContent>
    </Card>
  );
}

/** One card per account in scope, plus a card to open another. */
export function AccountCards({
  accounts,
  defaultPurpose,
}: {
  accounts: Account[];
  defaultPurpose: AccountPurpose;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard key={account.account_id} account={account} />
      ))}
      <OpenAccountDialog
        defaultPurpose={defaultPurpose}
        trigger={
          <button
            type="button"
            className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Plus className="size-5" />
            Open an account
          </button>
        }
      />
    </div>
  );
}
