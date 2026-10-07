"use client";

import {
  Sparkles,
  TrendingUp,
  CircleDollarSign,
  Receipt,
  PiggyBank,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const insights = [
  {
    icon: TrendingUp,
    text: (
      <>
        Your income is <strong>25% volatile</strong> over the past year. With{" "}
        <strong>Northbridge Media</strong>
        contributing <strong>42%</strong> of revenue, prioritize acquiring one
        or two additional anchor clients next quarter.
      </>
    ),
  },
  {
    icon: Receipt,
    text: (
      <>
        Average payment time has improved to <strong>9.4 days</strong> (down
        from <strong>14 days</strong>), but one invoice remains{" "}
        <strong>32 days overdue.</strong> Sending a reminder this week could
        significantly improve cash flow.
      </>
    ),
  },
  {
    icon: CircleDollarSign,
    text: (
      <>
        Your monthly spending is <strong>40%</strong> above your rolling
        three-month average. Reducing discretionary expenses would keep you on
        track for your
        <strong> MacBook Pro savings goal.</strong>
      </>
    ),
  },
  {
    icon: PiggyBank,
    text: (
      <>
        Your tax reserve is currently <strong>37% funded.</strong> Setting aside
        another <strong>₦320,500</strong> before filing season will fully fund
        your estimated obligation.
      </>
    ),
  },
];

export function AISummaryCard2() {
  return (
    <Card className="overflow-hidden rounded-2xl border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <CardTitle>AI Monthly Report</CardTitle>

            <p className="text-sm text-muted-foreground">November 2024</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="rounded-xl border border-emerald-200/50 bg-background/70 p-4 dark:border-emerald-900">
          <p className="leading-7 text-sm">
            Best investment month in <strong>6 months.</strong> You redirected{" "}
            <strong>₦60,000</strong> into investments, reaching your{" "}
            <strong>20%</strong> savings target for the first time since May. At
            this pace, your <strong>₦1.5M emergency fund</strong> will be
            completed around <strong>July 2025</strong>, approximately{" "}
            <strong>3 months ahead</strong> of your original projection.
          </p>
        </div>

        <div className="space-y-2">
          {insights.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="mt-0.5 rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                <Icon className="h-4 w-4 text-emerald-700" />
              </div>

              <p className="text-sm leading-7">{text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
