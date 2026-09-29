import { notFound } from "next/navigation";
import { getRecurringPlanById } from "@/data/mock-recurring";
import { pausePlan, resumePlan, cancelPlan } from "../actions";
import { PageHeader } from "@/components/recurring/PageHeader";
import { RecurringStatusBadge } from "@/components/recurring/RecurringStatusBadge";
import { RecurringPlanActions } from "@/components/recurring/RecurringPlanActions";
import { HealthDot } from "@/components/recurring/HealthDot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMoney, formatShortDate } from "@/lib/format";

interface RecurringPlanDetailPageProps {
  params: { id: string };
}

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default async function RecurringPlanDetailPage({ params }: RecurringPlanDetailPageProps) {
  const plan = await getRecurringPlanById(params.id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        backHref="/recurring"
        backLabel="Back to recurring billing"
        title={plan.description}
      >
        <RecurringStatusBadge status={plan.status} />
      </PageHeader>

      <div className="space-y-4">
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-50 text-emerald-700 text-sm font-medium">
                  {plan.client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{plan.client.name}</p>
                <HealthDot
                  score={plan.client.healthScore}
                  avgCollectionDays={plan.client.avgCollectionDays}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {formatMoney(plan.amount, plan.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Frequency</p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {FREQUENCY_LABEL[plan.frequency]}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Started</p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {formatShortDate(plan.startDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Next billing</p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {plan.status === "active" ? formatShortDate(plan.nextBillingDate) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Billing history</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Invoices generated</p>
              <p className="text-gray-900 font-medium mt-0.5">{plan.invoicesGenerated}</p>
            </div>
            <div>
              <p className="text-gray-400">Last invoice</p>
              <p className="text-gray-900 font-medium mt-0.5">
                {formatShortDate(plan.lastInvoiceDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Manage plan</CardTitle>
          </CardHeader>
          <CardContent>
            <RecurringPlanActions
              plan={plan}
              onPause={pausePlan}
              onResume={resumePlan}
              onCancel={cancelPlan}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
