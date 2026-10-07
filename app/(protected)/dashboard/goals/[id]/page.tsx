import { GoalDetail } from "@/components/goals/GoalDetail";

export default async function GoalDetailPage({ params }: PageProps<"/dashboard/goals/[id]">) {
  const { id } = await params;
  return <GoalDetail goalId={id} />;
}
