import { EnvelopeView } from "@/types/envelope";
import { formatMoney } from "@/lib/format";
import { LuSparkles } from "react-icons/lu";

interface AIEnvelopeInsightBannerProps {
  envelopes: EnvelopeView[];
  availableCash: number;
}

function buildInsight(envelopes: EnvelopeView[], availableCash: number): string {
  const parts: string[] = [];

  const overBudget = envelopes.filter((e) => e.isOverBudget);
  for (const envelope of overBudget) {
    const over = envelope.spent - envelope.allocated;
    parts.push(
      `${envelope.name} is ${formatMoney(over, envelope.currency)} over its ${formatMoney(
        envelope.allocated,
        envelope.currency
      )} budget this period.`
    );
  }

  const totalAllocated = envelopes
    .filter((e) => e.currency === "NGN")
    .reduce((s, e) => s + e.allocated, 0);
  const unallocated = availableCash - totalAllocated;
  if (unallocated > 0) {
    parts.push(
      `${formatMoney(unallocated, "NGN")} in Business cash hasn't been assigned to an envelope yet.`
    );
  }

  const healthiest = [...envelopes]
    .filter((e) => !e.isOverBudget)
    .sort((a, b) => b.remaining / b.allocated - a.remaining / a.allocated)[0];
  if (healthiest) {
    const pctUsed = Math.round((healthiest.spent / healthiest.allocated) * 100);
    parts.push(`${healthiest.name} has the most room left, at ${pctUsed}% used.`);
  }

  return parts.join(" ");
}

export function AIEnvelopeInsightBanner({ envelopes, availableCash }: AIEnvelopeInsightBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3">
      <LuSparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-emerald-700 mb-0.5">
          AI envelope insight
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">
          {buildInsight(envelopes, availableCash)}
        </p>
      </div>
    </div>
  );
}
