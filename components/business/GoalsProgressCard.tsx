import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/business";
import { formatMoney, formatShortDate } from "@/lib/format";

interface GoalsProgressCardProps {
  goals: Goal[];
}

export function GoalsProgressCard({ goals }: GoalsProgressCardProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-gray-800">{goal.name}</p>
                <p className="text-xs text-gray-400">by {formatShortDate(goal.deadline)}</p>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-gray-500">
                  {formatMoney(goal.current, goal.currency)} of {formatMoney(goal.target, goal.currency)}
                </p>
                <p className="text-xs font-medium text-emerald-700">{pct}%</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
