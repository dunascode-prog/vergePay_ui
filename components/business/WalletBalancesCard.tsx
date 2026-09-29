import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletBalance } from "@/types/business";
import { formatMoneyByCurrency } from "@/lib/format";
import { LuWallet, LuBriefcase } from "react-icons/lu";

interface WalletBalancesCardProps {
  wallets: WalletBalance[];
}

export function WalletBalancesCard({ wallets }: WalletBalancesCardProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Wallet balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.label}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {wallet.label === "Personal" ? (
                <LuWallet className="h-4 w-4 text-gray-400" />
              ) : (
                <LuBriefcase className="h-4 w-4 text-gray-400" />
              )}
              {wallet.label}
            </div>
            <p className="font-medium text-gray-900 text-sm">
              {formatMoneyByCurrency(
                Object.fromEntries(wallet.amounts.map((a) => [a.currency, a.amount]))
              )}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
