import { mockInvoices } from "@/data/mock-invoices";
import { SummaryCards } from "./SummaryCards";
import { AgingSummary } from "./AgingSummary";
import { AIInsightBanner } from "./AIInsightBanner";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceSidebar } from "./InvoiceSidebar";
import { NewInvoiceDialog } from "./NewInvoiceDialog";

export function InvoicePage() {
  const invoices = mockInvoices;

  return (
    <div className="max-w-screen">
      {/* <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <NewInvoiceDialog />
        </div> */}

      <div className="space-y-4 mb-6">
        <SummaryCards invoices={invoices} />
        <AIInsightBanner message="Average collection time improved from 18 to 7 days this month. Northwind Studios (INV-2024-027) is 28 days overdue with a 28% predicted payment probability — consider a direct call instead of another reminder." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <InvoiceTable invoices={invoices} />
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <AgingSummary invoices={invoices} />
          <InvoiceSidebar invoices={invoices} />
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;
