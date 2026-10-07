import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  chart: React.ReactNode;
};

export default function Metric({
  title,
  value,
  change,
  positive,
  chart,
}: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">
        {title}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </h2>

          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-sm",
              positive ? "text-emerald-600" : "text-red-500",
            )}
          >
            {positive ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}

            {change}
          </div>
        </div>

        <div className="h-12 w-20 overflow-hidden">{chart}</div>
      </div>
    </div>
  );
}
