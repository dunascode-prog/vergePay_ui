import { useId } from "react";
import { cn } from "@/lib/utils";
import { Trend } from "@/lib/trends";

/**
 * One headline number. Every summary row in the app uses it, so they all
 * look the same: a quiet label, the number, an optional trend (a 6-month
 * sparkline and the change over 30 days), and a hint only when it adds
 * something (a count, a warning), never one that repeats the label.
 */
export function StatCard({
  label,
  value,
  hint,
  tone,
  trend,
  className,
}: {
  label: string;
  /** A short string, or a node such as <CurrencyAmounts>. */
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** "warn" for amber (needs a look), "bad" for red (overdue money). */
  tone?: "warn" | "bad";
  trend?: Trend | null;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-xl border bg-card p-4 sm:p-5", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2">
        {typeof value === "string" ? (
          <p className="truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl" title={value}>
            {value}
          </p>
        ) : (
          value
        )}
      </div>
      {hint && (
        <p
          className={cn(
            "mt-1.5 truncate text-xs",
            tone === "warn" ? "text-amber-700 dark:text-amber-300" : tone === "bad" ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
          )}
          title={typeof hint === "string" ? hint : undefined}
        >
          {hint}
        </p>
      )}
      {trend && <TrendRow trend={trend} />}
    </div>
  );
}

/** ▲ 12% (green when that's good news), and the sparkline beside it. */
function TrendRow({ trend }: { trend: Trend }) {
  const { change, goodWhen } = trend;
  const rounded = change === null ? null : Math.round(change * 100);
  const direction = rounded === null || rounded === 0 ? "flat" : rounded > 0 ? "up" : "down";
  const mood = direction === "flat" ? "neutral" : direction === goodWhen ? "good" : "bad";
  const tones = {
    good: "text-emerald-700 dark:text-emerald-400",
    bad: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };
  const said =
    rounded === null
      ? "No figure for the 30 days before to compare with"
      : `${direction === "flat" ? "No change" : `${direction === "up" ? "Up" : "Down"} ${Math.abs(rounded)}%`} on the 30 days before`;

  return (
    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
      <p className={cn("flex items-baseline gap-1 whitespace-nowrap text-xs font-medium tabular-nums", tones[mood])} title={said}>
        {rounded !== null && (
          <>
            <span aria-hidden>{direction === "up" ? "▲" : direction === "down" ? "▼" : "–"}</span>
            {Math.abs(rounded) > 999 ? ">999" : Math.abs(rounded)}%
            <span className="hidden font-normal text-muted-foreground sm:inline">vs prior 30 days</span>
          </>
        )}
        <span className="sr-only">{said}</span>
      </p>
      <Sparkline points={trend.points} mood={mood} />
    </div>
  );
}

/** A small line of the last 6 months with a soft fill under it. Decorative: the numbers are in the text. */
function Sparkline({ points, mood }: { points: number[]; mood: "good" | "bad" | "neutral" }) {
  const id = useId();
  const w = 84;
  const h = 28;
  const pad = 2;
  const min = Math.min(...points, 0);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [pad + (i * (w - pad * 2)) / Math.max(points.length - 1, 1), h - pad - ((p - min) / span) * (h - pad * 2)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)} ${h} L${xy[0][0].toFixed(1)} ${h} Z`;
  const stroke = mood === "bad" ? "stroke-red-500" : mood === "good" ? "stroke-emerald-600" : "stroke-muted-foreground/60";
  const fill = mood === "bad" ? "text-red-500" : mood === "good" ? "text-emerald-600" : "text-muted-foreground";
  const [lx, ly] = xy[xy.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className={fill} />
      <path d={line} fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={stroke} />
      <circle cx={lx} cy={ly} r={2.25} className={cn(fill, "fill-current")} />
    </svg>
  );
}

/** The row the cards sit in: two across on phones, more on wider screens. */
export function StatGrid({ children, columns = 4 }: { children: React.ReactNode; columns?: 3 | 4 }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>{children}</div>;
}
