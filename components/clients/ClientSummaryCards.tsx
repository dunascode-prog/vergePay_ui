import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";
import { totalBy } from "@/lib/clients";
import { moneyByCurrency } from "@/lib/invoicing";
import { ApiClient } from "@/types/invoicing";

/** Four headline numbers over the active client book. */
export function ClientSummaryCards({ clients }: { clients: ApiClient[] }) {
  const vip = clients.filter((c) => c.is_vip).length;
  const paid = totalBy(clients, (c) => c.revenue);
  const owed = totalBy(clients, (c) => c.outstanding);
  const overdue = totalBy(clients, (c) => c.overdue);
  const attention = clients.filter((c) => c.health.label === "at_risk" || c.overdue_count > 0);

  return (
    <StatGrid>
      <StatCard label="Clients" value={String(clients.length)} hint={vip ? `${vip} VIP` : null} />
      <StatCard label="Paid to you, all time" value={<CurrencyAmounts totals={paid} />} />
      <StatCard label="Owed to you" value={<CurrencyAmounts totals={owed} />} hint={overdue.size ? `${moneyByCurrency(overdue)} overdue` : null} tone="warn" />
      <StatCard
        label="Need attention"
        value={String(attention.length)}
        hint={attention.length ? attention.map((c) => c.name).join(", ") : null}
        tone="warn"
      />
    </StatGrid>
  );
}
