"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCard } from "./ClientCard";
import { ClientDetailSheet } from "./ClientDetailSheet";
import { AddClientDialog } from "./AddClientDialog";
import { ClientProfile } from "@/types/client";
import { LuSearch } from "react-icons/lu";
import { createClientAction } from "@/app/(protected)/dashboard/clients/actions";

interface ClientsGridProps {
  clients: ClientProfile[];
}

type Filter = "all" | "vip" | "recurring" | "at_risk" | "new";
type SortKey = "revenue" | "health" | "recent";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vip", label: "VIP" },
  { value: "recurring", label: "Recurring" },
  { value: "at_risk", label: "At risk" },
  { value: "new", label: "New" },
];

export function ClientsGrid({ clients: initialClients }: ClientsGridProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("revenue");
  const [selected, setSelected] = useState<ClientProfile | null>(null);

  const visible = useMemo(() => {
    let result = clients.filter((client) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        client.name.toLowerCase().includes(q) ||
        client.industry.toLowerCase().includes(q) ||
        client.location.toLowerCase().includes(q);

      const matchesFilter =
        filter === "all" ||
        (filter === "vip" && client.isVip) ||
        (filter === "recurring" && client.recurringPlanStatus === "active") ||
        (filter === "at_risk" && client.healthScore < 55) ||
        (filter === "new" && client.isNew);

      return matchesQuery && matchesFilter;
    });

    result = [...result].sort((a, b) => {
      if (sort === "revenue") return b.totalRevenue - a.totalRevenue;
      if (sort === "health") return b.healthScore - a.healthScore;
      return a.lastActivityDate < b.lastActivityDate ? 1 : -1; // recent first
    });

    return result;
  }, [clients, query, filter, sort]);

  function handleCreated(client: ClientProfile) {
    setClients((prev) => [...prev, client]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-sm">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search clients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Highest revenue</SelectItem>
              <SelectItem value="health">Highest health score</SelectItem>
              <SelectItem value="recent">Recently active</SelectItem>
            </SelectContent>
          </Select>
          <AddClientDialog
            onCreate={createClientAction}
            onCreated={handleCreated}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No clients match this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => setSelected(client)}
            />
          ))}
        </div>
      )}

      <ClientDetailSheet
        client={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
