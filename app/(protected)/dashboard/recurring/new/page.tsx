import { getClientOptions } from "@/data/mock-recurring";
import { PageHeader } from "@/components/recurring/PageHeader";
import { RecurringPlanForm } from "@/components/recurring/RecurringPlanForm";

export default function NewRecurringPlanPage() {
  const clientOptions = getClientOptions();

  return (
    <div className="flex flex-col items-center">
      <div className="max-w-xl">
        <PageHeader
          backHref="/dashboard/recurring"
          backLabel="Back to recurring billing"
          title="Recurring Billing"
        />

        <RecurringPlanForm clientOptions={clientOptions} />
      </div>
    </div>
  );
}
