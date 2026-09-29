"use client";

import {
  InvoiceFormPageView,
  InvoiceFormValues,
} from "@/components/InvoiceFormPageView";
import { useRouter } from "next/navigation";

export default function NewInvoicePage() {
  const router = useRouter();

  async function handleCreate(
    values: InvoiceFormValues,
    submitType: "draft" | "send",
  ) {
    // TODO: wire to your create-invoice API/mutation, e.g.:
    //
    // await fetch("/api/invoices", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Idempotency-Key": crypto.randomUUID(),
    //   },
    //   body: JSON.stringify({ ...values, status: submitType === "send" ? "sent" : "draft" }),
    // });
    console.log("Create invoice", { values, submitType });

    router.push("/dashboard/invoices");
  }

  return <InvoiceFormPageView mode="create" onSubmit={handleCreate} />;
}
