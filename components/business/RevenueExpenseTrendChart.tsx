"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueExpensePoint } from "@/types/business";
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

interface RevenueExpenseTrendChartProps {
  data: RevenueExpensePoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p: any) => p.dataKey === "revenueNgn")?.value ?? 0;
  const expenses = payload.find((p: any) => p.dataKey === "expensesNgn")?.value ?? 0;
  const revenueUsd = payload.find((p: any) => p.dataKey === "revenueUsd")?.value ?? 0;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-700">Revenue: {formatMoney(revenue, "NGN")}</p>
      <p className="text-red-600">Expenses: {formatMoney(expenses, "NGN")}</p>
      {revenueUsd > 0 && <p className="text-blue-600">USD revenue: {formatMoney(revenueUsd, "USD")}</p>}
    </div>
  );
}

export function RevenueExpenseTrendChart({ data }: RevenueExpenseTrendChartProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Revenue vs. expenses</CardTitle>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-600" /> Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-red-400" /> Expenses
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid vertical={false} stroke="#f1f1f1" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="revenueNgn" fill="#047857" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expensesNgn" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          NGN only — USD revenue (shown in the tooltip) is kept separate rather than converted in.
        </p>
      </CardContent>
    </Card>
  );
}
