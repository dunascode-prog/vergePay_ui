"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessHealthFactor, HealthScoreSnapshot } from "@/types/business";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { LuCircleCheck, LuEye, LuTriangleAlert } from "react-icons/lu";

interface BusinessHealthScoreCardProps {
  currentScore: number;
  history: HealthScoreSnapshot[];
  factors: BusinessHealthFactor[];
}

const FACTOR_ICON = {
  good: LuCircleCheck,
  watch: LuEye,
  risk: LuTriangleAlert,
};

const FACTOR_TONE = {
  good: "text-emerald-600",
  watch: "text-amber-600",
  risk: "text-red-600",
};

export function BusinessHealthScoreCard({
  currentScore,
  history,
  factors,
}: BusinessHealthScoreCardProps) {
  const previous = history[history.length - 2]?.score ?? currentScore;
  const delta = currentScore - previous;

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Business Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold text-gray-900">{currentScore}</p>
            <p
              className={cn(
                "text-xs font-medium mt-1",
                delta >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta} vs last month
            </p>
          </div>
          <div className="h-12 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Line type="monotone" dataKey="score" stroke="#047857" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
          {factors.map((factor) => {
            const Icon = FACTOR_ICON[factor.status];
            return (
              <div key={factor.label} className="flex items-start gap-2.5">
                <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", FACTOR_TONE[factor.status])} />
                <div>
                  <p className="text-sm text-gray-800">{factor.label}</p>
                  <p className="text-xs text-gray-400">{factor.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
