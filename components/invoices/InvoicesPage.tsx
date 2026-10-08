"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/app-data";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { dueLabel, isUnpaid, money, sumBy } from "@/lib/invoicing";
import { cn } from "@/lib/utils";
import { listAllInvoices } from "@/services/invoices";
import { ApiInvoice, InvoiceStatus } from "@/types/invoicing";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { CurrencyAmounts } from "@/components/money/CurrencyAmounts";
import { StatCard, StatGrid } from "@/components/StatCard";
import { balanceTrend, flowTrend, invoiceBalanceAt, mainCurrency, overdueAt, paidInvoiceEvents, unpaidAt } from "@/lib/trends";

type Tab = "issued" | "received";
type Filter = "all" | InvoiceStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "open", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const who = (i: ApiInvoice) =>
  i.direction === "received" ? i.issuer_name : i.client?.name ?? (i.billed_account_number ? `Account ${i.billed_account_number}` : "—");

/** /dashboard/invoices: what you've billed, what's owed, and what you've been billed. */
export function InvoicesPage() {
  const { dataVersion } = useAppData();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("issued");
  const [filter, setFilter] = useState<Filter>("all");
  const [issued, setIssued] = useState<ApiInvoice[] | null>(null);
  const [received, setReceived] = useState<ApiInvoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  // when the list was loaded: "paid in the last 30 days" counts back from it
  const [loadedAt, setLoadedAt] = useState(0);

  // refetched when money moves (dataVersion), e.g. a client pays a link
  useEffect(() => {
    let live = true;
    Promise.all([listAllInvoices("issued"), listAllInvoices("received")])
      .then(([mine, theirs]) => {
        if (!live) return;
        setIssued(mine);
        setReceived(theirs);
        setLoadedAt(Date.now());
        setError(null);
      })
      .catch((err) => live && setError(err instanceof ApiError ? err.message : "We couldn't load your invoices."));
    return () => {
      live = false;
    };
  }, [dataVersion]);

  const list = useMemo(() => (tab === "issued" ? issued ?? [] : received), [tab, issued, received]);
  const shown = useMemo(
    () =>
      filter === "all"
        ? list
        : list.filter((i) => (filter === "open" ? i.invoice_status === "open" : filter === "cancelled" ? ["cancelled", "refunded"].includes(i.invoice_status) : i.invoice_status === filter)),
    [list, filter],
  );

  const stats = useMemo(() => {
    const mine = issued ?? [];
    const monthAgo = loadedAt - 30 * 86_400_000;
    const outstanding = sumBy(mine, isUnpaid);
    const overdue = sumBy(mine, (i) => i.invoice_status === "overdue");
    const paid = sumBy(mine, (i) => i.invoice_status === "paid" && !!i.paid_at && new Date(i.paid_at).getTime() >= monthAgo);
    return {
      trends: {
        outstanding: balanceTrend(invoiceBalanceAt(mine, mainCurrency(outstanding), unpaidAt), "down", loadedAt),
        overdue: balanceTrend(invoiceBalanceAt(mine, mainCurrency(overdue), overdueAt), "down", loadedAt),
        paid: flowTrend(paidInvoiceEvents(mine), mainCurrency(paid), "up", loadedAt),
      },
      outstanding,
      outstandingCount: mine.filter(isUnpaid).length,
      overdue,
      overdueCount: mine.filter((i) => i.invoice_status === "overdue").length,
      paid,
      drafts: mine.filter((i) => i.invoice_status === "draft").length,
    };
  }, [issued, loadedAt]);

  if (error) {
    return <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-5">
      {/* summary */}
      {issued ? (
        <StatGrid>
          <StatCard label="Outstanding" trend={stats.trends.outstanding} value={<CurrencyAmounts totals={stats.outstanding} empty={money(0, "NGN")} />} hint={stats.outstandingCount ? `${stats.outstandingCount} unpaid` : null} />
          <StatCard
            label="Overdue"
            trend={stats.trends.overdue}
            value={<CurrencyAmounts totals={stats.overdue} empty={money(0, "NGN")} />}
            hint={stats.overdueCount ? `${stats.overdueCount} past due` : null}
            tone="warn"
          />
          <StatCard label="Paid, last 30 days" trend={stats.trends.paid} value={<CurrencyAmounts totals={stats.paid} empty={money(0, "NGN")} />} />
          <StatCard label="Drafts" value={String(stats.drafts)} />
        </StatGrid>
      ) : (
        <StatGrid>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </StatGrid>
      )}

      <div className="rounded-xl border bg-card">
        {/* tabs and filters */}
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1" role="tablist" aria-label="Invoices">
            {(["issued", "received"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setFilter("all");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "issued" ? "Sent" : "To pay"}
                {t === "received" && received.some(isUnpaid) && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                    {received.filter(isUnpaid).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5" aria-label="Filter by status">
            {FILTERS.filter((f) => tab === "issued" || f.value !== "draft").map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  filter === f.value ? "border-emerald-700 bg-emerald-700 text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {issued === null ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <Empty tab={tab} filtered={filter !== "all"} />
        ) : (
          <>
            {/* desktop: a table */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Invoice</th>
                  <th className="px-4 py-2.5 font-medium">{tab === "issued" ? "Client" : "From"}</th>
                  <th className="px-4 py-2.5 font-medium">Due</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((i) => (
                  <tr
                    key={i.invoice_id}
                    onClick={() => router.push(`/dashboard/invoices/${i.invoice_id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/invoices/${i.invoice_id}`} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                        {i.invoice_number ?? "Draft"}
                      </Link>
                      <p className="max-w-56 truncate text-xs text-muted-foreground">{i.items[0]?.description ?? i.description ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">{who(i)}</td>
                    <td className={cn("px-4 py-3 text-muted-foreground", i.invoice_status === "overdue" && "text-amber-700 dark:text-amber-300")}>
                      {dueLabel(i)}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={i.invoice_status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{money(i.amount_due_minor, i.currency_code)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* phone: cards */}
            <ul className="divide-y md:hidden">
              {shown.map((i) => (
                <li key={i.invoice_id}>
                  <Link href={`/dashboard/invoices/${i.invoice_id}`} className="flex items-start justify-between gap-3 px-4 py-3 active:bg-muted/50">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{who(i)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {i.invoice_number ?? "Draft"} · {dueLabel(i)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-medium tabular-nums">{money(i.amount_due_minor, i.currency_code)}</span>
                      <InvoiceStatusBadge status={i.invoice_status} className="mt-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}


function Empty({ tab, filtered }: { tab: Tab; filtered: boolean }) {
  if (filtered) return <p className="px-4 py-12 text-center text-sm text-muted-foreground">No invoices with this status.</p>;
  if (tab === "received") {
    return (
      <p className="px-4 py-12 text-center text-sm text-muted-foreground">
        Invoices other VergePay customers send to your account number show up here.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <FileText className="size-5" />
      </span>
      <p className="mt-3 font-medium">Send your first invoice</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Your client gets an email with a link to pay by card, bank transfer or USSD. The money lands in your wallet.
      </p>
      <Link href="/dashboard/invoices/new" className={cn(buttonVariants(), "mt-4 bg-emerald-700 text-white hover:bg-emerald-800")}>
        <Plus className="size-4" /> New invoice
      </Link>
    </div>
  );
}
