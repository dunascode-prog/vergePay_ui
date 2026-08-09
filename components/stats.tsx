import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";

export const financialStats = [
  {
    title: "Total Income",
    value: "₦300,000",
    change: "+67%",
    period: "vs Oct",
    trend: "up",
  },
  {
    title: "Total Expenses",
    value: "₦120,000",
    change: "-12%",
    period: "vs Oct",
    trend: "down",
  },
  {
    title: "Savings",
    value: "₦180,000",
    change: "+24%",
    period: "vs Oct",
    trend: "up",
  },
  {
    title: "Investments",
    value: "₦60,000",
    change: "+24%",
    period: "vs Oct",
    trend: "up",
  },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  period: string;
  trend: "up" | "down";
}

const data = [
  { value: 12 },
  { value: 16 },
  { value: 18 },
  { value: 24 },
  { value: 22 },
  { value: 30 },
  { value: 36 },
];
export default function StatCard({
  title,
  value,
  change,
  period,
  trend,
}: StatCardProps) {
  const isPositive = trend === "up";

  return (
    <Card className="rounded-xl transition-all">
      <CardContent className="flex items-center justify-between gap-6 p-5">
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <h2 className="text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </h2>

          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              isPositive ? "text-emerald-600" : "text-red-500",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}

            <span>{change}</span>

            <span className="font-normal text-muted-foreground">{period}</span>
          </div>
        </div>

        <div className="flex h-20 w-28 items-center justify-center overflow-hidden">
          <ChartContainer config={{}} className="h-20 w-28">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={isPositive ? "fill-positive" : "fill-negative"}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                fill={`url(#${isPositive ? "fill-positive" : "fill-negative"})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
