"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Alert, AlertDescription } from "@/components/ui/alert";

const data = [
  { day: "Mon", amount: 8200, fill: "var(--chart-2)" },
  { day: "Tue", amount: 7600, fill: "var(--chart-2)" },
  { day: "Wed", amount: 13500, fill: "var(--chart-3)" },
  { day: "Thu", amount: 8600, fill: "var(--chart-2)" },
  { day: "Fri", amount: 11200, fill: "var(--chart-2)" },
  { day: "Sat", amount: 18200, fill: "var(--chart-5)" },
  { day: "Sun", amount: 9600, fill: "var(--chart-2)" },
];

const chartConfig = {
  amount: {
    label: "Spend",
  },
};

export function SpendingHabitsCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Spending Habits — By Day of Week
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />

            <XAxis dataKey="day" tickLine={false} axisLine={false} />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(v: number) => `₦${v.toLocaleString()}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>

        <Alert className="border-none bg-muted/40">
          <AlertDescription>
            Saturday spending is
            <strong> 2.2× </strong>
            your weekday average. Consider moving discretionary purchases into a
            dedicated weekend envelope.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
