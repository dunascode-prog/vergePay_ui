import { Suspense } from "react";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";

export default async function InvoiceDetailPage({ params }: PageProps<"/dashboard/invoices/[id]">) {
  const { id } = await params;
  return (
    <Suspense>
      <InvoiceDetail invoiceId={id} />
    </Suspense>
  );
}
