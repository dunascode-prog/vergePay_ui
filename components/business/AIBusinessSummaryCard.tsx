import { ClientProfile } from "@/types/client";
import { RecurringPlan } from "@/types/recurring";
import { CurrencyAmount, RevenueExpensePoint } from "@/types/business";
import { LuSparkles, LuTriangleAlert, LuTrendingUp, LuCircleCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface AIBusinessSummaryCardProps {
  clients: ClientProfile[];
  plans: RecurringPlan[];
  trend: RevenueExpensePoint[];
  cash: CurrencyAmount[];
}

interface Insight {
  tone: "positive" | "warning" | "info";
  text: string;
}

function buildInsights({ clients, plans, trend, cash }: AIBusinessSummaryCardProps): Insight[] {
  const insights: Insight[] = [];

  // Revenue trend: compare the two most recent months.
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  if (last && prev) {
    const change = Math.round(((last.revenueNgn - prev.revenueNgn) / prev.revenueNgn) * 100);
    if (change >= 10) {
      insights.push({
        tone: "positive",
        text: `NGN revenue grew ${change}% from ${prev.month} to ${last.month} — the strongest month in this period.`,
      });
    } else if (change <= -10) {
      insights.push({
        tone: "warning",
        text: `NGN revenue dropped ${Math.abs(change)}% from ${prev.month} to ${last.month} — worth checking whether this is a timing gap or a real slowdown.`,
      });
    }
  }

  // Concentration
  const ngnClients = clients.filter((c) => c.currency === "NGN");
  const ngnTotal = ngnClients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const topClient = [...ngnClients].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  if (topClient && ngnTotal > 0) {
    const share = Math.round((topClient.totalRevenue / ngnTotal) * 100);
    if (share >= 35) {
      insights.push({
        tone: "warning",
        text: `${topClient.name} makes up ${share}% of your NGN revenue. Diversifying beyond your top client would reduce how much a single lost account could hurt cash flow.`,
      });
    }
  }

  // At-risk clients
  const atRisk = clients.filter((c) => c.healthScore < 55);
  if (atRisk.length > 0) {
    insights.push({
      tone: "warning",
      text: `${atRisk.map((c) => c.name).join(" and ")} ${
        atRisk.length === 1 ? "has" : "have"
      } below-average payment reliability — factor that into any new commitments with them.`,
    });
  }

  // Recurring plan health
  const activePlans = plans.filter((p) => p.status === "active");
  const pausedPlans = plans.filter((p) => p.status === "paused");
  if (activePlans.length > 0) {
    insights.push({
      tone: "positive",
      text: `${activePlans.length} recurring plan${activePlans.length === 1 ? "" : "s"} ${
        activePlans.length === 1 ? "is" : "are"
      } actively billing — recurring revenue is generally more predictable than one-off invoices.`,
    });
  }
  if (pausedPlans.length > 0) {
    insights.push({
      tone: "info",
      text: `${pausedPlans.map((p) => p.client.name).join(", ")} ${
        pausedPlans.length === 1 ? "has a" : "have"
      } paused recurring plan${pausedPlans.length === 1 ? "" : "s"} — a check-in could prevent full churn.`,
    });
  }

  // Cash runway (rough estimate: NGN cash / avg NGN monthly expenses)
  const ngnCash = cash.find((c) => c.currency === "NGN")?.amount ?? 0;
  const avgMonthlyExpenses =
    trend.reduce((sum, p) => sum + p.expensesNgn, 0) / Math.max(1, trend.length);
  if (avgMonthlyExpenses > 0) {
    const runwayMonths = Math.round((ngnCash / avgMonthlyExpenses) * 10) / 10;
    if (runwayMonths < 3) {
      insights.push({
        tone: "warning",
        text: `At current spending, your NGN cash on hand covers roughly ${runwayMonths} months of expenses — thinner than the usual 3-month buffer.`,
      });
    }
  }

  return insights;
}

const TONE_CONFIG = {
  positive: { icon: LuTrendingUp, className: "text-emerald-700" },
  warning: { icon: LuTriangleAlert, className: "text-amber-700" },
  info: { icon: LuSparkles, className: "text-blue-700" },
};

export function AIBusinessSummaryCard(props: AIBusinessSummaryCardProps) {
  const insights = buildInsights(props);

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <LuSparkles className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-semibold text-emerald-800">AI business summary</p>
      </div>
      {insights.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-900">
          <LuCircleCheck className="h-4 w-4" />
          Everything looks steady — no urgent signals this period.
        </div>
      ) : (
        <ul className="space-y-2">
          {insights.map((insight, i) => {
            const config = TONE_CONFIG[insight.tone];
            return (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                <config.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.className)} />
                <span>{insight.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
