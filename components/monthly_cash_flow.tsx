"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartDataA = [
  {
    month: "Jun",
    income: 450000,
    spending: 220000,
    savings: 450000,
    investments: 400000,
  },
  {
    month: "Jul",
    income: 520000,
    spending: 280000,
    savings: 450000,
    investments: 300000,
  },
  {
    month: "Aug",
    income: 380000,
    spending: 320000,
    savings: 320000,
    investments: 200000,
  },
  {
    month: "Sep",
    income: 490000,
    spending: 300000,
    savings: 400000,
    investments: 220000,
  },
  {
    month: "Oct",
    income: 420000,
    spending: 350000,
    savings: 350000,
    investments: 400000,
  },
  {
    month: "Nov",
    income: 760000,
    spending: 260000,
    savings: 200000,
    investments: 400000,
  },
];

const chartConfigA = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },

  spending: {
    label: "Spending",
    color: "var(--chart-2)",
  },

  savings: {
    label: "Savings",
    color: "var(--chart-3)",
  },
  investments: {
    label: "Investments",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;
const chartData = [
  {
    month: "Jun",
    income: 450000,
    spending: 220000,
  },
  {
    month: "Jul",
    income: 520000,
    spending: 280000,
  },
  {
    month: "Aug",
    income: 380000,
    spending: 320000,
  },
  {
    month: "Sep",
    income: 490000,
    spending: 300000,
  },
  {
    month: "Oct",
    income: 420000,
    spending: 350000,
  },
  {
    month: "Nov",
    income: 760000,
    spending: 260000,
  },
];

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },

  spending: {
    label: "Spending",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function MonthlyCashFlowA() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>
          Monthly Cash Flow — 6 Months
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfigA} className="h-[230px] w-full">
          <BarChart
            data={chartDataA}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis hide />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="spending"
              fill="var(--color-spending)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="savings"
              fill="var(--color-savings)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="investments"
              fill="var(--color-investments)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
export function MonthlyCashFlow() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>
          Detailed Monthly Cash Flow — 6 Months
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[230px] w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis hide />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="spending"
              fill="var(--color-spending)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
