"use client";

import { useRouter } from "next/navigation";
import { Invoice } from "@/types/invoice";
import {
  InvoiceFormPageView,
  InvoiceFormValues,
} from "@/components/InvoiceFormPageView";

interface EditInvoiceClientProps {
  invoice: Invoice;
}

export function EditInvoiceClient({ invoice }: EditInvoiceClientProps) {
  const router = useRouter();

  async function handleUpdate(
    values: InvoiceFormValues,
    submitType: "draft" | "send",
  ) {
    // TODO: wire to your update-invoice API/mutation, e.g.:
    //
    // await fetch(`/api/invoices/${invoice.id}`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Idempotency-Key": crypto.randomUUID(),
    //   },
    //   body: JSON.stringify({ ...values, status: submitType === "send" ? "sent" : "draft" }),
    // });
    console.log("Update invoice", { id: invoice.id, values, submitType });

    router.push(`/dashboard/invoices/${invoice.id}`);
  }

  return (
    <InvoiceFormPageView
      mode="edit"
      invoice={invoice}
      onSubmit={handleUpdate}
    />
  );
}
