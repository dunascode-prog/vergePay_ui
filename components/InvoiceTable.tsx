"use client";

import { useMemo, useState } from "react";
import { Invoice, InvoiceFilter } from "@/types/invoice";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceRow } from "./InvoiceRow";
import { LuSearch, LuDownload, LuBellRing, LuX } from "react-icons/lu";

interface InvoiceTableProps {
  invoices: Invoice[];
}

const FILTERS: { value: InvoiceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

const PAGE_SIZE = 5;

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesFilter = filter === "all" || inv.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        inv.number.toLowerCase().includes(q) ||
        inv.client.name.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [invoices, filter, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === visible.length
        ? new Set()
        : new Set(visible.map((i) => i.id)),
    );
  }

  // Simulates a call through the idempotency-key protocol: the action is
  // disabled the moment it's fired so a retry (e.g. a double click) can't
  // trigger a duplicate reminder or send.
  async function runAction(id: string) {
    setActionInFlight(id);
    await new Promise((r) => setTimeout(r, 700));
    setActionInFlight(null);
  }

  return (
    <div className="lg:col-span-9 rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as InvoiceFilter)}
        >
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-sm">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search invoices or clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-emerald-50/70 border-b border-emerald-100 px-4 py-2.5">
          <p className="text-sm text-emerald-800 font-medium">
            {selected.size} invoice{selected.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-white">
              <LuBellRing className="h-3.5 w-3.5 mr-1.5" />
              Send reminders
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-white">
              <LuDownload className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelected(new Set())}
            >
              <LuX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-9">
                <Checkbox
                  checked={
                    visible.length > 0 && selected.size === visible.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all visible invoices"
                />
              </TableHead>
              <TableHead className="w-9" />
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableHead
                  colSpan={9}
                  className="h-24 text-center text-sm font-normal text-gray-400"
                >
                  No invoices match this view.
                </TableHead>
              </TableRow>
            ) : (
              visible.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  selected={selected.has(invoice.id)}
                  onToggleSelect={toggleSelect}
                  onSend={(id) => runAction(id)}
                  actionInFlight={actionInFlight}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center border-t border-gray-100 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Load more invoices
          </Button>
        </div>
      )}
    </div>
  );
}
