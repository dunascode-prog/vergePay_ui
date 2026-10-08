"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { ErrorNote } from "@/components/money/parts";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { listAllInvoices, listClients } from "@/services/invoices";
import { ApiClient, ApiInvoice } from "@/types/invoicing";
import { ClientPortfolioAISummary } from "./ClientPortfolioAISummary";
import { ClientSummaryCards } from "./ClientSummaryCards";
import { ClientsGrid } from "./ClientsGrid";

/** /dashboard/clients: who you bill and how they pay, from your invoices. */
export function ClientsPage() {
  const { dataVersion } = useAppData();
  const [clients, setClients] = useState<ApiClient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // for the cards' trends only; the page works without them
  const [invoices, setInvoices] = useState<ApiInvoice[] | null>(null);

  // refetched when money moves (dataVersion): a client paying changes their record
  useEffect(() => {
    let live = true;
    listClients({ includeArchived: true })
      .then((list) => {
        if (!live) return;
        setClients(list);
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your clients."));
    listAllInvoices("issued")
      .then((list) => live && setInvoices(list))
      .catch(() => live && setInvoices(null));
    return () => {
      live = false;
    };
  }, [dataVersion]);

  const active = useMemo(() => (clients ?? []).filter((c) => !c.archived_at), [clients]);
  const upsert = (client: ApiClient) =>
    setClients((cs) => {
      const list = cs ?? [];
      return list.some((c) => c.client_id === client.client_id) ? list.map((c) => (c.client_id === client.client_id ? client : c)) : [...list, client];
    });

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (clients === null) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ClientSummaryCards clients={active} allClients={clients} invoices={invoices} />
      <ClientPortfolioAISummary clients={active} />
      <ClientsGrid clients={clients} onChanged={upsert} />
    </div>
  );
}
