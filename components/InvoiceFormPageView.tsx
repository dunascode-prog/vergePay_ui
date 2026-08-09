"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Currency, Invoice } from "@/types/invoice";
import { formatMoney } from "@/lib/format";
import { LuPlus, LuTrash2, LuLock } from "react-icons/lu";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

function emptyLineItem(): InvoiceLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 };
}

/**
 * Best-effort reconstruction of line items from an existing invoice.
 * The current Invoice type only stores a single amount + description, not
 * an itemized breakdown, so editing an existing invoice shows it as one
 * line item. See README: add a real `lineItems` field to the schema for
 * accurate multi-line editing.
 */
function lineItemsFromInvoice(invoice: Invoice): InvoiceLineItem[] {
  return [
    {
      id: crypto.randomUUID(),
      description: invoice.description,
      quantity: 1,
      rate: invoice.amount,
    },
  ];
}

export interface InvoiceFormValues {
  clientId: string;
  dueDate: string;
  notes: string;
  currency: Currency;
  taxRate: number;
  lineItems: { description: string; quantity: number; rate: number }[];
  subtotal: number;
  tax: number;
  total: number;
}

interface InvoiceFormPageViewProps {
  mode: "create" | "edit";
  /** Existing invoice when mode is "edit". Undefined/not-found is handled by the route. */
  invoice?: Invoice;
  /**
   * Called with the current form values. Wire this to your create/update
   * API call. `submitType` tells you whether "Save as draft" or
   * "Send invoice" / "Save changes" was pressed.
   */
  onSubmit: (
    values: InvoiceFormValues,
    submitType: "draft" | "send",
  ) => Promise<void>;
  /** Client options for the select — replace with a real client list. */
  clientOptions?: { id: string; name: string }[];
}

const DEFAULT_CLIENT_OPTIONS = [
  { id: "techcorp", name: "TechCorp" },
  { id: "startupxyz", name: "StartupXYZ" },
  { id: "designagency", name: "DesignAgency Ltd" },
  { id: "mediahouse", name: "MediaHouse Nigeria" },
];

export function InvoiceFormPageView({
  mode,
  invoice,
  onSubmit,
  clientOptions = DEFAULT_CLIENT_OPTIONS,
}: InvoiceFormPageViewProps) {
  const router = useRouter();

  // An invoice that's already been sent has posted ledger entries — editing
  // its line items after the fact would desync the form from the ledger, so
  // edit mode is locked to anything past "draft".
  const isLocked =
    mode === "edit" && invoice !== undefined && invoice.status !== "draft";

  const [clientId, setClientId] = useState(invoice?.client.id ?? "");
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? "");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState<Currency>(
    invoice?.currency ?? "NGN",
  );
  const [taxRate, setTaxRate] = useState(0);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    invoice ? lineItemsFromInvoice(invoice) : [emptyLineItem()],
  );
  const [saving, setSaving] = useState<"draft" | "send" | null>(null);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    setLineItems((items) =>
      items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }

  function removeLine(id: string) {
    setLineItems((items) =>
      items.length > 1 ? items.filter((i) => i.id !== id) : items,
    );
  }

  async function handleSubmit(submitType: "draft" | "send") {
    setSaving(submitType);
    try {
      await onSubmit(
        {
          clientId,
          dueDate,
          notes,
          currency,
          taxRate,
          lineItems: lineItems.map(({ description, quantity, rate }) => ({
            description,
            quantity,
            rate,
          })),
          subtotal,
          tax,
          total,
        },
        submitType,
      );
    } finally {
      setSaving(null);
    }
  }

  const title =
    mode === "edit" && invoice ? `Edit ${invoice.number}` : "New invoice";
  const backHref =
    mode === "edit" && invoice
      ? `/dashboard/invoices/${invoice.id}`
      : "/dashboard/invoices";
  const backLabel = mode === "edit" ? "Back to invoice" : "Back to invoices";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <PageHeader backHref={backHref} backLabel={backLabel} title={title} />

        {isLocked && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
            <LuLock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">This invoice has already been sent.</p>
              <p className="mt-0.5">
                Its line items are locked because they&apos;re posted to the
                ledger. To correct an amount,{" "}
                <Link
                  href={`/dashboard/invoices/${invoice?.id}`}
                  className="underline font-medium"
                >
                  issue a credit note
                </Link>{" "}
                instead of editing here.
              </p>
            </div>
          </div>
        )}

        <fieldset disabled={isLocked} className="disabled:opacity-60">
          <Card className="border-gray-200 shadow-none mb-4">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="client">Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientOptions.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add new client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="due-date">Due date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate ?? ""}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Payment terms, project reference, etc."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-none mb-4">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">
                Line items
              </CardTitle>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
              >
                <SelectTrigger className="h-8 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-3">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLine(item.id, { description: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLine(item.id, { quantity: Number(e.target.value) })
                    }
                    className="w-16"
                    aria-label="Quantity"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.rate === 0 ? "" : item.rate}
                    onChange={(e) =>
                      updateLine(item.id, { rate: Number(e.target.value) })
                    }
                    className="w-28"
                    aria-label="Rate"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-600 shrink-0"
                    onClick={() => removeLine(item.id)}
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() =>
                  setLineItems((items) => [...items, emptyLineItem()])
                }
              >
                <LuPlus className="h-3.5 w-3.5 mr-1.5" />
                Add line item
              </Button>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    Tax
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={taxRate === 0 ? "" : taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="h-7 w-16"
                    />
                    %
                  </span>
                  <span className="text-gray-900">
                    {formatMoney(tax, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatMoney(total, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </fieldset>

        {!isLocked && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={saving !== null}
              onClick={() => handleSubmit("draft")}
            >
              {saving === "draft"
                ? "Saving…"
                : mode === "create"
                  ? "Save as draft"
                  : "Save changes"}
            </Button>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800"
              disabled={saving !== null}
              onClick={() => handleSubmit("send")}
            >
              {saving === "send" ? "Sending…" : "Send invoice"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
