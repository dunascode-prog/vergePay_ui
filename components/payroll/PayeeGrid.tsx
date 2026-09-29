"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayeeCard } from "./PayeeCard";
import { AddPayeeDialog } from "./AddPayeeDialog";
import { Payee, PayrollPayment } from "@/types/payroll";
import {
  createPayeeAction,
  runPayrollAction,
} from "@/app/(protected)/dashboard/payroll/actions";
import { LuSearch } from "react-icons/lu";

interface PayeeGridProps {
  payees: Payee[];
  payments: PayrollPayment[];
}

type Filter = "all" | "retainer" | "per_project" | "unpaid";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "retainer", label: "Retainers" },
  { value: "per_project", label: "Per-project" },
  { value: "unpaid", label: "Awaiting first payment" },
];

export function PayeeGrid({
  payees: initialPayees,
  payments: initialPayments,
}: PayeeGridProps) {
  const router = useRouter();
  const [payees, setPayees] = useState(initialPayees);
  const [payments, setPayments] = useState(initialPayments);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    return payees.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "retainer" && p.payType === "Retainer") ||
        (filter === "per_project" && p.payType === "Per-project") ||
        (filter === "unpaid" && p.lastPaidDate === null);
      return matchesQuery && matchesFilter;
    });
  }, [payees, query, filter]);

  function handleCreated(payee: Payee) {
    setPayees((prev) => [...prev, payee]);
  }

  async function handleRunPayroll(payeeId: string) {
    const payee = payees.find((p) => p.id === payeeId);
    if (!payee) return;

    const { payment, updatedPayee } = await runPayrollAction(
      payeeId,
      payee.rate,
    );
    setPayments((prev) => [payment, ...prev]);
    setPayees((prev) => prev.map((p) => (p.id === payeeId ? updatedPayee : p)));
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
              placeholder="Search team & contractors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <AddPayeeDialog
            onCreate={createPayeeAction}
            onCreated={handleCreated}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No one matches this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((payee) => (
            <PayeeCard
              key={payee.id}
              payee={payee}
              payments={payments}
              onRunPayroll={handleRunPayroll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
