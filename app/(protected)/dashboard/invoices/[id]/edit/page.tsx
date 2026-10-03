import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default async function EditInvoicePage({ params }: PageProps<"/dashboard/invoices/[id]/edit">) {
  const { id } = await params;
  return <InvoiceForm invoiceId={id} />;
}
