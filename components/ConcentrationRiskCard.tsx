"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientRevenueShare } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface ConcentrationRiskCardProps {
  clients: ClientRevenueShare[];
  currency: "NGN" | "USD";
  className?: string;
}

function riskLevel(topShare: number): { label: string; tone: string } {
  if (topShare >= 40)
    return { label: "Concentrated", tone: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40" };
  if (topShare >= 25)
    return { label: "Moderate", tone: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" };
  return { label: "Diversified", tone: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" };
}

const BAR_COLORS = ["bg-emerald-600", "bg-emerald-400", "bg-amber-400", "bg-slate-400", "bg-slate-300"];

export function ConcentrationRiskCard({ clients, currency, className }: ConcentrationRiskCardProps) {
  const inCurrency = clients
    .filter((c) => c.currency === currency)
    .sort((a, b) => b.shareOfTotal - a.shareOfTotal);

  const topShare = inCurrency[0]?.shareOfTotal ?? 0;
  const risk = riskLevel(topShare);

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-foreground">
          Client concentration ({currency})
        </CardTitle>
        <span className={cn("text-xs font-medium rounded-full px-2 py-0.5", risk.tone)}>
          {risk.label}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted mb-4">
          {inCurrency.map((client, i) => (
            <div
              key={client.clientId}
              className={cn("h-full", BAR_COLORS[i] ?? "bg-slate-300")}
              style={{ width: `${client.shareOfTotal}%` }}
              title={`${client.name}: ${client.shareOfTotal}%`}
            />
          ))}
        </div>
        <div className="space-y-2">
          {inCurrency.map((client, i) => (
            <div key={client.clientId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground/90">
                <span className={cn("h-2 w-2 rounded-full", BAR_COLORS[i] ?? "bg-slate-300")} />
                {client.name}
              </span>
              <span className="text-muted-foreground">{client.shareOfTotal}%</span>
            </div>
          ))}
        </div>
        {topShare >= 40 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-3 pt-3 border-t border-border">
            {inCurrency[0].name} alone makes up {topShare}% of {currency} revenue — losing this
            client would materially affect cash flow.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
