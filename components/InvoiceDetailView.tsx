"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Invoice } from "@/types/invoice";
import { formatMoney, formatShortDate } from "@/lib/format";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";
import { HealthDot } from "./HealthDot";
import { LedgerBreakdown } from "./LedgerBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  LuDownload,
  LuBellRing,
  LuCopy,
  LuReceiptText,
  LuPencil,
} from "react-icons/lu";

interface InvoiceDetailViewProps {
  invoice: Invoice | undefined;
}

export function InvoiceDetailView({ invoice }: InvoiceDetailViewProps) {
  if (!invoice) {
    notFound();
  }

  const balance = invoice.amount - invoice.amountPaid;
  const pctPaid =
    invoice.amount > 0
      ? Math.round((invoice.amountPaid / invoice.amount) * 100)
      : 0;
  const canRemind =
    invoice.status === "sent" ||
    invoice.status === "overdue" ||
    invoice.status === "partial";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <PageHeader
          backHref="/dashboard/invoices"
          backLabel="Back to invoices"
          title={invoice.number}
        >
          {invoice.status === "draft" && (
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Button variant="outline" size="sm">
                <LuPencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
          )}
          {canRemind && (
            <Link href={`/dashboard/invoices/${invoice.id}/remind`}>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                <LuBellRing className="h-3.5 w-3.5 mr-1.5" />
                Send reminder
              </Button>
            </Link>
          )}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="space-y-4">
            <Card className="border-gray-200 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">
                      {invoice.description}
                    </p>
                    <p className="text-3xl font-semibold text-gray-900 mt-1">
                      {formatMoney(invoice.amount, invoice.currency)}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>

                {(invoice.status === "partial" || invoice.status === "sent") &&
                  invoice.amountPaid > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500">
                          {formatMoney(invoice.amountPaid, invoice.currency)}{" "}
                          received
                        </span>
                        <span className="text-gray-500">
                          {formatMoney(balance, invoice.currency)} remaining
                        </span>
                      </div>
                      <Progress value={pctPaid} className="h-2" />
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                  <div>
                    <p className="text-gray-400">Issued</p>
                    <p className="text-gray-800 mt-0.5">
                      {formatShortDate(invoice.issuedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Due</p>
                    <p className="text-gray-800 mt-0.5">
                      {formatShortDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LedgerBreakdown invoice={invoice} />
              </CardContent>
            </Card>

            {invoice.payments.length > 0 && (
              <Card className="border-gray-200 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Payment history
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="text-gray-800">{payment.method}</p>
                        <p className="text-xs text-gray-400">
                          {formatShortDate(payment.date)} · {payment.reference}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatMoney(payment.amount, invoice.currency)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="border-gray-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {invoice.client.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {invoice.client.name}
                    </p>
                    <HealthDot
                      score={invoice.client.healthScore}
                      avgCollectionDays={invoice.client.avgCollectionDays}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-none">
              <CardContent className="p-3 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <LuDownload className="h-3.5 w-3.5 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <LuCopy className="h-3.5 w-3.5 mr-2" />
                  Duplicate
                </Button>
                {invoice.status !== "draft" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <LuReceiptText className="h-3.5 w-3.5 mr-2" />
                    Issue credit note
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-600"
                >
                  {invoice.status === "draft" ? "Delete draft" : "Void invoice"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
