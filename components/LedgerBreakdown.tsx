import { Invoice } from "@/types/invoice";
import { formatMoney, formatShortDate } from "@/lib/format";
import { LuArrowDownToLine, LuArrowUpFromLine } from "react-icons/lu";

interface LedgerBreakdownProps {
  invoice: Invoice;
}

export function LedgerBreakdown({ invoice }: LedgerBreakdownProps) {
  if (invoice.status === "draft") {
    return (
      <div className="px-4 py-4 text-sm text-gray-400 bg-gray-50/60">
        Not yet posted to the ledger — drafts don't create entries until sent.
      </div>
    );
  }

  const balance = invoice.amount - invoice.amountPaid;

  return (
    <div className="bg-gray-50/60 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
        Ledger postings
      </p>
      <div className="space-y-2">
        {invoice.ledger.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-md bg-white border border-gray-100 px-3 py-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {entry.type === "debit" ? (
                <LuArrowDownToLine className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              ) : (
                <LuArrowUpFromLine className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{entry.account}</p>
                <p className="text-xs text-gray-400">
                  {formatShortDate(entry.date)} · {entry.memo}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 pl-3">
              <p className="text-xs uppercase text-gray-400">{entry.type}</p>
              <p className="text-sm font-medium text-gray-900">
                {formatMoney(entry.amount, invoice.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {balance > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">Remaining balance on Accounts Receivable</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatMoney(balance, invoice.currency)}
          </p>
        </div>
      )}
    </div>
  );
}
