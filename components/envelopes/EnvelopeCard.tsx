"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnvelopeView } from "@/types/envelope";
import { formatMoney } from "@/lib/format";
import { LuLink, LuPlus, LuMinus, LuArrowUpRight } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface EnvelopeCardProps {
  envelope: EnvelopeView;
  onAddFunds: (envelopeId: string, amount: number) => Promise<void>;
  onWithdraw: (envelopeId: string, amount: number, note: string) => Promise<void>;
}

export function EnvelopeCard({ envelope, onAddFunds, onWithdraw }: EnvelopeCardProps) {
  const [mode, setMode] = useState<"none" | "fund" | "withdraw">("none");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pct = Math.min(100, Math.round((envelope.spent / envelope.allocated) * 100));

  function reset() {
    setMode("none");
    setAmount("");
    setNote("");
  }

  async function handleAddFunds() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    await onAddFunds(envelope.id, value);
    setSubmitting(false);
    reset();
  }

  async function handleWithdraw() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    await onWithdraw(envelope.id, value, note || "Withdrawal");
    setSubmitting(false);
    reset();
  }

  return (
    <Card className={cn("border-gray-200 shadow-none", envelope.isOverBudget && "border-red-200")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn("h-3 w-3 rounded-full shrink-0 mt-0.5", envelope.colorClass)} />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{envelope.name}</p>
              {envelope.linkedCategory ? (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <LuLink className="h-3 w-3" />
                  Auto-tracked from Expenses
                </p>
              ) : (
                <p className="text-xs text-gray-400">Custom envelope</p>
              )}
            </div>
          </div>
          {envelope.isOverBudget && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs shrink-0">
              Over budget
            </Badge>
          )}
        </div>

        <Progress
          value={pct}
          className={cn("h-2 mb-2", envelope.isOverBudget && "[&>div]:bg-red-500")}
        />
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            {formatMoney(envelope.spent, envelope.currency)} of {formatMoney(envelope.allocated, envelope.currency)}
          </p>
          <p className={cn("text-xs font-medium", envelope.isOverBudget ? "text-red-600" : "text-emerald-700")}>
            {envelope.isOverBudget
              ? `${formatMoney(envelope.spent - envelope.allocated, envelope.currency)} over`
              : `${formatMoney(envelope.remaining, envelope.currency)} left`}
          </p>
        </div>

        {envelope.linkedCategory && (
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mb-3"
          >
            View {envelope.linkedCategory} expenses
            <LuArrowUpRight className="h-3 w-3" />
          </Link>
        )}

        {mode === "none" && (
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setMode("fund")}>
              <LuPlus className="h-3.5 w-3.5 mr-1.5" />
              Add funds
            </Button>
            {!envelope.linkedCategory && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setMode("withdraw")}>
                <LuMinus className="h-3.5 w-3.5 mr-1.5" />
                Withdraw
              </Button>
            )}
          </div>
        )}

        {mode === "fund" && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              min={0}
              placeholder={`Amount (${envelope.currency})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button size="sm" className="h-8 bg-emerald-700 hover:bg-emerald-800" disabled={submitting} onClick={handleAddFunds}>
              {submitting ? "…" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={reset}>
              Cancel
            </Button>
          </div>
        )}

        {mode === "withdraw" && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder={`Amount (${envelope.currency})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button size="sm" className="h-8 bg-emerald-700 hover:bg-emerald-800" disabled={submitting} onClick={handleWithdraw}>
                {submitting ? "…" : "Confirm"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={reset}>
                Cancel
              </Button>
            </div>
            <Input
              placeholder="What's this withdrawal for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-8"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
