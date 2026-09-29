import { getPayees, getPayrollPayments } from "@/data/mock-payroll";
import { PageHeader } from "@/components/payroll/PageHeader";
import { PayrollSummaryCards } from "@/components/payroll/PayrollSummaryCards";
import { AIPayrollInsightBanner } from "@/components/payroll/AIPayrollInsightBanner";
import { PayeeGrid } from "@/components/payroll/PayeeGrid";

export default async function PayrollPage() {
  const [payees, payments] = await Promise.all([
    getPayees(),
    getPayrollPayments(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <PageHeader
          backHref="/dashboard/business"
          backLabel="Back to business overview"
          title=""
        />

        <div className="space-y-4 mb-6">
          <PayrollSummaryCards payees={payees} payments={payments} />
          <AIPayrollInsightBanner payees={payees} payments={payments} />
        </div>

        <PayeeGrid payees={payees} payments={payments} />
      </div>
    </div>
  );
}
