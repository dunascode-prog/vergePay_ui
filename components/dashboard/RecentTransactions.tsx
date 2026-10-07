"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { accountName, formatMinor, TRANSACTION_LABEL } from "@/lib/ledger";
import { Account, ScopedTransaction } from "@/types/account";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** The other side of a line: one of your accounts, an account number, or VergePay itself. */
function otherSide(line: ScopedTransaction, byId: Map<string, Account>): string | null {
  const own = line.counterparty_account_id ? byId.get(line.counterparty_account_id) : undefined;
  if (own) return accountName(own);
  // top-ups come from the funding and card/bank-transfer accounts; anything
  // else on VergePay's side (withdrawals, fees, their refunds) is VergePay
  const sys = line.counterparty_account_number;
  if (sys?.startsWith("SYS-FUND-") || sys?.startsWith("SYS-FLW-")) return line.direction === "credit" ? "Funding" : "VergePay";
  if (sys?.startsWith("SYS-")) return "VergePay";
  return line.counterparty_account_number;
}

/**
 * Where the money went, as "from → to". With one account in view that
 * account is implied, so it reads "From 0123456789" / "To 0123456789".
 */
function route(line: ScopedTransaction, byId: Map<string, Account>, showAccount: boolean): string {
  const other = otherSide(line, byId);
  const mine = byId.get(line.account_id);
  const credit = line.direction === "credit";
  if (!showAccount || !mine) return other ? `${credit ? "From" : "To"} ${other}` : "";
  const here = accountName(mine);
  if (!other) return here;
  return credit ? `${other} → ${here}` : `${here} → ${other}`;
}

export function RecentTransactions({
  lines,
  accounts,
  showAccount,
}: {
  lines: ScopedTransaction[];
  accounts: Account[];
  /** Show which of your accounts each line is on (when more than one is in view). */
  showAccount: boolean;
}) {
  const byId = new Map(accounts.map((a) => [a.account_id, a]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <CardDescription>The latest movements on these accounts</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {lines.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground sm:px-0">
            No transactions yet. Money you receive or send will appear here.
          </p>
        ) : (
          <ul className="divide-y">
            {lines.map((line) => {
              const credit = line.direction === "credit";
              const Icon = credit ? ArrowDownLeft : ArrowUpRight;
              const detail = route(line, byId, showAccount);
              return (
                <li key={`${line.transaction_id}-${line.account_id}`} className="flex items-center gap-3 px-6 py-3 sm:px-0">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      credit
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {line.description || TRANSACTION_LABEL[line.transaction_type] || "Transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground sm:truncate">
                      {dateFormat.format(new Date(line.created_at))}
                      {detail ? ` · ${detail}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        credit ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
                      )}
                    >
                      <span className="sr-only">{credit ? "Money in" : "Money out"} </span>
                      {credit ? "+" : "−"}
                      {formatMinor(line.amount_minor, line.currency_code)}
                    </p>
                    {line.status !== "settled" && (
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {line.status}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
