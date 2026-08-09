import { notFound } from "next/navigation";
import { getInvoiceById } from "@/data/mock-invoices";
import { EditInvoiceClient } from "./EditInvoiceClient";

interface EditInvoicePageProps {
  params: { id: string };
}

export default async function EditInvoicePage({
  params,
}: EditInvoicePageProps) {
  const { id } = await params;
  const invoice = getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return <EditInvoiceClient invoice={invoice} />;
}
