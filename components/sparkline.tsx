"use client";

import { Area, AreaChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type SparklineProps = {
  data: { value: number }[];
  color: string;
};

export function Sparkline({ data, color }: SparklineProps) {
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
          content={<ChartTooltipContent hideLabel />}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2.5}
        />
      </AreaChart>
    </ChartContainer>
  );
}
