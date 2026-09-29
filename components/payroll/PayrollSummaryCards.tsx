import { Card, CardContent } from "@/components/ui/card";
import { Payee, PayrollPayment } from "@/types/payroll";
import { formatMoney } from "@/lib/format";
import { LuUsers, LuWallet, LuClock, LuCircleAlert } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface PayrollSummaryCardsProps {
  payees: Payee[];
  payments: PayrollPayment[];
}

export function PayrollSummaryCards({ payees, payments }: PayrollSummaryCardsProps) {
  const active = payees.filter((p) => p.status === "active");
  const retainers = active.filter((p) => p.payType === "Retainer");
  const monthlyRetainerCost = retainers
    .filter((p) => p.currency === "NGN")
    .reduce((sum, p) => sum + p.rate, 0);

  const neverPaid = active.filter((p) => p.lastPaidDate === null);

  const totalPaidOut = payments
    .filter((p) => p.currency === "NGN")
    .reduce((sum, p) => sum + p.grossAmount, 0);

  const cards = [
    {
      label: "Active team & contractors",
      value: String(active.length),
      sub: `${retainers.length} on monthly retainer`,
      icon: LuUsers,
      tone: "text-gray-500",
    },
    {
      label: "Monthly retainer cost",
      value: formatMoney(monthlyRetainerCost, "NGN"),
      sub: "Recurring, before per-project work",
      icon: LuWallet,
      tone: "text-emerald-600",
    },
    {
      label: "Total paid out",
      value: formatMoney(totalPaidOut, "NGN"),
      sub: `${payments.length} payment${payments.length === 1 ? "" : "s"} recorded`,
      icon: LuClock,
      tone: "text-gray-500",
    },
    {
      label: "Awaiting first payment",
      value: String(neverPaid.length),
      sub: neverPaid.length > 0 ? neverPaid.map((p) => p.name).join(", ") : "Everyone's been paid",
      icon: LuCircleAlert,
      tone: neverPaid.length > 0 ? "text-amber-600" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-gray-200 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {card.label}
              </p>
              <card.icon className={cn("h-4 w-4", card.tone)} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 leading-tight">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1 truncate" title={card.sub}>
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
