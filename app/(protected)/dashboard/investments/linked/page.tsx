import { redirect } from "next/navigation";

// Where the API sends the browser back after the Alpaca approval page
// (BROKERAGE_RETURN_URL): ?status=linked&link_id=… or ?status=failed&reason=….
// The dashboard shows the outcome.
export default async function BrokerageLinked({ searchParams }: PageProps<"/dashboard/investments/linked">) {
  const { status, reason } = await searchParams;
  const params = new URLSearchParams({ brokerage: status === "linked" ? "linked" : "failed" });
  if (status !== "linked" && typeof reason === "string") params.set("reason", reason);
  redirect(`/dashboard?${params}`);
}
