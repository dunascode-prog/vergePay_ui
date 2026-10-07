import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderEffectiveness, LatePaymentBucket } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface InvoiceBehaviorCardProps {
  reminders: ReminderEffectiveness;
  latePayments: LatePaymentBucket[];
}

const LATE_COLORS = ["bg-emerald-500", "bg-amber-400", "bg-orange-500", "bg-red-600"];

export function InvoiceBehaviorCard({ reminders, latePayments }: InvoiceBehaviorCardProps) {
  const reminderTotal = reminders.remindersSent;
  const effectivenessRate =
    reminderTotal > 0
      ? Math.round(((reminders.paidWithin48h + reminders.paidLater) / reminderTotal) * 100)
      : 0;

  const lateTotal = latePayments.reduce((sum, b) => sum + b.count, 0);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>Invoice behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Reminder effectiveness</p>
            {reminderTotal > 0 && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {effectivenessRate}% led to payment
              </p>
            )}
          </div>
          {reminderTotal === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders sent in this period.</p>
          ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 py-2">
              <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {reminders.paidWithin48h}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/80">Paid within 48h</p>
            </div>
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 py-2">
              <p className="text-2xl font-semibold text-amber-700 dark:text-amber-400">
                {reminders.paidLater}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400/80">Paid later</p>
            </div>
            <div className="rounded-md bg-red-50 dark:bg-red-950/40 py-2">
              <p className="text-2xl font-semibold text-red-700 dark:text-red-400">
                {reminders.stillUnpaid}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400/80">Still unpaid</p>
            </div>
          </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">{reminderTotal} reminders sent this period</p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Late payment distribution</p>
          {lateTotal === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices were paid in this period.</p>
          ) : (
          <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted mb-3">
            {latePayments.map((bucket, i) =>
              bucket.count > 0 ? (
                <div
                  key={bucket.label}
                  className={cn("h-full", LATE_COLORS[i] ?? "bg-slate-300")}
                  style={{ width: `${(bucket.count / lateTotal) * 100}%` }}
                />
              ) : null
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {latePayments.map((bucket, i) => (
              <div key={bucket.label} className="flex items-center gap-2 text-xs">
                <span className={cn("h-2 w-2 rounded-full", LATE_COLORS[i] ?? "bg-slate-300")} />
                <span className="text-muted-foreground">{bucket.label}</span>
                <span className="text-foreground/90 font-medium ml-auto">{bucket.count}</span>
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
