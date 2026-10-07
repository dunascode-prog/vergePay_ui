import { SampleBadge } from "@/components/dashboard/SampleWidgets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Sparkles, TrendingUp, Wallet, Target } from "lucide-react";

export default function AiSummaryCard() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Financial Insight
            </CardTitle>

            <CardDescription>
              Generated from your latest transactions and financial goals.
            </CardDescription>
          </div>

          <SampleBadge />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="leading-7 text-sm">
            🎉 <span className="font-semibold">Strong month!</span> You reached
            your investment target for the first time in{" "}
            <span className="font-medium">4 months</span>, driven by the{" "}
            <span className="font-medium">TechCorp payment</span>.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Key Insights</h4>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <Target className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Emergency Fund</p>
              <p className="text-2xl font-semibold">25.7%</p>
            </div>

            <div className="rounded-lg border p-4">
              <Wallet className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Idle Cash</p>
              <p className="text-2xl font-semibold">₦200,000</p>
            </div>

            <div className="rounded-lg border p-4">
              <TrendingUp className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Target Date</p>
              <p className="text-2xl font-semibold">Jul 2025</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Recommendations
          </h4>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Move{" "}
              <span className="font-medium text-foreground">₦45,000</span> into
              your Business Reinvestment envelope before month-end.
            </li>

            <li>
              • Increase your Emergency Fund contribution by{" "}
              <span className="font-medium text-foreground">₦5,000/month</span>{" "}
              to reach your goal by{" "}
              <span className="font-medium text-foreground">May 2025</span>.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
