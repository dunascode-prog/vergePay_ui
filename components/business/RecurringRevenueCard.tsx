import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatDay, money, moneyByCurrency } from "@/lib/invoicing";
import { monthlyRecurring } from "@/lib/recurring";
import { nextBilling } from "@/lib/business";
import { ApiRecurringPlan } from "@/types/recurring";

/** Monthly recurring revenue of the plans paid into the wallets in view. */
export function RecurringRevenueCard({ plans }: { plans: ApiRecurringPlan[] }) {
  const mrr = monthlyRecurring(plans);
  const active = plans.filter((p) => p.plan_status === "active").length;
  const paused = plans.filter((p) => p.plan_status === "paused").length;
  const next = nextBilling(plans);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recurring revenue</CardTitle>
        <CardDescription>A month of your active plans</CardDescription>
        <CardAction>
          <Link href="/dashboard/recurring" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Plans <ArrowRight className="size-3.5" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {active === 0 && paused === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recurring plans yet.{" "}
            <Link href="/dashboard/recurring/new" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Bill a client on a schedule
            </Link>
          </p>
        ) : (
          <>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{mrr.size ? moneyByCurrency(mrr) : "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {active} active{paused ? <span className="text-amber-700 dark:text-amber-300"> · {paused} paused</span> : null}
            </p>
            {next && (
              <p className="mt-3 border-t pt-3 text-sm">
                <span className="text-muted-foreground">Next invoice </span>
                {formatDay(next.next_billing_date!, false)} · {next.client.name}, {money(next.amount_minor, next.currency_code)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
