"use client";

import { Archive, ArchiveRestore, FileText, Mail, MapPin, Pencil, Phone, Repeat, Star, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { ErrorNote } from "@/components/money/parts";
import { RecurringStatusBadge } from "@/components/recurring/RecurringStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { HEALTH_LABEL, HEALTH_TONE, amounts, initials } from "@/lib/clients";
import { formatDay, money } from "@/lib/invoicing";
import { EVERY } from "@/lib/recurring";
import { cn } from "@/lib/utils";
import { archiveClient, getClient, restoreClient, updateClient } from "@/services/invoices";
import { ApiClient } from "@/types/invoicing";
import { AddClientDialog } from "./AddClientDialog";
import { ClientAvatar } from "./ClientAvatar";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
    {children}
  </section>
);

const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="min-w-0 rounded-lg bg-muted/50 p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-0.5 truncate font-medium tabular-nums">{value}</p>
    {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
  </div>
);

/** A client in full, in a side sheet. `client` is the list's copy; the sheet loads their invoices. */
export function ClientDetailSheet({
  client,
  onOpenChange,
  onChanged,
}: {
  client: ApiClient | null;
  onOpenChange: (open: boolean) => void;
  onChanged: (client: ApiClient) => void;
}) {
  const [detail, setDetail] = useState<ApiClient | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = client?.client_id;

  useEffect(() => {
    if (!id) return;
    let live = true;
    getClient(id)
      .then((c) => live && setDetail(c))
      .catch(() => live && setError("We couldn't load this client's invoices."));
    return () => {
      live = false;
    };
  }, [id]);

  // the list's copy until the full one arrives (with invoices)
  const c = detail?.client_id === id ? detail : client;

  const act = async (run: () => Promise<ApiClient>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await run();
      setDetail((d) => ({ ...updated, invoices: d?.invoices }));
      onChanged(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={client !== null} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        {c && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <ClientAvatar name={c.name} initials={initials(c.name)} size="lg" />
                <div className="min-w-0">
                  <SheetTitle className="flex flex-wrap items-center gap-1.5">
                    {c.name}
                    {c.is_vip && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">VIP</span>}
                    {c.archived_at && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Archived</span>}
                  </SheetTitle>
                  <SheetDescription>{[c.industry, c.location].filter(Boolean).join(" · ") || `Client since ${formatDay(c.created_at)}`}</SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {!c.archived_at && (
                  <>
                    <Link href={`/dashboard/invoices/new?client=${c.client_id}`} className={cn(buttonVariants({ size: "sm" }), "bg-emerald-700 text-white hover:bg-emerald-800")}>
                      <FileText className="size-3.5" /> New invoice
                    </Link>
                    <Link href={`/dashboard/recurring/new?client=${c.client_id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                      <Repeat className="size-3.5" /> New plan
                    </Link>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => act(() => updateClient(c.client_id, { is_vip: !c.is_vip }))} disabled={busy}>
                  <Star className="size-3.5" /> {c.is_vip ? "Remove VIP" : "Mark VIP"}
                </Button>
                {c.archived_at ? (
                  <Button size="sm" variant="outline" onClick={() => act(() => restoreClient(c.client_id))} disabled={busy}>
                    <ArchiveRestore className="size-3.5" /> Restore
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => act(() => archiveClient(c.client_id))} disabled={busy} className="text-muted-foreground">
                    <Archive className="size-3.5" /> Archive
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-6">
              {error && <ErrorNote>{error}</ErrorNote>}

              <Section title="How they pay">
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums", HEALTH_TONE[c.health.label])}>
                    {c.health.score ?? "—"}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{HEALTH_LABEL[c.health.label]}</p>
                    <ul className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
                      {c.health.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Paid to you" value={amounts(c.revenue)} sub={`${c.paid_count} invoice${c.paid_count === 1 ? "" : "s"}`} />
                  <Stat label="Owed to you" value={amounts(c.outstanding)} sub={c.overdue_count ? `${amounts(c.overdue)} overdue` : `${c.open_count} not due yet`} />
                  <Stat
                    label="On time"
                    value={c.paid_count + c.overdue_count ? `${c.paid_on_time_count} of ${c.paid_count + c.overdue_count}` : "—"}
                    sub="Paid by the due date"
                  />
                  <Stat
                    label="Days to pay"
                    value={c.avg_days_to_pay === null ? "—" : c.avg_days_to_pay === 0 ? "Same day" : `${c.avg_days_to_pay} days`}
                    sub="On average, from sending"
                  />
                </div>
              </Section>

              {c.recurring_plans.length > 0 && (
                <Section title="Recurring billing">
                  <ul className="divide-y rounded-lg border">
                    {c.recurring_plans.map((p) => (
                      <li key={p.plan_id}>
                        <Link href={`/dashboard/recurring/${p.plan_id}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/40">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{p.description}</span>
                            <span className="block text-xs text-muted-foreground">
                              {money(p.amount_minor, p.currency_code)} {EVERY[p.frequency]}
                              {p.plan_status === "active" && p.next_billing_date ? ` · next ${formatDay(p.next_billing_date, false)}` : ""}
                            </span>
                          </span>
                          <RecurringStatusBadge status={p.plan_status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title="Latest invoices">
                {!detail || detail.client_id !== id ? (
                  <Skeleton className="h-24 rounded-lg" />
                ) : !detail.invoices?.length ? (
                  <p className="text-sm text-muted-foreground">No invoices sent yet.</p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {detail.invoices.slice(0, 8).map((i) => (
                      <li key={i.invoice_id}>
                        <Link href={`/dashboard/invoices/${i.invoice_id}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/40">
                          <span className="min-w-0">
                            <span className="block font-medium">{i.invoice_number}</span>
                            <span className="block text-xs text-muted-foreground">
                              {i.sent_at ? `Sent ${formatDay(i.sent_at, false)} · ` : ""}due {formatDay(i.due_date, false)}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-medium tabular-nums">{money(i.amount_due_minor, i.currency_code)}</span>
                            <InvoiceStatusBadge status={i.invoice_status} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Contact">
                <div className="space-y-1.5 text-sm">
                  {c.contact_name && (
                    <p className="flex items-center gap-2">
                      <User className="size-3.5 text-muted-foreground" /> {c.contact_name}
                    </p>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300">
                      <Mail className="size-3.5 text-muted-foreground" /> {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300">
                      <Phone className="size-3.5 text-muted-foreground" /> {c.phone}
                    </a>
                  )}
                  {c.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground" /> {c.location}
                    </p>
                  )}
                  {!c.contact_name && !c.email && !c.phone && !c.location && <p className="text-muted-foreground">No contact details yet.</p>}
                </div>
              </Section>

              <Section title="Notes">
                <p className="text-sm whitespace-pre-line text-muted-foreground">{c.notes || "No notes yet."}</p>
              </Section>
            </div>

            <AddClientDialog
              open={editing}
              onOpenChange={setEditing}
              client={c}
              onSaved={(updated) => {
                setEditing(false);
                setDetail((d) => ({ ...updated, invoices: d?.invoices }));
                onChanged(updated);
              }}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
