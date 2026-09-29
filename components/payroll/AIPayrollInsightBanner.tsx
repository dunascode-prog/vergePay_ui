import { Payee, PayrollPayment } from "@/types/payroll";
import { formatMoney } from "@/lib/format";
import { LuSparkles } from "react-icons/lu";

interface AIPayrollInsightBannerProps {
  payees: Payee[];
  payments: PayrollPayment[];
}

function buildInsight(payees: Payee[], payments: PayrollPayment[]): string {
  const parts: string[] = [];

  const retainers = payees.filter((p) => p.status === "active" && p.payType === "Retainer");
  const monthlyCost = retainers.filter((p) => p.currency === "NGN").reduce((s, p) => s + p.rate, 0);
  if (retainers.length > 0) {
    parts.push(
      `${retainers.length} recurring retainer${retainers.length === 1 ? "" : "s"} cost ${formatMoney(
        monthlyCost,
        "NGN"
      )} per month before any project-based work.`
    );
  }

  const neverPaid = payees.filter((p) => p.status === "active" && p.lastPaidDate === null);
  if (neverPaid.length > 0) {
    parts.push(
      `${neverPaid.map((p) => p.name).join(" and ")} ${
        neverPaid.length === 1 ? "hasn't" : "haven't"
      } been paid yet — run payroll for them once their first period is complete.`
    );
  }

  const projectBased = payees.filter((p) => p.payType === "Per-project");
  if (projectBased.length > 0) {
    const avgProject =
      projectBased.reduce((s, p) => s + (p.lastPaidAmount ?? p.rate), 0) / projectBased.length;
    parts.push(
      `Project-based payouts have averaged around ${formatMoney(avgProject, "NGN")} per engagement.`
    );
  }

  if (payments.length > 0) {
    parts.push(
      `${payments.length} payment${payments.length === 1 ? "" : "s"} recorded so far, each posted as a matching expense.`
    );
  }

  return parts.join(" ");
}

export function AIPayrollInsightBanner({ payees, payments }: AIPayrollInsightBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
      <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-0.5">
          AI payroll insight
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">
          {buildInsight(payees, payments)}
        </p>
      </div>
    </div>
  );
}
