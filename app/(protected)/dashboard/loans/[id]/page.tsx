import { LoanDetail } from "@/components/loans/LoanDetail";

export default async function LoanDetailPage({ params }: PageProps<"/dashboard/loans/[id]">) {
  const { id } = await params;
  return <LoanDetail loanId={id} />;
}
