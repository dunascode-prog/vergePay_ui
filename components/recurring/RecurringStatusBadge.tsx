import { Badge } from "@/components/ui/badge";
import { RecurringStatus } from "@/types/recurring";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<RecurringStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export function RecurringStatusBadge({ status }: { status: RecurringStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("font-medium rounded-full px-2.5 py-0.5", config.className)}>
      {config.label}
    </Badge>
  );
}
