"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { Expense, ExpenseCategoryName } from "@/types/expense";
import { CATEGORY_COLORS, ALL_CATEGORIES } from "@/lib/expense-category";
import { formatMoney, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuDownload,
  LuChevronDown,
  LuChevronRight,
  LuTrash2,
  LuRepeat,
  LuReceipt,
  LuArrowDownToLine,
  LuArrowUpFromLine,
} from "react-icons/lu";
import { AddExpenseDialog } from "./AddExpenseDialog";
import {
  createExpenseAction,
  deleteExpenseAction,
} from "@/app/(protected)/dashboard/expenses/actions";
import { Expense, ExpenseCategoryName } from "@/types/expense";

interface ExpenseTableProps {
  expenses: Expense[];
}

type Filter = "all" | ExpenseCategoryName;

function exportToCsv(expenses: Expense[]) {
  const header = [
    "Date",
    "Description",
    "Vendor",
    "Category",
    "Amount",
    "Currency",
    "Recurring",
    "Receipt",
  ];
  const rows = expenses.map((e) => [
    e.date,
    e.description,
    e.vendor,
    e.category,
    String(e.amount),
    e.currency,
    e.isRecurring ? "Yes" : "No",
    e.hasReceipt ? "Yes" : "No",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExpenseTable({ expenses: initialExpenses }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    return expenses.filter((e) => {
      const matchesFilter = filter === "all" || e.category === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        e.description.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [expenses, filter, query]);

  function handleCreated(expense: Expense) {
    setExpenses((prev) => [expense, ...prev]);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    await deleteExpenseAction(deleteTarget.id);
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setPendingId(null);
    setDeleteTarget(null);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all" className="text-sm">
              All
            </TabsTrigger>
            {ALL_CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="text-sm">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search expenses"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => exportToCsv(visible)}
          >
            <LuDownload className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <AddExpenseDialog
            onCreate={createExpenseAction}
            onCreated={handleCreated}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-9" />
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableHead
                  colSpan={7}
                  className="h-24 text-center text-sm font-normal text-gray-400"
                >
                  No expenses match this view.
                </TableHead>
              </TableRow>
            ) : (
              visible.map((expense) => {
                const expanded = expandedId === expense.id;
                const isBusy = pendingId === expense.id;
                return (
                  <Fragment key={expense.id}>
                    <TableRow className={isBusy ? "opacity-60" : undefined}>
                      <TableCell className="w-9 pr-0">
                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : expense.id)
                          }
                          className="text-gray-400 hover:text-gray-700"
                          aria-label={
                            expanded
                              ? "Collapse ledger detail"
                              : "Expand ledger detail"
                          }
                        >
                          {expanded ? (
                            <LuChevronDown className="h-4 w-4" />
                          ) : (
                            <LuChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-gray-500 whitespace-nowrap">
                        {formatShortDate(expense.date)}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        <div className="flex items-center gap-1.5">
                          {expense.description}
                          {expense.isRecurring && (
                            <LuRepeat
                              className="h-3 w-3 text-gray-400"
                              aria-label="Recurring expense"
                            />
                          )}
                          {!expense.hasReceipt && (
                            <LuReceipt
                              className="h-3 w-3 text-amber-500"
                              aria-label="Missing receipt"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              CATEGORY_COLORS[expense.category],
                            )}
                          />
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {expense.vendor}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900 whitespace-nowrap">
                        {formatMoney(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                          disabled={isBusy}
                          onClick={() => setDeleteTarget(expense)}
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-gray-50/60 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                              Ledger posting
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between rounded-md bg-white border border-gray-100 px-3 py-2 text-sm">
                                <span className="flex items-center gap-2 text-gray-700">
                                  <LuArrowDownToLine className="h-3.5 w-3.5 text-gray-400" />
                                  Expense — {expense.category}
                                </span>
                                <span className="font-medium text-gray-900">
                                  Dr{" "}
                                  {formatMoney(
                                    expense.amount,
                                    expense.currency,
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between rounded-md bg-white border border-gray-100 px-3 py-2 text-sm">
                                <span className="flex items-center gap-2 text-gray-700">
                                  <LuArrowUpFromLine className="h-3.5 w-3.5 text-gray-400" />
                                  Cash — {expense.paymentMethod}
                                </span>
                                <span className="font-medium text-gray-900">
                                  Cr{" "}
                                  {formatMoney(
                                    expense.amount,
                                    expense.currency,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  This removes <strong>{deleteTarget.description}</strong> (
                  {formatMoney(deleteTarget.amount, deleteTarget.currency)}) and
                  its ledger entry. This can't be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingId !== null}>
              Keep expense
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={pendingId !== null}
              onClick={confirmDelete}
            >
              {pendingId ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
