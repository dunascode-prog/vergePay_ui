import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const summary = [
  {
    label: "Income",
    value: "+₦300,000",
    color: "bg-emerald-500",
    text: "text-emerald-600",
  },
  {
    label: "Expenses",
    value: "-₦140,000",
    color: "bg-red-500",
    text: "text-red-500",
  },
  {
    label: "Invested",
    value: "+₦60,000",
    color: "bg-sky-500",
    text: "text-emerald-600",
  },
  {
    label: "Saved (Goals)",
    value: "+₦45,000",
    color: "bg-violet-500",
    text: "text-emerald-600",
  },
];

export function MonthlySummaryCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          📊 This Month Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {summary.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </div>

            <Badge
              variant="secondary"
              className={`bg-transparent px-0 text-sm font-semibold tabular-nums ${item.text}`}
            >
              {item.value}
            </Badge>
          </div>
        ))}

        <div className="my-3 border-t" />

        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3 dark:bg-emerald-950/30">
          <span className="font-semibold">Net Profit</span>

          <span className="text-lg font-bold tabular-nums text-emerald-600">
            +₦160,000
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
