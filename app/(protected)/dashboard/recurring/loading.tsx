import { Skeleton } from "@/components/ui/skeleton";

export default function RecurringBillingLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
