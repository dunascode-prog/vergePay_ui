"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Sparkles, X } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dismissRecommendation, listRecommendations } from "@/services/assistant";
import { Recommendation } from "@/types/assistant";
import { AssistantActionButton } from "./AssistantActionButton";
import { useAssistant } from "./AssistantProvider";

const TONE_DOT: Record<Recommendation["tone"], string> = {
  urgent: "bg-red-500",
  warning: "bg-amber-500",
  tip: "bg-emerald-500",
  info: "bg-sky-500",
};

/**
 * Home: "What to do next", the top few recommendations (decided by VergePay's
 * rules from the customer's data), each with one action and "not now".
 */
export function NextStepsCard() {
  const { dataVersion } = useAppData();
  const { openAssistant } = useAssistant();
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    listRecommendations(4)
      .then((r) => {
        if (!live) return;
        setRecs(r.data);
        setFailed(false);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [dataVersion, attempt]);

  const dismiss = async (key: string) => {
    setRecs((list) => (list ?? []).filter((r) => r.key !== key));
    await dismissRecommendation(key).catch(() => {});
    reload(); // the next one moves up
  };

  return (
    <section aria-labelledby="next-steps" className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 id="next-steps" className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4 text-emerald-600" aria-hidden />
          What to do next
        </h2>
        <Button variant="ghost" size="sm" className="h-8 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" onClick={() => openAssistant()}>
          Ask VergePay
        </Button>
      </div>

      <div className="px-5 pb-5 pt-3">
        {failed ? (
          <p className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your next steps.{" "}
            <button type="button" className="font-medium text-emerald-700 hover:underline" onClick={reload}>
              Try again
            </button>
          </p>
        ) : recs === null ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
            <CircleCheck className="size-5 shrink-0 text-emerald-600" aria-hidden />
            You&apos;re all caught up. Nothing needs your attention right now.
          </div>
        ) : (
          <ul className="divide-y">
            {recs.map((r, n) => (
              <li key={r.key} className="group flex gap-3 py-3.5 first:pt-1 last:pb-0">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[r.tone])} aria-hidden />
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-medium leading-snug">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.body}</p>
                  </div>
                  <AssistantActionButton action={r.action} primary={n === 0} onDone={reload} />
                </div>
                <button
                  type="button"
                  onClick={() => void dismiss(r.key)}
                  className="h-7 shrink-0 rounded-md px-1.5 text-muted-foreground/70 hover:bg-muted hover:text-foreground"
                  aria-label={`Not now: ${r.title}`}
                  title="Not now (hide for a week)"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
