"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenuePoint } from "@/types/analytics";
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

interface RevenueTrendChartProps {
  data: RevenuePoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const ngn = payload.find((p: any) => p.dataKey === "ngn")?.value ?? 0;
  const usd = payload.find((p: any) => p.dataKey === "usdRaw")?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">NGN: {formatMoney(ngn, "NGN")}</p>
      {usd > 0 && <p className="text-muted-foreground">USD: {formatMoney(usd, "USD")}</p>}
    </div>
  );
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const hasUsd = data.some((d) => d.usdRaw > 0);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium text-foreground">Revenue trend</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-600 dark:bg-emerald-400" /> NGN
          </span>
          {hasUsd && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-blue-500 dark:bg-blue-400" /> USD
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="ngn" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
              {hasUsd && (
                <Bar dataKey="usdRaw" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={12} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Bars are shown per currency and are not converted or combined into one total.
        </p>
      </CardContent>
    </Card>
  );
}
