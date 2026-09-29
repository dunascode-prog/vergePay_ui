"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Goal, GoalContribution } from "@/types/goal";
import { computeGoalPace } from "@/lib/goal-pace";
import { formatMoney, formatShortDate } from "@/lib/format";
import { LuShield, LuLaptop, LuTrendingUp, LuPiggyBank, LuPlus } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  contributions: GoalContribution[];
  onContribute: (goalId: string, amount: number) => Promise<void>;
}

const CATEGORY_ICON = {
  "Emergency Fund": LuShield,
  Equipment: LuLaptop,
  Investment: LuTrendingUp,
  Other: LuPiggyBank,
};

export function GoalCard({ goal, contributions, onContribute }: GoalCardProps) {
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const pace = computeGoalPace(goal);
  const Icon = CATEGORY_ICON[goal.category];

  const history = contributions
    .filter((c) => c.goalId === goal.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  async function handleContribute() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    await onContribute(goal.id, value);
    setSubmitting(false);
    setAmount("");
    setContributing(false);
  }

  return (
    <Card className="border-gray-200 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{goal.name}</p>
              <p className="text-xs text-gray-400">{goal.category}</p>
            </div>
          </div>
          {pace.isComplete ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs shrink-0">
              Funded
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "text-xs shrink-0",
                pace.isOnTrack
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}
            >
              {pace.isOnTrack ? "On track" : "Behind pace"}
            </Badge>
          )}
        </div>

        <Progress value={pct} className="h-2 mb-2" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            {formatMoney(goal.current, goal.currency)} of {formatMoney(goal.target, goal.currency)}
          </p>
          <p className="text-xs font-medium text-emerald-700">{pct}%</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pb-3 border-t border-gray-100 pt-3">
          <span>Deadline {formatShortDate(goal.deadline)}</span>
          {!pace.isComplete && pace.projectedCompletionDate && (
            <span>Projected {formatShortDate(pace.projectedCompletionDate)}</span>
          )}
        </div>

        {contributing ? (
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              min={0}
              placeholder={`Amount (${goal.currency})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button size="sm" className="h-8 bg-emerald-700 hover:bg-emerald-800" disabled={submitting} onClick={handleContribute}>
              {submitting ? "…" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setContributing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800"
              disabled={pace.isComplete}
              onClick={() => setContributing(true)}
            >
              <LuPlus className="h-3.5 w-3.5 mr-1.5" />
              Contribute
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHistory((v) => !v)}>
              History
            </Button>
          </div>
        )}

        {showHistory && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">No contributions yet.</p>
            ) : (
              history.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatShortDate(c.date)}</span>
                  <span className="text-gray-800 font-medium">{formatMoney(c.amount, c.currency)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
