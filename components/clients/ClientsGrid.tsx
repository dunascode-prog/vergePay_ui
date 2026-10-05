"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasActivePlan, isNewClient, lastActivity, revenueKey } from "@/lib/clients";
import { cn } from "@/lib/utils";
import { ApiClient } from "@/types/invoicing";
import { AddClientDialog } from "./AddClientDialog";
import { ClientCard } from "./ClientCard";
import { ClientDetailSheet } from "./ClientDetailSheet";

type Filter = "all" | "vip" | "recurring" | "attention" | "new" | "archived";
type SortKey = "revenue" | "health" | "recent" | "name";

const FILTERS: { value: Filter; label: string; match: (c: ApiClient) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "vip", label: "VIP", match: (c) => c.is_vip },
  { value: "recurring", label: "Recurring", match: hasActivePlan },
  { value: "attention", label: "Need attention", match: (c) => c.health.label === "at_risk" || c.overdue_count > 0 },
  { value: "new", label: "New", match: (c) => isNewClient(c) },
  { value: "archived", label: "Archived", match: () => true },
];

const SORTS: Record<SortKey, { label: string; compare: (a: ApiClient, b: ApiClient) => number }> = {
  revenue: {
    label: "Most paid to you",
    compare: (a, b) => {
      const [an, au] = revenueKey(a);
      const [bn, bu] = revenueKey(b);
      return bn - an || bu - au;
    },
  },
  health: { label: "Healthiest first", compare: (a, b) => (b.health.score ?? -1) - (a.health.score ?? -1) },
  recent: { label: "Recently active", compare: (a, b) => lastActivity(b).localeCompare(lastActivity(a)) },
  name: { label: "Name (A to Z)", compare: (a, b) => a.name.localeCompare(b.name) },
};

/** The client book: filters, search, sort, cards, and the client in a side sheet. */
export function ClientsGrid({ clients, onChanged }: { clients: ApiClient[]; onChanged: (client: ApiClient) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("revenue");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const counts = useMemo(() => {
    const active = clients.filter((c) => !c.archived_at);
    return Object.fromEntries(FILTERS.map((f) => [f.value, f.value === "archived" ? clients.length - active.length : active.filter(f.match).length])) as Record<Filter, number>;
  }, [clients]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rule = FILTERS.find((f) => f.value === filter)!;
    return clients
      .filter((c) => (filter === "archived" ? !!c.archived_at : !c.archived_at && rule.match(c)))
      .filter((c) => !q || [c.name, c.email, c.contact_name, c.industry, c.location].some((v) => v?.toLowerCase().includes(q)))
      .sort(SORTS[sort].compare);
  }, [clients, query, filter, sort]);

  const selected = clients.find((c) => c.client_id === selectedId) ?? null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1" role="tablist" aria-label="Filter clients">
          {FILTERS.filter((f) => f.value !== "archived" || counts.archived > 0).map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground",
                filter === f.value && "bg-background font-medium text-foreground shadow-sm",
              )}
            >
              {f.label} <span className="text-xs tabular-nums text-muted-foreground">{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-60">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input placeholder="Search name, contact, industry…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" aria-label="Search clients" />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort clients"
            className="h-9 rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:border-emerald-600 focus-visible:ring-3 focus-visible:ring-emerald-600/15"
          >
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORTS[k].label}
              </option>
            ))}
          </select>
          <Button onClick={() => setAdding(true)} className="bg-emerald-700 text-white hover:bg-emerald-800">
            <Plus className="size-4" /> Add client
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          {clients.length === 0 ? "No clients yet. Add the people and businesses you bill; you don't need their bank details." : "No clients match this view."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <ClientCard key={c.client_id} client={c} onClick={() => setSelectedId(c.client_id)} />
          ))}
        </div>
      )}

      <ClientDetailSheet client={selected} onOpenChange={(open) => !open && setSelectedId(null)} onChanged={onChanged} />
      <AddClientDialog
        open={adding}
        onOpenChange={setAdding}
        onSaved={(created) => {
          setAdding(false);
          onChanged(created);
          setSelectedId(created.client_id);
        }}
      />
    </section>
  );
}
