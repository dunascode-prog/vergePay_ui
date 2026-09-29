"use client";

import { useState } from "react";
import Link from "next/link";
import { Invoice } from "@/types/invoice";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { HealthDot } from "./HealthDot";
import { ProbabilityBadge } from "./ProbabilityBadge";
import { LedgerBreakdown } from "./LedgerBreakdown";
import { formatMoney, formatShortDate, daysOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  LuChevronDown,
  LuChevronRight,
  LuRepeat,
  LuSend,
  LuPencil,
  LuFileText,
  LuReceiptText,
  LuEllipsisVertical,
} from "react-icons/lu";

interface InvoiceRowProps {
  invoice: Invoice;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onSend: (id: string) => void;
  actionInFlight: string | null;
}

export function InvoiceRow({
  invoice,
  selected,
  onToggleSelect,
  onSend,
  actionInFlight,
}: InvoiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const overdueDays = daysOverdue(invoice.dueDate);
  const isBusy = actionInFlight === invoice.id;
  const pctPaid =
    invoice.amount > 0
      ? Math.round((invoice.amountPaid / invoice.amount) * 100)
      : 0;

  return (
    <>
      <TableRow className={cn("group", expanded && "bg-gray-50/60")}>
        <TableCell className="w-9">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(invoice.id)}
            aria-label={`Select ${invoice.number}`}
          />
        </TableCell>
        <TableCell className="w-9 pr-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={
              expanded ? "Collapse ledger detail" : "Expand ledger detail"
            }
          >
            {expanded ? (
              <LuChevronDown className="h-4 w-4" />
            ) : (
              <LuChevronRight className="h-4 w-4" />
            )}
          </button>
        </TableCell>
        <TableCell className="font-medium text-gray-900 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {invoice.number}
            {invoice.isRecurring && (
              <LuRepeat
                className="h-3 w-3 text-gray-400"
                aria-label="Recurring invoice"
              />
            )}
          </div>
        </TableCell>
        <TableCell>
          <p className="text-gray-800">{invoice.client.name}</p>
          <HealthDot
            score={invoice.client.healthScore}
            avgCollectionDays={invoice.client.avgCollectionDays}
          />
        </TableCell>
        <TableCell className="text-gray-500 max-w-[220px] truncate">
          {invoice.description}
        </TableCell>
        <TableCell className="text-gray-500 whitespace-nowrap">
          {formatShortDate(invoice.issuedDate)}
        </TableCell>
        <TableCell
          className={cn(
            "whitespace-nowrap",
            invoice.status === "overdue"
              ? "text-red-600 font-medium"
              : "text-gray-500",
          )}
        >
          {formatShortDate(invoice.dueDate)}
          {invoice.status === "overdue" && (
            <span className="block text-xs text-red-500">
              {overdueDays}d overdue
            </span>
          )}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <p className="font-medium text-gray-900">
            {formatMoney(invoice.amount, invoice.currency)}
          </p>
          {(invoice.status === "partial" || invoice.status === "sent") &&
            invoice.amountPaid > 0 && (
              <p className="text-xs text-gray-400">
                {formatMoney(invoice.amountPaid, invoice.currency)} received
              </p>
            )}
        </TableCell>
        <TableCell>
          <div className="flex flex-col items-start gap-1.5">
            <StatusBadge status={invoice.status} />
            {invoice.paymentProbability !== undefined && (
              <ProbabilityBadge probability={invoice.paymentProbability} />
            )}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            {invoice.status === "draft" && (
              <>
                <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-8">
                    <LuPencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="h-8 bg-emerald-700 hover:bg-emerald-800"
                  disabled={isBusy}
                  onClick={() => onSend(invoice.id)}
                >
                  <LuSend className="h-3.5 w-3.5 mr-1.5" />
                  {isBusy ? "Sending…" : "Send"}
                </Button>
              </>
            )}
            {(invoice.status === "sent" ||
              invoice.status === "overdue" ||
              invoice.status === "partial") && (
              <Link href={`/dashboard/invoices/${invoice.id}/remind`}>
                <Button variant="outline" size="sm" className="h-8">
                  Remind
                </Button>
              </Link>
            )}
            {invoice.status === "paid" && (
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <Button variant="outline" size="sm" className="h-8">
                  <LuFileText className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuEllipsisVertical className="h-4 w-4" />
                  </Button>
                }
              />

              <DropdownMenuContent align="end">
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                {invoice.status !== "draft" && (
                  <DropdownMenuItem>
                    <LuReceiptText className="h-3.5 w-3.5 mr-2" />
                    Issue credit note
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  {invoice.status === "draft" ? "Delete draft" : "Void invoice"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {(invoice.status === "partial" || invoice.status === "sent") &&
            invoice.amountPaid > 0 && (
              <Progress value={pctPaid} className="h-1 mt-2 w-24 ml-auto" />
            )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={9} className="p-0">
            <LedgerBreakdown invoice={invoice} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
