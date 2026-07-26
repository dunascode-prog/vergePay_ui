"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  Badge,
  Dot,
  FileText,
  Plus,
  ReceiptCent,
  Send,
} from "lucide-react";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Label,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { UpcomingBillButton } from "@/components/BillItem";
import Metric from "@/components/metric";
import { Sparkline } from "@/components/sparkline";

export const description = "A donut chart with text";
const healthScore = 96;

const chartData1 = [
  {
    name: "health",
    value: healthScore,
    fill: "var(--chart-2)",
  },
];

const chartConfig1 = {
  value: {
    label: "Health",
  },
} satisfies ChartConfig;

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
export default function Dashboard() {
  const healthScore = 89;

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
    <div className="bg-sidebar-border2">
      <div className="grid grid-col-1 md:grid-cols-9 lg:grid-cols-12 2xl:grid-cols-12 gap-2 px-4 pt-4">
        <div className="col-span-1 md:col-span-3 lg:col-span-12 2xl:col-span-12">
          <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Key financial metrics for this month
                </CardDescription>
              </div>

              <Badge variant="secondary">This Month</Badge>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                  chart={
                    <Sparkline data={expenseData} color="var(--chart-5)" />
                  }
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
                  chart={
                    <Sparkline data={investmentData} color="var(--chart-3)" />
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 rounded">
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

                <div className="flex items-center">
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
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 row-span-2 2xl:col-span-3">
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
              <div className="grid grid-cols-3 gap-2">
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
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 row-span-2 2xl:col-span-3">
          {/* <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-base font-semibold">
                Client Health Score
              </CardTitle>
              <CardDescription>
                Based on recurring payment behaviour
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="score"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
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
                                className="fill-foreground text-4xl font-bold"
                              >
                                {healthScore}
                              </tspan>

                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Health Score
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                Excellent portfolio health
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>

              <div className="text-center leading-none text-muted-foreground">
                89% of recurring invoices are paid on time. One client currently
                requires attention before the next billing cycle.
              </div>
            </CardFooter>
          </Card> */}
          <Card>
            <CardContent className="flex items-center justify-between px-4 py-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Client Health</h3>

                  <p className="text-sm text-muted-foreground">
                    Overall recurring portfolio
                  </p>
                </div>

                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">
                      {healthScore}
                    </span>

                    <Badge variant="secondary" className="mb-1">
                      Excellent
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Based on payment reliability
                  </p>
                </div>

                <div className="flex gap-5 text-sm">
                  <div>
                    <p className="font-medium">89%</p>
                    <p className="text-muted-foreground">Paid on time</p>
                  </div>

                  <div>
                    <p className="font-medium">1</p>
                    <p className="text-muted-foreground">Needs attention</p>
                  </div>
                </div>
              </div>

              <ChartContainer
                config={chartConfig}
                className="h-[120px] w-[120px]"
              >
                <RadialBarChart
                  data={chartData1}
                  startAngle={90}
                  endAngle={90 - (healthScore / 100) * 360}
                  innerRadius={40}
                  outerRadius={55}
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
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3">
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
          </Card>{" "}
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3">
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
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          6
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          7
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          8
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          9
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          10
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3 2xl:col-span-3 bg-border">
          11
        </div>
      </div>
    </div>
  );
}
