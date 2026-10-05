import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { clientInsights } from "@/lib/clients";
import { cn } from "@/lib/utils";
import { ApiClient } from "@/types/invoicing";

const TONE = {
  warning: { icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400" },
  positive: { icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
  info: { icon: Info, className: "text-sky-600 dark:text-sky-400" },
};

/** What's worth knowing about the client book, from their invoices. */
export function ClientPortfolioAISummary({ clients }: { clients: ApiClient[] }) {
  const insights = clientInsights(clients);
  if (!clients.length) return null;
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="mb-2.5 text-sm font-medium">
        Client insights <span className="font-normal text-muted-foreground">· from your invoices</span>
      </h2>
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing needs your attention: no overdue invoices, and no one client carrying most of your revenue.</p>
      ) : (
        <ul className="space-y-2">
          {insights.map((insight, i) => {
            const tone = TONE[insight.tone];
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <tone.icon className={cn("mt-0.5 size-4 shrink-0", tone.className)} aria-hidden />
                <span>{insight.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
