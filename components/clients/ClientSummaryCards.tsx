import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";
import { totalBy } from "@/lib/clients";
import { moneyByCurrency } from "@/lib/invoicing";
import { balanceTrend, clientsAt, invoiceBalanceAt, mainCurrency, paidByAt, unpaidAt } from "@/lib/trends";
import { ApiClient, ApiInvoice } from "@/types/invoicing";

/** Four headline numbers over the active client book. */
export function ClientSummaryCards({
  clients,
  allClients,
  invoices,
}: {
  clients: ApiClient[];
  /** Archived ones too, to know who was on the books before. */
  allClients: ApiClient[];
  /** The issued invoices, for the trends (null while loading: no trends yet). */
  invoices: ApiInvoice[] | null;
}) {
  const vip = clients.filter((c) => c.is_vip).length;
  const paid = totalBy(clients, (c) => c.revenue);
  const owed = totalBy(clients, (c) => c.outstanding);
  const overdue = totalBy(clients, (c) => c.overdue);
  const attention = clients.filter((c) => c.health.label === "at_risk" || c.overdue_count > 0);
  // only invoices to the clients counted here, so the line ends at the card's number
  const ids = new Set(clients.map((c) => c.client_id));
  const theirs = (invoices ?? []).filter((i) => i.client && ids.has(i.client.client_id));
  const trends = invoices && {
    clients: balanceTrend(clientsAt(allClients), "up"),
    paid: balanceTrend(paidByAt(theirs, mainCurrency(paid)), "up"),
    owed: balanceTrend(invoiceBalanceAt(theirs, mainCurrency(owed), unpaidAt), "down"),
  };

  return (
    <StatGrid>
      <StatCard label="Clients" trend={trends?.clients} value={String(clients.length)} hint={vip ? `${vip} VIP` : null} />
      <StatCard label="Paid to you, all time" trend={trends?.paid} value={<CurrencyAmounts totals={paid} />} />
      <StatCard label="Owed to you" trend={trends?.owed} value={<CurrencyAmounts totals={owed} />} hint={overdue.size ? `${moneyByCurrency(overdue)} overdue` : null} tone="warn" />
      <StatCard
        label="Need attention"
        value={String(attention.length)}
        hint={attention.length ? attention.map((c) => c.name).join(", ") : null}
        tone="warn"
      />
    </StatGrid>
  );
}
