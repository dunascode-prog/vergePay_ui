"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types/expense";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatMoney } from "@/lib/format";

interface ExpenseTrendChartProps {
  expenses: Expense[];
}

function monthKey(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short" });
}

function buildMonthlyTotals(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    if (e.currency !== "NGN") continue;
    const key = monthKey(e.date);
    totals.set(key, (totals.get(key) ?? 0) + e.amount);
  }
  // Preserve chronological order rather than Map insertion order.
  const monthOrder = [...new Set(expenses.map((e) => monthKey(e.date)))].sort(
    (a, b) =>
      new Date(`${a} 1, 2024`).getMonth() - new Date(`${b} 1, 2024`).getMonth(),
  );
  return monthOrder.map((month) => ({ month, total: totals.get(month) ?? 0 }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-red-600">{formatMoney(payload[0].value, "NGN")}</p>
    </div>
  );
}

export function ExpenseTrendChart({ expenses }: ExpenseTrendChartProps) {
  const data = buildMonthlyTotals(expenses);

  return (
    <Card className="lg:col-span-6 border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>
          Monthly spend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="#f1f1f1" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar
                dataKey="total"
                fill="#f87171"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
