"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { month: "Jan", income: 390 },
  { month: "Feb", income: 610 },
  { month: "Mar", income: 310 },
  { month: "Apr", income: 760 },
  { month: "May", income: 480 },
  { month: "Jun", income: 540 },
  { month: "Jul", income: 570 },
  { month: "Aug", income: 510 },
  { month: "Sep", income: 630 },
  { month: "Oct", income: 470 },
  { month: "Nov", income: 540 },
];

export function IncomeStabilityCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Income Stability — 12 Months
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803d" stopOpacity={0.28} />

                  <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis hide />

              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                }}
              />

              <Area
                type="monotone"
                dataKey="income"
                stroke="#15803d"
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-8 border-t pt-5 text-sm">
          <div>
            <p className="text-muted-foreground">Avg monthly income</p>

            <p className="font-semibold">₦280,833</p>
          </div>

          <div>
            <p className="text-muted-foreground">Volatility (CV)</p>

            <p className="font-semibold">25%</p>
          </div>

          <div>
            <p className="text-muted-foreground">Stability Score</p>

            <p className="font-semibold text-emerald-700">60 / 100</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
