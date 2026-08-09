"use client";

import { AlertTriangle, Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const colors = ["bg-chart-2", "bg-chart-1", "bg-chart-2", "bg-chart-1"];

const clients = [
  {
    name: "Northbridge Media",
    amount: "₦126,000",
    percentage: 42,
    color: colors[0],
  },
  {
    name: "Lexi Studios",
    amount: "₦72,000",
    percentage: 24,
    color: colors[1],
  },
  {
    name: "CloudNine Retail",
    amount: "₦54,000",
    percentage: 18,
    color: colors[2],
  },
  {
    name: "Other clients (5)",
    amount: "₦48,000",
    percentage: 16,
    color: colors[2],
  },
];

function ClientRow({
  name,
  amount,
  percentage,
  color,
}: (typeof clients)[number]) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>

        <span className="text-muted-foreground">
          {amount} · <span className="font-semibold">{percentage}%</span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`${color} h-full rounded-full transition-all duration-700`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export function ClientConcentrationCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Income by Client — Concentration Risk
            </CardTitle>

            <p className="mt-4 text-sm text-muted-foreground">
              Top client share of income
            </p>
          </div>

          <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
            42% • Concentrated
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {clients.map((client) => (
          <ClientRow key={client.name} {...client} />
        ))}

        <Alert className="border-none bg-muted/50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />

          <AlertDescription className="leading-6">
            <strong>Northbridge Media</strong> alone accounts for{" "}
            <strong>42%</strong> of your income. Losing this client could reduce
            monthly revenue by almost half. Consider growing one or two
            mid-sized accounts to reduce concentration risk.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
