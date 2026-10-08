import { AlertTriangle, HandCoins, Star, Users } from "lucide-react";
import { totalBy } from "@/lib/clients";
import { moneyByCurrency } from "@/lib/invoicing";
import { ApiClient } from "@/types/invoicing";
import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";

/** Four headline numbers over the active client book. */
export function ClientSummaryCards({ clients }: { clients: ApiClient[] }) {
  const vip = clients.filter((c) => c.is_vip).length;
  const paid = totalBy(clients, (c) => c.revenue);
  const owed = totalBy(clients, (c) => c.outstanding);
  const overdue = totalBy(clients, (c) => c.overdue);
  const attention = clients.filter((c) => c.health.label === "at_risk" || c.overdue_count > 0);

  const tiles = [
    { label: "Clients", value: String(clients.length), sub: vip ? `${vip} marked VIP` : "None marked VIP yet", icon: Users },
    { label: "Paid to you, all time", value: <CurrencyAmounts totals={paid} className="mt-1.5" />, sub: "Invoices your clients have paid", icon: Star },
    {
      label: "Owed to you",
      value: <CurrencyAmounts totals={owed} className="mt-1.5" />,
      sub: overdue.size ? `${moneyByCurrency(overdue)} of it overdue` : "Nothing overdue",
      icon: HandCoins,
      warn: overdue.size > 0,
    },
    {
      label: "Need attention",
      value: String(attention.length),
      sub: attention.length ? attention.map((c) => c.name).join(", ") : "Everyone's paying on time",
      icon: AlertTriangle,
      warn: attention.length > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <t.icon className="size-4 text-muted-foreground" aria-hidden />
          </div>
          {typeof t.value === "string" ? <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums">{t.value}</p> : t.value}
          <p className={t.warn ? "mt-0.5 truncate text-xs text-amber-700 dark:text-amber-300" : "mt-0.5 truncate text-xs text-muted-foreground"} title={t.sub}>
            {t.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
