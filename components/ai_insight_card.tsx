import { Sparkles, AlertTriangle, Info, CircleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: string;
  insight: string;
  variant?: "success" | "warning" | "info" | "danger";
}

const variants = {
  success: {
    icon: Sparkles,
    card: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-400",
  },

  warning: {
    icon: AlertTriangle,
    card: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-700 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-400",
  },

  info: {
    icon: Info,
    card: "border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/30",
    iconBg: "bg-sky-100 dark:bg-sky-900",
    iconColor: "text-sky-700 dark:text-sky-400",
    title: "text-sky-700 dark:text-sky-400",
  },

  danger: {
    icon: CircleAlert,
    card: "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30",
    iconBg: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-700 dark:text-red-400",
    title: "text-red-700 dark:text-red-400",
  },
};

export function AIInsightCard({
  title,
  insight,
  variant = "success",
}: AIInsightCardProps) {
  const styles = variants[variant];
  const Icon = styles.icon;

  return (
    <Card className={cn("rounded-2xl shadow-sm", styles.card)}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              styles.iconBg,
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>

          <div className="space-y-2">
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-wide",
                styles.title,
              )}
            >
              {title}
            </h3>

            <p className="text-sm leading-7 text-muted-foreground">{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
