"use client";

// Dashboard widgets whose features have no API yet. They show example data,
// always tagged "Sample data", and follow the Personal / Business toggle:
// client health, billing and invoices are business; goals and budgets personal.
import Link from "next/link";
import { ArrowRight, PiggyBank, Receipt, Repeat, Target, TrendingDown, UserPlus, Wallet } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UpcomingBillButton } from "@/components/BillItem";
import { cn } from "@/lib/utils";
import type { AccountScope } from "@/lib/ledger";

/** Marks a card whose numbers are examples, until its feature is connected. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border border-dashed px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
                className,
              )}
            />
          }
        >
          Sample data
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56 text-xs">
          Example numbers. This card shows your real data once its feature is connected.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const healthConfig = { value: { label: "Client health", color: "var(--chart-income)" } } satisfies ChartConfig;

export function ClientHealthCard() {
  const score = 89;
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Client health</CardTitle>
          <CardDescription>How reliably your clients pay</CardDescription>
        </div>
        <SampleBadge />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col items-center">
          <ChartContainer config={healthConfig} className="h-[130px] w-[130px]">
            <RadialBarChart
              data={[{ name: "health", value: score, fill: "var(--color-value)" }]}
              startAngle={90}
              endAngle={90 - (score / 100) * 360}
              innerRadius={42}
              outerRadius={58}
            >
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) =>
                    viewBox && "cx" in viewBox && "cy" in viewBox ? (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                          {score}%
                        </tspan>
                      </text>
                    ) : null
                  }
                />
              </PolarRadiusAxis>
              <RadialBar dataKey="value" background cornerRadius={999} />
            </RadialBarChart>
          </ChartContainer>
          <Badge variant="secondary" className="mt-2">Excellent</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
          <div>
            <p className="font-medium">Paid on time</p>
            <p className="text-muted-foreground">89% of invoices</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Needs attention</p>
            <p className="text-muted-foreground">1 client</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpcomingBillingCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle>Upcoming billing</CardTitle>
          <CardDescription>Retainers and auto-debits due soon</CardDescription>
        </div>
        <SampleBadge />
      </CardHeader>
      <CardContent className="space-y-1">
        <UpcomingBillButton title="TechCorp retainer" subtitle="Dec 1 · Auto-send" amount="₦150k" status="success" />
        <UpcomingBillButton title="StartupXYZ retainer" subtitle="Dec 5 · Auto-send" amount="₦200k" status="success" />
        <UpcomingBillButton title="Adobe Creative Cloud" subtitle="Dec 1 · Auto-debit" amount="₦15.4k" status="warning" />
        <Link href="/dashboard/recurring" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-1 w-full text-emerald-700")}>
          See recurring billing <ArrowRight className="ml-1 size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

const GOALS = [
  { name: "Emergency fund", progress: 51, current: "₦10k", target: "₦90k" },
  { name: "MacBook Pro", progress: 21, current: "₦20k", target: "₦60k" },
];

export function GoalsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-4 text-emerald-700" aria-hidden />
            Goals
          </CardTitle>
          <CardDescription>What you&apos;re saving towards</CardDescription>
        </div>
        <SampleBadge />
      </CardHeader>
      <CardContent className="space-y-4">
        {GOALS.map((goal) => (
          <div key={goal.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{goal.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {goal.current} of {goal.target} · {goal.progress}%
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={goal.name}
              aria-valuenow={goal.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-emerald-700" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
        <Link href="/dashboard/goals" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full text-emerald-700")}>
          Manage goals <ArrowRight className="ml-1 size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

const ACTIONS = {
  business: [
    { label: "New invoice", href: "/dashboard/invoices/new", Icon: Receipt },
    { label: "New recurring plan", href: "/dashboard/recurring/new", Icon: Repeat },
    { label: "Add a client", href: "/dashboard/clients", Icon: UserPlus },
    { label: "Log an expense", href: "/dashboard/expenses", Icon: TrendingDown },
  ],
  personal: [
    { label: "Add a goal", href: "/dashboard/goals", Icon: PiggyBank },
    { label: "Set a budget", href: "/dashboard/envelopes", Icon: Wallet },
  ],
};

/** Shortcuts into the other screens, matched to the view. */
export function QuickActions({ scope }: { scope: AccountScope }) {
  const actions =
    scope === "personal" ? ACTIONS.personal : scope === "business" ? ACTIONS.business : [...ACTIONS.business, ...ACTIONS.personal];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map(({ label, href, Icon }) => (
          <Link key={href + label} href={href} className={cn(buttonVariants({ variant: "outline" }), "justify-start gap-2")}>
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
