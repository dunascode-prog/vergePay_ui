"use client";

import { useState } from "react";
import { ArrowLeftRight, Briefcase, Check, Copy, Landmark, Plus, Send, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { Button } from "@/components/ui/button";
import { AddMoneyDialog } from "@/components/money/AddMoneyDialog";
import { SendMoneyDialog } from "@/components/money/SendMoneyDialog";
import { TransferDialog } from "@/components/money/TransferDialog";
import { WithdrawDialog } from "@/components/money/WithdrawDialog";
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

function WalletCard({ wallet, other }: { wallet: Account; other: Account | null }) {
  const Icon = ICON[wallet.purpose];
  // withdrawals to Nigerian bank accounts are in naira only
  const canWithdraw = wallet.currency_code === "NGN";
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

        <div className={(other ? 1 : 0) + (canWithdraw ? 1 : 0) === 1 ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
          <AddMoneyDialog
            wallet={wallet}
            trigger={
              <Button className="h-10 gap-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800" aria-label={`Add money to your ${walletName(wallet.purpose).toLowerCase()}`}>
                <Plus className="size-4" aria-hidden /> Add
              </Button>
            }
          />
          <SendMoneyDialog
            wallet={wallet}
            trigger={
              <Button variant="outline" className="h-10 gap-1.5 rounded-lg" aria-label={`Send money from your ${walletName(wallet.purpose).toLowerCase()}`}>
                <Send className="size-4" aria-hidden /> Send
              </Button>
            }
          />
          {canWithdraw && (
            <WithdrawDialog
              wallet={wallet}
              trigger={
                <Button variant="outline" className="h-10 gap-1.5 rounded-lg" aria-label={`Withdraw from your ${walletName(wallet.purpose).toLowerCase()} to a bank account`}>
                  <Landmark className="size-4" aria-hidden /> Withdraw
                </Button>
              }
            />
          )}
          {other && (
            <TransferDialog
              from={wallet}
              to={other}
              trigger={
                <Button variant="outline" className="h-10 gap-1.5 rounded-lg" aria-label={`Transfer from your ${walletName(wallet.purpose).toLowerCase()} to your ${walletName(other.purpose).toLowerCase()}`}>
                  <ArrowLeftRight className="size-4" aria-hidden /> Transfer
                </Button>
              }
            />
          )}
        </div>
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
          <WalletCard
            key={purpose}
            wallet={wallets[purpose]!}
            other={wallets[purpose === "personal" ? "business" : "personal"]}
          />
        ) : (
          <AddWalletCard key={purpose} purpose={purpose} />
        ),
      )}
    </div>
  );
}
