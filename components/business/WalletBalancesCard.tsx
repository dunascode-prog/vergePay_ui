import { Briefcase, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinor, walletName } from "@/lib/ledger";
import { Account } from "@/types/account";

/** Cash on hand: the balance of each wallet in view. */
export function WalletBalancesCard({ wallets }: { wallets: Account[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Cash</CardTitle>
        <CardDescription>What&apos;s in your wallets now</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {wallets.map((w) => {
          const Icon = w.purpose === "business" ? Briefcase : Wallet;
          return (
            <div key={w.account_id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{walletName(w.purpose)}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{w.account_number}</p>
                </div>
              </div>
              <p className="text-sm font-semibold whitespace-nowrap tabular-nums">{formatMinor(w.balance_minor, w.currency_code)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
