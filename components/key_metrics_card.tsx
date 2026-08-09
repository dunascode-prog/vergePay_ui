import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const metrics = [
  {
    label: "Save rate",
    value: "53.3%",
    className: "text-foreground",
  },
  {
    label: "Investment rate",
    value: "20.0%",
    className: "text-emerald-600",
  },
  {
    label: "Largest expense",
    value: "Rent (64.3%)",
    className: "text-foreground font-medium",
  },
  {
    label: "Transactions",
    value: "38 this month",
    className: "text-foreground",
  },
];

export function KeyMetricsCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Key Metrics</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <Table>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.label} className="hover:bg-transparent">
                <TableCell className="py-4 pl-0 text-sm text-muted-foreground">
                  {metric.label}
                </TableCell>

                <TableCell
                  className={`py-4 pr-0 text-right font-semibold tabular-nums ${metric.className}`}
                >
                  {metric.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
