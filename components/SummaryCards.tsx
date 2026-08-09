import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "@/types/invoice";
import { formatMoneyByCurrency, sumByCurrency } from "@/lib/format";
import {
  LuCircleCheck,
  LuClock,
  LuTriangleAlert,
  LuWallet,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  invoices: Invoice[];
}

export function SummaryCards({ invoices }: SummaryCardsProps) {
  const paidThisMonth = invoices.filter((i) => i.status === "paid");
  const paidTotal = sumByCurrency(
    paidThisMonth.map((i) => ({ amount: i.amountPaid, currency: i.currency })),
  );

  const outstanding = invoices.filter(
    (i) => i.status === "sent" || i.status === "partial",
  );
  const outstandingTotal = sumByCurrency(
    outstanding.map((i) => ({
      amount: i.amount - i.amountPaid,
      currency: i.currency,
    })),
  );

  const overdue = invoices.filter((i) => i.status === "overdue");
  const overdueTotal = sumByCurrency(
    overdue.map((i) => ({
      amount: i.amount - i.amountPaid,
      currency: i.currency,
    })),
  );

  const totalIssued = sumByCurrency(
    invoices
      .filter((i) => i.status !== "draft")
      .map((i) => ({ amount: i.amount, currency: i.currency })),
  );

  const uniqueClients = new Set(invoices.map((i) => i.client.id)).size;

  const cards = [
    {
      label: "Paid this month",
      value: formatMoneyByCurrency(paidTotal),
      sub: `${paidThisMonth.length} invoice${paidThisMonth.length === 1 ? "" : "s"} · avg 7 days`,
      icon: LuCircleCheck,
      tone: "text-emerald-600",
    },
    {
      label: "Outstanding",
      value: formatMoneyByCurrency(outstandingTotal),
      sub: `${outstanding.length} invoice${outstanding.length === 1 ? "" : "s"} in progress`,
      icon: LuWallet,
      tone: "text-amber-600",
    },
    {
      label: "Overdue",
      value:
        overdue.length === 0
          ? formatMoneyByCurrency({})
          : formatMoneyByCurrency(overdueTotal),
      sub:
        overdue.length === 0
          ? "No overdue invoices"
          : `${overdue.length} invoice needs attention`,
      icon: LuTriangleAlert,
      tone: overdue.length === 0 ? "text-gray-400" : "text-red-600",
      muted: overdue.length === 0,
    },
    {
      label: "Total this year",
      value: formatMoneyByCurrency(totalIssued),
      sub: `From ${uniqueClients} clients`,
      icon: LuClock,
      tone: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <card.icon className={cn("h-4 w-4", card.tone)} />
            </div>
            <p
              className={cn(
                "text-2xl font-bold leading-tight ",
                card.muted ? "" : "",
              )}
            >
              {card.value}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
