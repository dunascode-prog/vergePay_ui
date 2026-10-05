import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

// ?client=<id> starts with that client chosen (from the clients page)
export default function NewInvoicePage() {
  return (
    <Suspense>
      <InvoiceForm />
    </Suspense>
  );
}
