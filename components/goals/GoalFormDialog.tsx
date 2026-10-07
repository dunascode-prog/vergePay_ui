"use client";

import { useState } from "react";
import { toMinor } from "@/components/money/MoneyInput";
import { ErrorNote, StepHeader } from "@/components/money/parts";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { GOAL_CATEGORIES, GOAL_CATEGORY_LABEL } from "@/lib/goals";
import { groupDigits, isoDay } from "@/lib/invoicing";
import { cn } from "@/lib/utils";
import { createGoal, updateGoal } from "@/services/goals";
import { Goal, GoalCategory } from "@/types/goal";

const CURRENCIES = ["NGN", "USD"];

type Errors = Partial<Record<"name" | "target" | "date" | "currency", string>>;

const majorText = (minor: number) => groupDigits(String(minor / 100));

/**
 * Makes a goal, or edits one when `goal` is given. A goal's currency is
 * fixed once it's made: it's the currency of the account holding its money.
 */
export function GoalFormDialog({ goal, trigger, onSaved }: { goal?: Goal; trigger: React.ReactElement; onSaved: (goal: Goal) => void }) {
  const editing = !!goal;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GoalCategory>("emergency_fund");
  const [currency, setCurrency] = useState("NGN");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) return;
    setName(goal?.name ?? "");
    setCategory(goal?.category ?? "emergency_fund");
    setCurrency(goal?.currency_code ?? "NGN");
    setTarget(goal ? majorText(goal.target_minor) : "");
    setDate(goal?.target_date ?? "");
    setErrors({});
    setFormError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetMinor = toMinor(target);
    const e: Errors = {};
    if (!name.trim()) e.name = "Give the goal a name.";
    if (!targetMinor) e.target = "Enter how much you want to save.";
    if (!date) e.date = "Pick the date you want to reach it by.";
    else if (date < isoDay()) e.date = "The date can't be in the past.";
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const saved = editing
        ? await updateGoal(goal.goal_id, { name: name.trim(), category, target_minor: targetMinor!, target_date: date })
        : await createGoal({ name: name.trim(), category, target_minor: targetMinor!, currency_code: currency, target_date: date });
      onSaved(saved);
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const f = err.fieldErrors();
        setErrors({ name: f.name, target: f.target_minor, date: f.target_date, currency: f.currency_code });
      }
      setFormError(err instanceof ApiError ? err.message : "Couldn't save the goal. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <StepHeader
            title={editing ? "Edit goal" : "New savings goal"}
            subtitle={editing ? undefined : "The money you save sits in its own pot, apart from your wallet. You can withdraw it any time."}
          />

          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              maxLength={80}
              placeholder="e.g. Emergency fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              className="h-11"
              autoFocus={!editing}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Category</legend>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "h-9 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground",
                    category === c && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  )}
                >
                  {GOAL_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Target</Label>
              <Input
                id="goal-target"
                inputMode="decimal"
                placeholder="0.00"
                value={target}
                onChange={(e) => setTarget(groupDigits(e.target.value))}
                aria-invalid={!!errors.target}
                className="h-11 tabular-nums"
              />
            </div>
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Currency</legend>
              <div className="flex gap-1.5">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={editing}
                    aria-pressed={currency === c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "h-11 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
                      currency === c && "border-emerald-700 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          {(errors.target || errors.currency) && <p className="-mt-3 text-xs text-destructive">{errors.target ?? errors.currency}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="goal-date">Reach it by</Label>
            <Input
              id="goal-date"
              type="date"
              min={isoDay()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!errors.date}
              className="h-11"
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {formError && <ErrorNote>{formError}</ErrorNote>}
          <Button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
