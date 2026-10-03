import type { Metadata } from "next";
import { PayPage } from "@/components/invoices/PayPage";

export const metadata: Metadata = { title: "Pay invoice · VergePay", robots: { index: false } };

// The public pay page for an invoice's pay link. Flutterwave's checkout
// returns here with ?transaction_id=<ours>&...&transaction_id=<theirs>; the
// first one is ours.
export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const raw = (await searchParams).transaction_id;
  const transactionId = Array.isArray(raw) ? raw[0] : raw;
  return <PayPage token={token} returnedTransactionId={transactionId} />;
}
