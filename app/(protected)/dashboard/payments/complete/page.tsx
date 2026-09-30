import { PaymentResult } from "./PaymentResult";

// Where Flutterwave sends the customer after a card checkout or a 3-D Secure
// step (FLW_REDIRECT_URL). Our own transaction id comes first in the query;
// Flutterwave appends its own params (status, tx_ref, its transaction_id)
// after it, which are only hints: the API verifies with Flutterwave itself.
export default async function PaymentComplete({ searchParams }: PageProps<"/dashboard/payments/complete">) {
  const params = await searchParams;
  const raw = params.transaction_id;
  const transactionId = Array.isArray(raw) ? raw[0] : raw;
  return <PaymentResult transactionId={transactionId ?? null} />;
}
