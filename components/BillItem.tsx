import { cn } from "@/lib/utils";
import { ArrowUpRight, AlertTriangle } from "lucide-react";

type UpcomingBillButtonProps = {
  title: string;
  subtitle: string;
  amount: string;
  status?: "success" | "warning";
};

export function UpcomingBillButton({
  title,
  subtitle,
  amount,
  status = "success",
}: UpcomingBillButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-2 py-3 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            status === "success"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          )}
        >
          {status === "success" ? (
            <ArrowUpRight className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
        </div>

        <div className="text-left">
          <p className="text-sm font-medium">{title}</p>

          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <span
        className={cn(
          "font-semibold tabular-nums",
          status === "success" ? "text-emerald-600" : "text-red-500",
        )}
      >
        {amount}
      </span>
    </button>
  );
}
