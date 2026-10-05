import { Suspense } from "react";
import { RecurringPlanForm } from "@/components/recurring/RecurringPlanForm";

// ?client=<id> starts with that client chosen (from the clients page)
export default function NewRecurringPlanPage() {
  return (
    <Suspense>
      <RecurringPlanForm />
    </Suspense>
  );
}
