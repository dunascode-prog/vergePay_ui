import { getGoals, getContributions } from "@/data/mock-goals";
import { PageHeader } from "@/components/goals/PageHeader";
import { GoalSummaryCards } from "@/components/goals/GoalSummaryCards";
import { AIGoalsInsightBanner } from "@/components/goals/AIGoalsInsightBanner";
import { GoalGrid } from "@/components/goals/GoalGrid";

export default async function GoalsPage() {
  const [goals, contributions] = await Promise.all([
    getGoals(),
    getContributions(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <PageHeader
          backHref="/dashboard/business"
          backLabel="Back to business overview"
          title=""
        />

        <div className="space-y-4 mb-6">
          <GoalSummaryCards goals={goals} />
          <AIGoalsInsightBanner goals={goals} />
        </div>

        <GoalGrid goals={goals} contributions={contributions} />
      </div>
    </div>
  );
}
