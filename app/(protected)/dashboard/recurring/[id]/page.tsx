import { Suspense } from "react";
import { RecurringPlanDetail } from "@/components/recurring/RecurringPlanDetail";

export default async function RecurringPlanDetailPage({ params }: PageProps<"/dashboard/recurring/[id]">) {
  const { id } = await params;
  return (
    <Suspense>
      <RecurringPlanDetail planId={id} />
    </Suspense>
  );
}
