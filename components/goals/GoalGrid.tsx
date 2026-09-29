"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoalCard } from "./GoalCard";
import { AddGoalDialog } from "./AddGoalDialog";
import { Goal, GoalContribution } from "@/types/goal";
import {
  createGoalAction,
  addContributionAction,
} from "@/app/(protected)/dashboard/goals/actions";

interface GoalGridProps {
  goals: Goal[];
  contributions: GoalContribution[];
}

export function GoalGrid({
  goals: initialGoals,
  contributions: initialContributions,
}: GoalGridProps) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [contributions, setContributions] = useState(initialContributions);

  function handleCreated(goal: Goal) {
    setGoals((prev) => [...prev, goal]);
  }

  async function handleContribute(goalId: string, amount: number) {
    const { goal, contribution } = await addContributionAction(goalId, amount);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? goal : g)));
    setContributions((prev) => [contribution, ...prev]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddGoalDialog onCreate={createGoalAction} onCreated={handleCreated} />
      </div>

      {goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No goals yet — create one to start tracking progress.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              contributions={contributions}
              onContribute={handleContribute}
            />
          ))}
        </div>
      )}
    </div>
  );
}
