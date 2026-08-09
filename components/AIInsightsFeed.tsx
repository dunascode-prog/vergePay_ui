import { AIInsight, InsightTone } from "@/types/analytics";
import { LuSparkles, LuTriangleAlert, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface AIInsightsFeedProps {
  insights: AIInsight[];
}

const TONE_CONFIG: Record<InsightTone, { icon: typeof LuSparkles; className: string; iconClassName: string }> = {
  positive: {
    icon: LuCircleCheck,
    className: "border-emerald-200 bg-emerald-50/70",
    iconClassName: "text-emerald-600",
  },
  warning: {
    icon: LuTriangleAlert,
    className: "border-amber-200 bg-amber-50/70",
    iconClassName: "text-amber-600",
  },
  info: {
    icon: LuSparkles,
    className: "border-blue-200 bg-blue-50/70",
    iconClassName: "text-blue-600",
  },
};

export function AIInsightsFeed({ insights }: AIInsightsFeedProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <LuSparkles className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-medium text-gray-700">AI monthly report</p>
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
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
