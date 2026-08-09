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
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <LuClock4 className="h-4 w-4 text-gray-400" />
          Collection speed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-2xl font-semibold text-gray-900">{avgDays}d</p>
            <p className="text-xs text-gray-400">Avg. days to pay</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{avgOnTime}%</p>
            <p className="text-xs text-gray-400">Paid on time</p>
          </div>
        </div>
        {fastest && slowest && (
          <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
            <p className="text-gray-500">
              Fastest: <span className="text-gray-800 font-medium">{fastest.name}</span> ·{" "}
              {fastest.avgCollectionDays}d
            </p>
            <p className="text-gray-500">
              Slowest: <span className="text-gray-800 font-medium">{slowest.name}</span> ·{" "}
              {slowest.avgCollectionDays}d
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
