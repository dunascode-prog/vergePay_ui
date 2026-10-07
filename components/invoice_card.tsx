import Link from "next/link";
import { SampleBadge } from "@/components/dashboard/SampleWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function OutstandingInvoiceCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          Outstanding invoices
          <SampleBadge />
        </CardTitle>

        <Link
          href="/dashboard/invoices"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-emerald-600 hover:text-emerald-700")}
        >
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invoice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h4 className="text-sm font-medium">StartupXYZ</h4>

              <p className="text-xs text-muted-foreground">
                INV-030 • Due Nov 20
              </p>
            </div>
          </div>

          <span className="font-semibold text-orange-600">₦120k</span>
        </div>

        {/* AI Prediction */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />

          <p className="text-sm text-emerald-700">
            <span className="font-semibold">71%</span> chance of payment within
            the next 7 days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
