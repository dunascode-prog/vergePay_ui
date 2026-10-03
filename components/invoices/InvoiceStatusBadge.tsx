import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/invoicing";
import { InvoiceStatus } from "@/types/invoicing";

const TONE: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  overdue: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  paid: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled: "bg-muted text-muted-foreground line-through decoration-1",
  refunded: "bg-muted text-muted-foreground",
};

/** Status as a word in a soft pill; the word, not the colour, carries the meaning. */
export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", TONE[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}
