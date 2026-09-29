import { getEnvelopeViews } from "@/data/mock-envelopes";
import { getWalletBalances } from "@/data/mock-business";
import { PageHeader } from "@/components/envelopes/PageHeader";
import { EnvelopeSummaryCards } from "@/components/envelopes/EnvelopeSummaryCards";
import { AIEnvelopeInsightBanner } from "@/components/envelopes/AIEnvelopeInsightBanner";
import { EnvelopeGrid } from "@/components/envelopes/EnvelopeGrid";

export default async function EnvelopesPage() {
  const [envelopes, wallets] = await Promise.all([getEnvelopeViews(), getWalletBalances()]);

  // "Available to allocate" is scoped to the Business wallet specifically
  // (not Personal + Business combined) since these envelopes represent
  // operational business budgeting, same as Expenses and Payroll. This is
  // the exact same wallet data shown on the Business Overview page.
  const businessWallet = wallets.find((w) => w.label === "Business");
  const availableCash = businessWallet?.amounts.find((a) => a.currency === "NGN")?.amount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <PageHeader
          backHref="/dashboard/business"
          backLabel="Back to business overview"
          title="Envelopes"
        />

        <div className="space-y-4 mb-6">
          <EnvelopeSummaryCards envelopes={envelopes} availableCash={availableCash} />
          <AIEnvelopeInsightBanner envelopes={envelopes} availableCash={availableCash} />
        </div>

        <EnvelopeGrid envelopes={envelopes} />
      </div>
    </div>
  );
}
