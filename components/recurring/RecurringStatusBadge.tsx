import { cn } from "@/lib/utils";
import { RecurringStatus } from "@/types/recurring";

const STATUS: Record<RecurringStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};

/** Plan status as a word in a soft pill, like the invoice badges. */
export function RecurringStatusBadge({ status, className }: { status: RecurringStatus; className?: string }) {
  const { label, className: tone } = STATUS[status];
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tone, className)}>{label}</span>;
}
