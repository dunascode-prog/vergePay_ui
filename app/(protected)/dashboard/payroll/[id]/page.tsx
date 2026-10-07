import { PayeeDetail } from "@/components/payroll/PayeeDetail";

export default async function PayeeDetailPage({ params }: PageProps<"/dashboard/payroll/[id]">) {
  const { id } = await params;
  return <PayeeDetail payeeId={id} />;
}
