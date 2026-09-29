"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PayeeAvatar } from "./PayeeAvatar";
import { Payee, PayrollPayment } from "@/types/payroll";
import { formatMoney, formatShortDate } from "@/lib/format";
import {
  LuChevronDown,
  LuChevronRight,
  LuBanknote,
  LuArrowUpRight,
  LuLandmark,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

interface PayeeCardProps {
  payee: Payee;
  payments: PayrollPayment[];
  onRunPayroll: (payeeId: string) => Promise<void>;
}

export function PayeeCard({ payee, payments, onRunPayroll }: PayeeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);

  const history = payments
    .filter((p) => p.payeeId === payee.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  async function handleRunPayroll() {
    setRunning(true);
    await onRunPayroll(payee.id);
    setRunning(false);
    setExpanded(true);
  }

  return (
    <Card className="border-gray-200 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <PayeeAvatar name={payee.name} initials={payee.initials} size="md" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{payee.name}</p>
              <p className="text-xs text-gray-400 truncate">{payee.role}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs shrink-0",
              payee.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}
          >
            {payee.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {payee.payType}
          </Badge>
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
            {payee.frequency}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm mb-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-gray-400 text-xs">
              {payee.payType === "Retainer" ? "Rate" : "Typical rate"}
            </p>
            <p className="font-medium text-gray-900">{formatMoney(payee.rate, payee.currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Last paid</p>
            <p className="font-medium text-gray-900">
              {payee.lastPaidDate ? formatShortDate(payee.lastPaidDate) : "Not yet paid"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Button
            size="sm"
            className="flex-1 bg-emerald-700 hover:bg-emerald-800"
            disabled={running || payee.status !== "active"}
            onClick={handleRunPayroll}
          >
            <LuBanknote className="h-3.5 w-3.5 mr-1.5" />
            {running ? "Processing…" : "Run payroll"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Hide history" : "Show history"}
          >
            {expanded ? <LuChevronDown className="h-4 w-4" /> : <LuChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
              <LuLandmark className="h-3 w-3" />
              {payee.bankName} {payee.accountNumberMasked}
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">No payments recorded yet.</p>
            ) : (
              history.map((payment) => (
                <div key={payment.id} className="rounded-md bg-gray-50 px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{formatShortDate(payment.date)}</span>
                    <span className="font-medium text-gray-900">
                      {formatMoney(payment.netAmount, payment.currency)} net
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>
                      Gross {formatMoney(payment.grossAmount, payment.currency)} · PAYE{" "}
                      {formatMoney(payment.payeDeduction, payment.currency)} · Pension{" "}
                      {formatMoney(payment.pensionDeduction, payment.currency)}
                    </span>
                  </div>
                  {payment.linkedExpenseId && (
                    <Link
                      href="/dashboard/expenses"
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1.5"
                    >
                      View in Expenses
                      <LuArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
            <p className="text-xs text-gray-400 pt-1">
              PAYE and pension figures are simplified estimates for illustration, not exact tax
              calculations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
