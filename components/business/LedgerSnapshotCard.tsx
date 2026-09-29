import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerSnapshot } from "@/types/business";
import { formatMoneyByCurrency } from "@/lib/format";
import { LuArrowDownToLine, LuArrowUpFromLine } from "react-icons/lu";

interface LedgerSnapshotCardProps {
  ledger: LedgerSnapshot;
}

export function LedgerSnapshotCard({ ledger }: LedgerSnapshotCardProps) {
  const rows = [
    { label: "Cash", type: "debit" as const, value: ledger.cash },
    { label: "Accounts Receivable", type: "debit" as const, value: ledger.accountsReceivable },
    { label: "Revenue (YTD)", type: "credit" as const, value: ledger.revenueYtd },
    { label: "Expenses (YTD)", type: "debit" as const, value: ledger.expensesYtd },
  ];

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Ledger snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              {row.type === "debit" ? (
                <LuArrowDownToLine className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <LuArrowUpFromLine className="h-3.5 w-3.5 text-gray-400" />
              )}
              {row.label}
            </span>
            <span className="font-medium text-gray-900">{formatMoneyByCurrency(
              Object.fromEntries(row.value.map((v) => [v.currency, v.amount]))
            )}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Balances reflect the double-entry ledger behind your invoices — not a separate estimate.
        </p>
      </CardContent>
    </Card>
  );
}
