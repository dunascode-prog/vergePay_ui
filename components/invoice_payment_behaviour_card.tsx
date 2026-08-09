"use client";

import { AlertCircle, Clock3, Timer } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Separator } from "@/components/ui/separator";

function KPI({
  title,
  value,
  suffix,
  change,
  changeColor = "text-emerald-600",
}: {
  title: string;
  value: string;
  suffix?: string;
  change?: string;
  changeColor?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold tracking-tight">{value}</span>

        {suffix && <span className="pb-1 text-muted-foreground">{suffix}</span>}

        {change && (
          <span className={`pb-1 text-sm ${changeColor}`}>{change}</span>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({
  icon,
  label,
  amount,
  amountClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  amountClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        {icon}

        <span className="text-sm">{label}</span>
      </div>

      <span className={`font-semibold ${amountClass}`}>{amount}</span>
    </div>
  );
}

export function InvoicePaymentBehaviorCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Invoice & Payment Behavior
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <KPI
            title="Avg. Days to Get Paid"
            value="9.4"
            suffix="days"
            change="↓ from 14d"
          />

          <KPI title="On-Time Rate" value="82%" />
        </div>

        <Separator />

        <div className="space-y-4">
          <InvoiceRow
            icon={<Clock3 className="h-4 w-4 text-amber-500" />}
            label="Outstanding invoices"
            amount="₦85,000"
          />

          <InvoiceRow
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
            label="Overdue (32 days)"
            amount="₦32,000"
            amountClass="text-red-600"
          />
        </div>

        <Alert className="border-none bg-muted/50">
          <Timer className="h-4 w-4 text-amber-500" />

          <AlertDescription className="leading-6">
            <strong>1 invoice</strong> is <strong>32 days overdue.</strong>{" "}
            Consider sending a follow-up reminder or applying your late-payment
            terms to improve collection time.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
