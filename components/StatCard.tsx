import { cn } from "@/lib/utils";

/**
 * One headline number. Every summary row in the app uses it, so they all
 * look the same: a quiet label, the number, and a hint only when it adds
 * something (a count, a warning), never one that repeats the label.
 */
export function StatCard({
  label,
  value,
  hint,
  tone,
  className,
}: {
  label: string;
  /** A short string, or a node such as <CurrencyAmounts>. */
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** "warn" for amber (needs a look), "bad" for red (overdue money). */
  tone?: "warn" | "bad";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-xl border bg-card p-4 sm:p-5", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2">
        {typeof value === "string" ? (
          <p className="truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl" title={value}>
            {value}
          </p>
        ) : (
          value
        )}
      </div>
      {hint && (
        <p
          className={cn(
            "mt-1.5 truncate text-xs",
            tone === "warn" ? "text-amber-700 dark:text-amber-300" : tone === "bad" ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
          )}
          title={typeof hint === "string" ? hint : undefined}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/** The row the cards sit in: two across on phones, more on wider screens. */
export function StatGrid({ children, columns = 4 }: { children: React.ReactNode; columns?: 3 | 4 }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>{children}</div>;
}
