import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientRevenueShare } from "@/types/analytics";
import { LuClock4 } from "react-icons/lu";

interface CollectionMetricsCardProps {
  clients: ClientRevenueShare[];
}

export function CollectionMetricsCard({ clients }: CollectionMetricsCardProps) {
  const avgDays =
    clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.avgCollectionDays, 0) / clients.length)
      : 0;
  const avgOnTime =
    clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.onTimeRate, 0) / clients.length)
      : 0;
  const fastest = [...clients].sort((a, b) => a.avgCollectionDays - b.avgCollectionDays)[0];
  const slowest = [...clients].sort((a, b) => b.avgCollectionDays - a.avgCollectionDays)[0];

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5">
          <LuClock4 className="h-4 w-4 text-muted-foreground" />
          Collection speed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-2xl font-semibold text-foreground">{clients.length ? `${avgDays}d` : "—"}</p>
            <p className="text-xs text-muted-foreground">Avg. days to pay</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{clients.length ? `${avgOnTime}%` : "—"}</p>
            <p className="text-xs text-muted-foreground">Paid on time</p>
          </div>
        </div>
        {clients.length === 0 && (
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">Shows once clients pay invoices in this period.</p>
        )}
        {fastest && slowest && (
          <div className="space-y-1.5 text-xs border-t border-border pt-3">
            <p className="text-muted-foreground">
              Fastest: <span className="text-foreground/90 font-medium">{fastest.name}</span> ·{" "}
              {fastest.avgCollectionDays}d
            </p>
            <p className="text-muted-foreground">
              Slowest: <span className="text-foreground/90 font-medium">{slowest.name}</span> ·{" "}
              {slowest.avgCollectionDays}d
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
