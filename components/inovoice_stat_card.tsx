import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InvoiceStatCardProps {
  title: string;
  amount: string;
  subtitle: string;
  color?: "default" | "green" | "orange" | "red";
}

const colors = {
  default: "text-foreground",
  green: "text-emerald-600 dark:text-emerald-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export function InvoiceStatCard({
  title,
  amount,
  subtitle,
  color = "default",
}: InvoiceStatCardProps) {
  return (
    <Card className="rounded-2xl bg-card">
      <CardContent className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>

        <h2 className={cn("text-4xl font-bold tracking-tight", colors[color])}>
          {amount}
        </h2>

        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
