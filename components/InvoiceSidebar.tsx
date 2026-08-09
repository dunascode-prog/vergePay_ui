import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Invoice, Currency } from "@/types/invoice";
import { formatMoneyByCurrency, sumByCurrency } from "@/lib/format";
import { HealthDot } from "./HealthDot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface InvoiceSidebarProps {
  invoices: Invoice[];
}

export function InvoiceSidebar({ invoices }: InvoiceSidebarProps) {
  const totalIssued = sumByCurrency(
    invoices
      .filter((i) => i.status !== "draft")
      .map((i) => ({ amount: i.amount, currency: i.currency }))
  );
  const collected = sumByCurrency(
    invoices.map((i) => ({ amount: i.amountPaid, currency: i.currency }))
  );
  const pending = sumByCurrency(
    invoices
      .filter((i) => i.status === "sent" || i.status === "partial" || i.status === "overdue")
      .map((i) => ({ amount: i.amount - i.amountPaid, currency: i.currency }))
  );
  const draftTotal = sumByCurrency(
    invoices.filter((i) => i.status === "draft").map((i) => ({ amount: i.amount, currency: i.currency }))
  );

  interface ClientSummary {
    name: string;
    initials: string;
    healthScore: number;
    avgCollectionDays: number;
    amounts: { amount: number; currency: Currency }[];
  }

  const clientTotals = new Map<string, ClientSummary>();
  for (const inv of invoices) {
    const existing = clientTotals.get(inv.client.id);
    if (existing) {
      existing.amounts.push({ amount: inv.amount, currency: inv.currency });
    } else {
      clientTotals.set(inv.client.id, {
        name: inv.client.name,
        initials: inv.client.initials,
        healthScore: inv.client.healthScore,
        avgCollectionDays: inv.client.avgCollectionDays,
        amounts: [{ amount: inv.amount, currency: inv.currency }],
      });
    }
  }

  // Rank clients by their largest single-currency total, since totals across
  // different currencies aren't combined into one comparable number.
  const topClients = Array.from(clientTotals.values())
    .map((client) => ({ ...client, totals: sumByCurrency(client.amounts) }))
    .sort((a, b) => {
      const maxA = Math.max(...Object.values(a.totals));
      const maxB = Math.max(...Object.values(b.totals));
      return maxB - maxA;
    })
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-gray-200 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Invoice summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Total issued" value={formatMoneyByCurrency(totalIssued)} />
          <Row label="Collected" value={formatMoneyByCurrency(collected)} tone="text-emerald-700" />
          <Row label="Pending" value={formatMoneyByCurrency(pending)} tone="text-amber-700" />
          <Row label="Draft" value={formatMoneyByCurrency(draftTotal)} tone="text-gray-400" />
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Client quick view</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topClients.map((client) => (
            <div key={client.name} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{client.name}</p>
                <HealthDot score={client.healthScore} avgCollectionDays={client.avgCollectionDays} />
              </div>
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap text-right">
                {formatMoneyByCurrency(client.totals)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={(tone ?? "text-gray-900 font-medium") + " text-right"}>{value}</span>
    </div>
  );
}
