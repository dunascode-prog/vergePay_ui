import { ClientProfile } from "@/types/client";
import { formatMoneyByCurrency, sumByCurrency } from "@/lib/format";
import { LuSparkles, LuTriangleAlert, LuTrendingUp } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ClientPortfolioAISummaryProps {
  clients: ClientProfile[];
}

interface Insight {
  tone: "positive" | "warning" | "info";
  text: string;
}

function buildInsights(clients: ClientProfile[]): Insight[] {
  const insights: Insight[] = [];

  // Concentration: does one client dominate revenue within its own currency?
  const ngnClients = clients.filter((c) => c.currency === "NGN");
  const ngnTotal = sumByCurrency(
    ngnClients.map((c) => ({ amount: c.totalRevenue, currency: c.currency }))
  ).NGN ?? 0;
  const topNgnClient = [...ngnClients].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  if (topNgnClient && ngnTotal > 0) {
    const share = Math.round((topNgnClient.totalRevenue / ngnTotal) * 100);
    if (share >= 35) {
      insights.push({
        tone: "warning",
        text: `${topNgnClient.name} makes up ${share}% of your NGN revenue — losing this client would meaningfully affect cash flow.`,
      });
    }
  }

  const atRisk = clients.filter((c) => c.healthScore < 55);
  if (atRisk.length > 0) {
    insights.push({
      tone: "warning",
      text: `${atRisk.map((c) => c.name).join(" and ")} ${
        atRisk.length === 1 ? "has" : "have"
      } below-average payment reliability — worth a check-in before taking on more work for them.`,
    });
  }

  const rising = clients.filter((c) => c.isNew === false && c.aiNote.toLowerCase().includes("tripled"));
  if (rising.length > 0) {
    insights.push({
      tone: "positive",
      text: `${rising.map((c) => c.name).join(", ")} is a fast-growing relationship worth investing more time in.`,
    });
  }

  const newClients = clients.filter((c) => c.isNew);
  if (newClients.length > 0) {
    insights.push({
      tone: "info",
      text: `${newClients.map((c) => c.name).join(", ")} ${
        newClients.length === 1 ? "is a" : "are"
      } new client${newClients.length === 1 ? "" : "s"} with no payment history yet — health scores will sharpen after their first invoice cycle.`,
    });
  }

  return insights;
}

const TONE_CONFIG = {
  positive: { icon: LuTrendingUp, className: "text-emerald-700" },
  warning: { icon: LuTriangleAlert, className: "text-amber-700" },
  info: { icon: LuSparkles, className: "text-blue-700" },
};

export function ClientPortfolioAISummary({ clients }: ClientPortfolioAISummaryProps) {
  const insights = buildInsights(clients);

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <LuSparkles className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-semibold text-emerald-800">AI client portfolio summary</p>
      </div>
      {insights.length === 0 ? (
        <p className="text-sm text-emerald-900">
          Nothing urgent — your client base looks healthy and reasonably diversified.
        </p>
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
