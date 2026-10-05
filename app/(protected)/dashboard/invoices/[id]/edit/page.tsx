import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default async function EditInvoicePage({ params }: PageProps<"/dashboard/invoices/[id]/edit">) {
  const { id } = await params;
  return (
    <Suspense>
      <InvoiceForm invoiceId={id} />
    </Suspense>
  );
}
