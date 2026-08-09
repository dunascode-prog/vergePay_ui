import { RemindInvoiceView } from "@/components/RemindInvoiceView";
import { getInvoiceById } from "@/data/mock-invoices";

interface RemindPageProps {
  params: { id: string };
}

export default async function RemindPage({ params }: RemindPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  return <RemindInvoiceView invoice={invoice} />;
}
