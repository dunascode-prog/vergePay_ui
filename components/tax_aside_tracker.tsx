"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { PiggyBank } from "lucide-react";

export function TaxSetAsideCard() {
  const saved = 185000;
  const target = 505500;

  const percent = (saved / target) * 100;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Tax Set-Aside Tracker
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Suggested reserve
            </span>

            <span className="text-xl font-bold">₦505,500</span>
          </div>

          <Progress value={percent} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span>
              Saved so far <strong>₦185,000</strong>
            </span>

            <span className="text-muted-foreground">
              {Math.round(percent)}% funded
            </span>
          </div>
        </div>

        <Alert className="border-none bg-muted/40">
          <PiggyBank className="h-4 w-4 text-amber-500" />

          <AlertDescription className="leading-6">
            This reserve is an estimate based on approximately{" "}
            <strong>15%</strong> of your year-to-date income. Moving another{" "}
            <strong>₦320,500</strong> into a dedicated tax wallet will fully
            fund the recommendation before year-end.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
