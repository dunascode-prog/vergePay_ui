import { InvoiceDetailView } from "@/components/InvoiceDetailView";
import { getInvoiceById } from "@/data/mock-invoices";

interface InvoiceDetailPageProps {
  params: { id: string };
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = getInvoiceById(id);
  return <InvoiceDetailView invoice={invoice} />;
}
