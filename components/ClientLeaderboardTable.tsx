import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientRevenueShare } from "@/types/analytics";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ClientLeaderboardTableProps {
  clients: ClientRevenueShare[];
}

function healthTone(score: number) {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40";
  if (score >= 55) return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40";
  return "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40";
}

function onTimeTone(rate: number) {
  if (rate >= 85) return "text-emerald-700 dark:text-emerald-400";
  if (rate >= 60) return "text-amber-700 dark:text-amber-400";
  return "text-red-700 dark:text-red-400";
}

export function ClientLeaderboardTable({ clients }: ClientLeaderboardTableProps) {
  const sorted = [...clients].sort((a, b) => b.shareOfTotal - a.shareOfTotal);

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Client leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Share</TableHead>
              <TableHead className="hidden text-right md:table-cell">Avg. collection</TableHead>
              <TableHead className="text-right">On-time rate</TableHead>
              <TableHead className="text-right">Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((client) => (
              <TableRow key={client.clientId}>
                <TableCell className="font-medium text-foreground/90">{client.name}</TableCell>
                <TableCell className="text-right text-foreground/90">
                  {formatMoney(client.revenue, client.currency)}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                  {client.shareOfTotal}%
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                  {client.avgCollectionDays}d
                </TableCell>
                <TableCell className={cn("text-right font-medium", onTimeTone(client.onTimeRate))}>
                  {client.onTimeRate}%
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      healthTone(client.healthScore)
                    )}
                  >
                    {client.healthScore}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
