import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/types/invoice";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  partial: {
    label: "Partially paid",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("font-medium rounded-full px-2.5 py-0.5", config.className)}
    >
      {config.label}
    </Badge>
  );
}
