import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/analytics";
import { formatMoney, formatShortDate } from "@/lib/format";

interface GoalsProgressCardProps {
  goals: Goal[];
}

export function GoalsProgressCard({ goals }: GoalsProgressCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-foreground/90">{goal.name}</p>
                <p className="text-xs text-muted-foreground">by {formatShortDate(goal.deadline)}</p>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">
                  {formatMoney(goal.current, goal.currency)} of {formatMoney(goal.target, goal.currency)}
                </p>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{pct}%</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
