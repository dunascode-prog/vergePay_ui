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
  /** one bar per week (this month) or per month (longer periods) */
  data: RevenuePoint[];
  /** "this month", "in the last 3 months", … for the total under the title */
  periodLabel?: string;
}

// recharts fills these in when it renders the tooltip
interface TooltipEntry {
  dataKey?: string | number;
  value?: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const ngn = payload.find((p) => p.dataKey === "ngn")?.value ?? 0;
  const usd = payload.find((p) => p.dataKey === "usdRaw")?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">NGN: {formatMoney(ngn, "NGN")}</p>
      {usd > 0 && <p className="text-muted-foreground">USD: {formatMoney(usd, "USD")}</p>}
    </div>
  );
}

export function RevenueTrendChart({ data, periodLabel }: RevenueTrendChartProps) {
  const hasUsd = data.some((d) => d.usdRaw > 0);
  const totalNgn = data.reduce((sum, d) => sum + d.ngn, 0);
  const totalUsd = data.reduce((sum, d) => sum + d.usdRaw, 0);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Revenue trend</CardTitle>
          {periodLabel && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-base font-medium text-foreground tabular-nums">{formatMoney(totalNgn, "NGN")}</span>
              {hasUsd && (
                <span className="text-base font-medium text-foreground tabular-nums"> · {formatMoney(totalUsd, "USD")}</span>
              )}{" "}
              {periodLabel}
            </p>
          )}
        </div>
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
