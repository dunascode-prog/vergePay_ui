"use client";
import AiSummaryCard from "@/components/ai_component_card";
import { AISummaryCard2 } from "@/components/ai_summary_card";
import AnalyticsPage from "@/components/AnalyticsPage";
import { ClientConcentrationCard } from "@/components/client_concentration";
import FreelancerHealthCard from "@/components/freelancer_health_card";
import { IncomeStabilityCard } from "@/components/icome_stability_card";
import { InvoicePaymentBehaviorCard } from "@/components/invoice_payment_behaviour_card";
import { KeyMetricsCard } from "@/components/key_metrics_card";
import { MonthlySummaryCard } from "@/components/month_summary";
import { MonthlyCashFlowA } from "@/components/monthly_cash_flow";
import { SpendingHabitsCard } from "@/components/spending_habit_card";
import StatCard, { financialStats } from "@/components/stats";
import { SubscriptionAuditCard } from "@/components/subscription_audit_card";
import { TaxSetAsideCard } from "@/components/tax_aside_tracker";

const Page = () => {
  return (
    // <div className="grid grid-cols-1 gap-3 md:grid-cols-9 lg:grid-cols-12 2xl:grid-cols-12 ">
    //   <div className="grid grid-cols-1 gap-2 md:grid-cols-12 lg:grid-cols-12 2xl:grid-cols-12 col-span-1 md:col-span-12 lg:col-span-12 2xl:col-span-12">
    //     {financialStats.map((stat) => (
    //       <div
    //         key={stat.title}
    //         className="col-span-1 md:col-span-4 lg:col-span-3 2xl:col-span-3 "
    //       >
    //         <StatCard
    //           title={stat.title}
    //           value={stat.value}
    //           change={stat.change}
    //           period={stat.period}
    //           trend={stat.trend}
    //         />
    //       </div>
    //     ))}
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-3 2xl:col-span-3">
    //     <FreelancerHealthCard />
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-9 2xl:col-span-9">
    //     <IncomeStabilityCard />
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-6 2xl:col-span-6">
    //     <ClientConcentrationCard />
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-6 2xl:col-span-6">
    //     <InvoicePaymentBehaviorCard />
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-6 2xl:col-span-6">
    //     <SpendingHabitsCard />{" "}
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-6 2xl:col-span-6">
    //     <TaxSetAsideCard />{" "}
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-12 2xl:col-span-12">
    //     <SubscriptionAuditCard />
    //   </div>
    //   <div className="md:col-span-12 lg:col-span-12 2xl:col-span-12">
    //     <AISummaryCard2 />
    //   </div>
    // </div>
    <AnalyticsPage />
  );
};

export default Page;
