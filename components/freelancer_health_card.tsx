"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    label: "Income stability",
    value: 60,
    color: "bg-emerald-600",
  },
  {
    label: "Client concentration",
    value: 69,
    color: "bg-emerald-500",
  },
  {
    label: "Invoice health",
    value: 87,
    color: "bg-emerald-600",
  },
  {
    label: "Cash runway",
    value: 59,
    color: "bg-amber-600",
  },
];

function CircularScore({ score }: { score: number }) {
  const radius = 42;
  const stroke = 8;

  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg className="-rotate-90" width="112" height="112">
        <circle
          cx="56"
          cy="56"
          r={normalizedRadius}
          fill="none"
          stroke="#ECECEC"
          strokeWidth={stroke}
        />

        <circle
          cx="56"
          cy="56"
          r={normalizedRadius}
          fill="none"
          stroke="#C07A14"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight">{score}</span>

        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs text-muted-foreground">{label}</span>

        <span className="text-xs text-muted-foreground">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`${color} h-full rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function FreelancerHealthCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Freelancer Health Score
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <CircularScore score={69} />

          <div className="flex-1 space-y-4">
            <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 hover:bg-amber-100">
              Fair
            </Badge>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Weighted from income stability, client concentration, invoice
              health and cash runway.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
