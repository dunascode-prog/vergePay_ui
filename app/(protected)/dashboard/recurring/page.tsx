import Link from "next/link";
import { getRecurringPlans } from "@/data/mock-recurring";
import { pausePlan, resumePlan, cancelPlan } from "./actions";
import { PageHeader } from "@/components/recurring/PageHeader";
import { RecurringSummaryCards } from "@/components/recurring/RecurringSummaryCards";
import { RecurringPlansTable } from "@/components/recurring/RecurringPlansTable";
import { Button } from "@/components/ui/button";
import { LuPlus } from "react-icons/lu";

export default async function RecurringBillingPage() {
  const plans = await getRecurringPlans();

  return (
    <>
      <PageHeader
        backHref="/dashboard/invoices"
        backLabel="Back to invoices"
        title=""
      >
        {/* <Link href="/dashboard/recurring/new">
          <Button className="bg-emerald-700 hover:bg-emerald-800">
            <LuPlus className="h-4 w-4 mr-1.5" />
            New plan
          </Button>
        </Link> */}
      </PageHeader>

      <div className="space-y-4">
        <RecurringSummaryCards plans={plans} />
        <RecurringPlansTable
          plans={plans}
          onPause={pausePlan}
          onResume={resumePlan}
          onCancel={cancelPlan}
        />
      </div>
    </>
  );
}
