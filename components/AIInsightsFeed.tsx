import { AIInsight, InsightTone } from "@/types/analytics";
import { LuSparkles, LuTriangleAlert, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface AIInsightsFeedProps {
  insights: AIInsight[];
}

const TONE_CONFIG: Record<InsightTone, { icon: typeof LuSparkles; className: string; iconClassName: string }> = {
  positive: {
    icon: LuCircleCheck,
    className: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    icon: LuTriangleAlert,
    className: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: LuSparkles,
    className: "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
};

export function AIInsightsFeed({ insights }: AIInsightsFeedProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <LuSparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-foreground">Insights</p>
        <p className="text-xs text-muted-foreground">· from your invoices and transactions</p>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => {
          const config = TONE_CONFIG[insight.tone];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={cn("flex gap-3 rounded-lg border px-4 py-3", config.className)}
            >
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconClassName)} />
              <div>
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
