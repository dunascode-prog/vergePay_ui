import { getClients } from "@/data/mock-clients";
import { PageHeader } from "@/components/clients/PageHeader";
import { ClientSummaryCards } from "@/components/clients/ClientSummaryCards";
import { ClientPortfolioAISummary } from "@/components/clients/ClientPortfolioAISummary";
import { ClientsGrid } from "@/components/clients/ClientsGrid";
import { RoadmapNote } from "@/components/clients/RoadmapNote";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <PageHeader
          backHref="/dashboard/invoices"
          backLabel="Back to invoices"
          title=""
        />

        <div className="space-y-4">
          <ClientSummaryCards clients={clients} />
          <ClientPortfolioAISummary clients={clients} />
          <ClientsGrid clients={clients} />
          <RoadmapNote />
        </div>
      </div>
    </div>
  );
}
