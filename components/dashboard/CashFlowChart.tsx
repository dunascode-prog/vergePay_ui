"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatMinor, MonthFlow } from "@/lib/ledger";

// Income and spending are a categorical pair: --chart-income / --chart-spending
// in globals.css, checked for colour-blind separation and 3:1 contrast in
// both light and dark mode.
const config = {
  income: { label: "Income", color: "var(--chart-income)" },
  spending: { label: "Spending", color: "var(--chart-spending)" },
} satisfies ChartConfig;

export function CashFlowChart({ flows, currency }: { flows: MonthFlow[]; currency: string }) {
  const data = flows.map((f) => ({ month: f.label, income: f.income / 100, spending: f.spent / 100 }));
  const empty = flows.every((f) => f.income === 0 && f.spent === 0);
  const major = (value: number) => formatMinor(Math.round(value * 100), currency, { compact: true });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Cash flow</CardTitle>
        <CardDescription>Money in and out over the last 6 months ({currency})</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="flex h-[230px] items-center justify-center text-center text-sm text-muted-foreground">
            No money has moved in these accounts yet.
            <br />
            Income and spending will show here month by month.
          </p>
        ) : (
          <>
            <ChartContainer config={config} className="h-[230px] w-full" aria-hidden>
              <BarChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.5} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => major(Number(v))}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fillOpacity: 0.06 }}
                  content={<ChartTooltipContent formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? name}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatMinor(Math.round(Number(value) * 100), currency)}
                      </span>
                    </span>
                  )} />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="spending" fill="var(--color-spending)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ChartContainer>

            {/* The same numbers as a table, for screen readers. */}
            <table className="sr-only">
              <caption>Monthly income and spending ({currency})</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Income</th>
                  <th scope="col">Spending</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.key}>
                    <th scope="row">{f.label}</th>
                    <td>{formatMinor(f.income, currency)}</td>
                    <td>{formatMinor(f.spent, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
