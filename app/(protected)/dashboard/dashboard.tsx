"use client";

import { Button } from "@/components/ui/button";

import {
  ArrowLeftRight,
  ArrowRight,
  Dot,
  FileText,
  Plus,
  Receipt,
  Repeat,
  Send,
  Target,
  TrendingDown,
  UserPlus,
} from "lucide-react";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { UpcomingBillButton } from "@/components/BillItem";
import Metric from "@/components/metric";
import { Sparkline } from "@/components/sparkline";
import AiSummaryCard from "@/components/ai_component_card";
import { MonthlyCashFlow } from "@/components/monthly_cash_flow";
import { AIEnvelopeSummary } from "@/components/ai_envelope_summary";
import RecentTransactions from "@/components/notification_table";
import OutstandingInvoiceCard from "@/components/invoice_card";
import { Badge } from "@/components/ui/badge";

export const description = "A donut chart with text";

const chartConfig = {
  score: {
    label: "Clients",
  },
  Excellent: {
    label: "Excellent",
    color: "var(--chart-1)",
  },
  Stable: {
    label: "Stable",
    color: "var(--chart-2)",
  },
  "At Risk": {
    label: "At Risk",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const incomeData = [
  { value: 120 },
  { value: 145 },
  { value: 170 },
  { value: 195 },
  { value: 230 },
  { value: 300 },
];
const expenseData = [
  { value: 95 },
  { value: 130 },
  { value: 105 },
  { value: 145 },
  { value: 120 },
  { value: 140 },
];
const netData = [
  { value: 40 },
  { value: 55 },
  { value: 75 },
  { value: 100 },
  { value: 125 },
  { value: 160 },
];

const investmentData = [
  { value: 11 },
  { value: 14 },
  { value: 13 },
  { value: 17 },
  { value: 18 },
  { value: 20 },
];
const envelopes = [
  {
    name: "Emergency Fund",
    progress: 51,
    current: "₦10k",
    target: "₦90k",
  },
  {
    name: "Macbook Pro",
    progress: 21,
    current: "₦20k",
    target: "₦60k",
  },
];

const buttonsTxt = [
  { txt: "New Invoice", Icon: Receipt },
  { txt: "New Recurring Plan", Icon: Repeat },
  { txt: "Add Client", Icon: UserPlus },
  { txt: "Log Expense", Icon: TrendingDown },
];

export default function Dashboard() {
  const healthScore = 89;
  const chartData1 = [
    {
      name: "health",
      value: healthScore,
      fill: "var(--chart-2)",
    },
  ];

  // useEffect(() => {
  //   async function verifySession() {
  //     try {
  //       const response = await apiFetch("/v1/dashboard/test", {
  //         method: "GET",
  //       });

  //       if (!response.ok) {
  //         throw new Error();
  //       }

  //       console.log(await response.json());
  //     } catch {
  //       router.replace("/signin");
  //     }
  //   }

  //   verifySession();
  // });
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-5 lg:gap-6">
      {/* Performance overview */}
      <Card>
        <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Key financial metrics for this month
            </CardDescription>
          </div>

          <Badge variant="secondary" className="w-fit">
            This Month
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <Metric
              title="Income"
              value="₦300k"
              change="+67% vs Oct"
              positive
              chart={<Sparkline data={incomeData} color="var(--chart-1)" />}
            />

            <Metric
              title="Spent"
              value="₦140k"
              change="-12% vs Oct"
              chart={<Sparkline data={expenseData} color="var(--chart-5)" />}
            />

            <Metric
              title="Net"
              value="+₦160k"
              change="Healthy cash flow"
              positive
              chart={<Sparkline data={netData} color="var(--chart-2)" />}
            />

            <Metric
              title="Investment Rate"
              value="20%"
              change="Target achieved"
              positive
              chart={<Sparkline data={investmentData} color="var(--chart-3)" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main content + side rail */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:items-start lg:gap-6">
        {/* Main column */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-2">
          {/* Wallets + client health */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Personal Wallet
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Available Balance
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight tabular-nums">
                    $1,125
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Account: 110324567</span>
                      <Dot className="size-4" />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button className="w-full">
                    <Plus />
                    Add
                  </Button>

                  <Button className="w-full" variant="secondary">
                    <Send />
                    Send
                  </Button>

                  <Button className="w-full" variant="outline">
                    <ArrowLeftRight />
                    Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Business Wallet
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Available Balance
                  </p>

                  <h2 className="text-3xl font-bold tracking-tight tabular-nums">
                    $5,225
                  </h2>

                  <div className="flex items-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Seun Design Studio</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="w-full">
                    <FileText />
                    Invoice
                  </Button>

                  <Button className="w-full" variant="secondary">
                    <Plus />
                    Expense
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 xl:col-span-1">
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="text-base font-semibold">Client Health</h3>

                  <p className="text-sm text-muted-foreground">
                    Overall recurring portfolio
                  </p>
                </div>

                {/* Center the chart */}
                <div className="flex flex-col items-center">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[130px] w-[130px]"
                  >
                    <RadialBarChart
                      data={chartData1}
                      startAngle={90}
                      endAngle={90 - (healthScore / 100) * 360}
                      innerRadius={42}
                      outerRadius={58}
                    >
                      <PolarRadiusAxis
                        tick={false}
                        tickLine={false}
                        axisLine={false}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-xl font-bold"
                                  >
                                    {healthScore}%
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>

                      <RadialBar dataKey="value" background cornerRadius={999} />
                    </RadialBarChart>
                  </ChartContainer>

                  <Badge variant="secondary" className="mt-2">
                    Excellent
                  </Badge>

                  <p className="mt-1 text-center text-sm text-muted-foreground">
                    Based on payment reliability
                  </p>
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
          </div>

          <AiSummaryCard />

          {/* Cash flow + envelope summary */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
            <MonthlyCashFlow />
            <AIEnvelopeSummary />
          </div>
        </div>

        {/* Side rail */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Upcoming Billing</CardTitle>
              <Button variant="ghost" size="sm" className="h-auto p-0">
                See all
              </Button>
            </CardHeader>

            <CardContent className="space-y-2">
              <UpcomingBillButton
                title="TechCorp Retainer"
                subtitle="Dec 1 • Auto-send"
                amount="₦150k"
                status="success"
              />

              <UpcomingBillButton
                title="StartupXYZ Retainer"
                subtitle="Dec 5 • Auto-send"
                amount="₦200k"
                status="success"
              />

              <UpcomingBillButton
                title="Adobe Creative Cloud"
                subtitle="Dec 1 • Auto-debit"
                amount="₦15.4k"
                status="warning"
              />
            </CardContent>
          </Card>

          <OutstandingInvoiceCard />

          <Card className="h-full rounded-2xl bg-card shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-primary" />
                    Financial Goals
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Manage all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {envelopes.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-1 justify-between"
                >
                  <div className="flex flex-row items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>

                    <div className="flex flex-row gap-1 text-xs text-muted-foreground">
                      <span>{item.progress}%</span>

                      <span>
                        {item.current}/{item.target}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.progress === 100
                          ? "bg-emerald-500"
                          : item.progress > 50
                            ? "bg-primary"
                            : item.progress > 0
                              ? "bg-slate-500"
                              : "bg-red-300"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col space-y-2">
              {buttonsTxt.map(({ Icon, txt }) => (
                <Button
                  key={txt}
                  variant="outline"
                  className="flex justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{txt}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <RecentTransactions />
    </div>
  );
}
