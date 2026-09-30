import { SampleBadge } from "@/components/dashboard/SampleWidgets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Lightbulb,
} from "lucide-react";

const envelopes = [
  {
    name: "Rent & Housing",
    progress: 100,
    current: "₦90k",
    target: "₦90k",
  },
  {
    name: "Investment",
    progress: 100,
    current: "₦60k",
    target: "₦60k",
  },
  {
    name: "Emergency",
    progress: 100,
    current: "₦45k",
    target: "₦45k",
  },
  {
    name: "Personal Spending",
    progress: 37,
    current: "₦22k",
    target: "₦60k",
  },
];

export function AIEnvelopeSummary() {
  return (
    <Card className="h-full rounded-2xl bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              AI Summary
            </CardTitle>

            <CardDescription className="mt-1 text-xs">
              Great allocation. You&apos;re prioritizing essentials.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Healthy
            </Badge>
            <SampleBadge />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {envelopes.map((item) => (
          <div key={item.name} className="flex flex-row justify-between">
            <div className="flex flex-row items-center justify-between text-sm">
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-3 text-xs text-muted-foreground">
                <span>{item.progress}%</span>
                <span>
                  {item.current} / {item.target}
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.progress === 100
                      ? "bg-emerald-500"
                      : item.progress > 50
                        ? "bg-primary"
                        : item.progress > 0
                          ? "bg-amber-500"
                          : "bg-slate-300"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-primary/5 p-3">
          <p className="text-xs font-medium">💡 AI Recommendation</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Allocate <strong>₦45k</strong> to Business Reinvestment to balance
            your financial portfolio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
