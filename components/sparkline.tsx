"use client";

import { Area, AreaChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type SparklineProps = {
  data: { value: number; label?: string }[];
  color: string;
  /** Formats the hovered value (e.g. as money); defaults to the raw number. */
  formatValue?: (value: number) => string;
};

export function Sparkline({ data, color, formatValue }: SparklineProps) {
  const config = {
    value: {
      label: "Value",
      color,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-12 w-24">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          top: 5,
          bottom: 5,
          left: 0,
          right: 0,
        }}
      >
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              labelKey="label"
              nameKey="label"
              formatter={(value, _name, item) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">{item.payload.label}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatValue ? formatValue(Number(value)) : String(value)}
                  </span>
                </span>
              )}
            />
          }
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
