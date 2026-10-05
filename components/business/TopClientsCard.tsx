import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { ClientRevenueShare } from "@/types/analytics";

/** The clients who paid the most this year (each currency ranked on its own). */
export function TopClientsCard({ clients }: { clients: ClientRevenueShare[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top clients</CardTitle>
        <CardDescription>Invoices paid this year</CardDescription>
        <CardAction>
          <Link href="/dashboard/clients" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            All clients <ArrowRight className="size-3.5" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices paid yet this year. Clients appear here as they pay.</p>
        ) : (
          <ul className="space-y-3">
            {clients.map((c) => (
              <li key={c.clientId} className="flex items-center gap-3">
                <ClientAvatar name={c.name} initials={c.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.shareOfTotal}% of {c.currency} revenue · {c.onTimeRate}% on time
                  </p>
                </div>
                <p className="text-sm font-medium whitespace-nowrap tabular-nums">{formatMoney(c.revenue, c.currency)}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
