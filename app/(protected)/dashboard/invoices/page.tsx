import { AIInsightCard } from "@/components/ai_insight_card";
import { InvoiceStatCard } from "@/components/inovoice_stat_card";
import { InvoiceTable } from "@/components/invoice_table";
import InvoicePage from "@/components/InvoicePage";
import React from "react";

export const invoices = {
  invoices: [
    {
      id: "INV-2024-031",
      client: "TechCorp",
      description: "UI Design — Mobile App",
      issued: "Nov 1",
      dueDate: "Nov 15",
      amount: 500000,
      status: "Paid",
    },
    {
      id: "INV-2024-030",
      client: "StartupXYZ",
      description: "Product Strategy Retainer",
      issued: "Nov 5",
      dueDate: "Nov 20",
      amount: 120000,
      status: "Sent",
    },
    {
      id: "INV-2024-029",
      client: "DesignAgency Ltd",
      description: "Brand Identity Project",
      issued: "Oct 22",
      dueDate: "Oct 30",
      amount: 200000,
      status: "Paid",
    },
    {
      id: "INV-2024-028",
      client: "MediaHouse Nigeria",
      description: "Website Redesign",
      issued: "—",
      dueDate: "—",
      amount: 350000,
      status: "Draft",
    },
  ],
};
const Page = () => {
  return (
    // <div className="flex flex-col gap-6">
    //   <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    //     <InvoiceStatCard
    //       title="Paid This Month"
    //       amount="₦500,000"
    //       subtitle="3 invoices • avg 7 days"
    //       color="green"
    //     />

    //     <InvoiceStatCard
    //       title="Outstanding"
    //       amount="₦120,000"
    //       subtitle="1 invoice • due Nov 20"
    //       color="orange"
    //     />

    //     <InvoiceStatCard
    //       title="Overdue"
    //       amount="₦0"
    //       subtitle="No overdue invoices"
    //     />

    //     <InvoiceStatCard
    //       title="Total This Year"
    //       amount="₦1.17M"
    //       subtitle="From 4 clients"
    //     />
    //   </div>
    //   <div className="grid gap-6 xl:grid-cols-12">
    //     <section className="space-y-6 xl:col-span-9">
    //       <AIInsightCard
    //         title="AI Invoice Insight"
    //         insight="No overdue invoices this month. Average collection time improved from 18 days to 7 days. StartupXYZ (INV-030, ₦120,000) has a 71% probability of payment within 7 days based on previous payment behaviour."
    //       />

    //       <InvoiceTable invoices={invoices} />
    //     </section>

    //     <aside className="space-y-6 xl:col-span-3">
    //       {/* <InvoiceSummaryCard />

    //       <ClientQuickView /> */}
    //     </aside>
    //   </div>
    // </div>
    <InvoicePage />
  );
};

export default Page;
