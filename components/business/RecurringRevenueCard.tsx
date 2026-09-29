import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoneyByCurrency } from "@/lib/format";
import { Currency } from "@/types/invoice";
import { LuRepeat, LuArrowRight } from "react-icons/lu";

interface RecurringRevenueCardProps {
  mrrByCurrency: Partial<Record<Currency, number>>;
  activeCount: number;
  pausedCount: number;
  totalCount: number;
}

export function RecurringRevenueCard({
  mrrByCurrency,
  activeCount,
  pausedCount,
  totalCount,
}: RecurringRevenueCardProps) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <LuRepeat className="h-4 w-4 text-emerald-600" />
          Recurring revenue
        </CardTitle>
        <Link href="/recurring">
          <Button variant="ghost" size="sm" className="h-7 text-gray-500">
            View all
            <LuArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-gray-900 mb-1">
          {formatMoneyByCurrency(mrrByCurrency)}
        </p>
        <p className="text-xs text-gray-400 mb-3">Monthly recurring revenue, normalized</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            <strong className="text-gray-900">{activeCount}</strong> active
          </span>
          {pausedCount > 0 && (
            <span className="text-amber-600">
              <strong>{pausedCount}</strong> paused
            </span>
          )}
          <span className="text-gray-400">of {totalCount} total plans</span>
        </div>
      </CardContent>
    </Card>
  );
}
