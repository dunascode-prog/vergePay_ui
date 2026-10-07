import { CircleCheck, Eye, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessHealth } from "@/lib/business";
import { cn } from "@/lib/utils";

const ICON = { good: CircleCheck, watch: Eye, risk: TriangleAlert };
const TONE = {
  good: "text-emerald-600 dark:text-emerald-400",
  watch: "text-amber-600 dark:text-amber-400",
  risk: "text-red-600 dark:text-red-400",
};

function scoreTone(score: number) {
  return score >= 75 ? "bg-emerald-600 dark:bg-emerald-400" : score >= 50 ? "bg-amber-500" : "bg-red-500";
}

/** The score and every rule behind it, so it's never a mystery number. */
export function BusinessHealthScoreCard({ health }: { health: BusinessHealth }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Business health</CardTitle>
        <CardDescription>From your invoices, cash and money out</CardDescription>
      </CardHeader>
      <CardContent>
        {health.score === null ? (
          <p className="text-sm text-muted-foreground">
            Your score appears once clients have been invoiced or money has moved. Send an invoice to get started.
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{health.score}</p>
              <p className="text-sm text-muted-foreground">/ 100 · {health.label}</p>
            </div>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label="Business health score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={health.score}
            >
              <div className={cn("h-full rounded-full", scoreTone(health.score))} style={{ width: `${health.score}%` }} />
            </div>

            <ul className="mt-4 space-y-3 border-t pt-4">
              {health.factors.map((f) => {
                const Icon = ICON[f.status];
                return (
                  <li key={f.label} className="flex items-start gap-2.5">
                    <Icon className={cn("mt-0.5 size-4 shrink-0", TONE[f.status])} aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">The average of the checks above. It changes as clients pay.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
