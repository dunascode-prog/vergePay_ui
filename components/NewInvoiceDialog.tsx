"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Currency } from "@/types/invoice";
import { formatMoney } from "@/lib/format";
import { LuPlus, LuTrash2 } from "react-icons/lu";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

function emptyLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 };
}

export function NewInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [taxRate, setTaxRate] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLineItems((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeLine(id: string) {
    setLineItems((items) => (items.length > 1 ? items.filter((i) => i.id !== id) : items));
  }

  function resetAndClose() {
    setLineItems([emptyLineItem()]);
    setTaxRate(0);
    setCurrency("NGN");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-700 hover:bg-emerald-800">
          <LuPlus className="h-4 w-4 mr-1.5" />
          New invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Line items post to the ledger as Accounts Receivable and Revenue once the invoice is sent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="client">Client</Label>
            <Select>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="techcorp">TechCorp</SelectItem>
                <SelectItem value="startupxyz">StartupXYZ</SelectItem>
                <SelectItem value="designagency">DesignAgency Ltd</SelectItem>
                <SelectItem value="mediahouse">MediaHouse Nigeria</SelectItem>
                <SelectItem value="new">+ Add new client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due-date">Due date</Label>
            <Input id="due-date" type="date" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Payment terms, project reference, etc." rows={2} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Line items</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLine(item.id, { description: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateLine(item.id, { quantity: Number(e.target.value) })}
                className="w-16"
                aria-label="Quantity"
              />
              <Input
                type="number"
                min={0}
                value={item.rate}
                onChange={(e) => updateLine(item.id, { rate: Number(e.target.value) })}
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
            onClick={() => setLineItems((items) => [...items, emptyLineItem()])}
          >
            <LuPlus className="h-3.5 w-3.5 mr-1.5" />
            Add line item
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              Tax
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="h-7 w-16"
              />
              %
            </span>
            <span className="text-gray-900">{formatMoney(tax, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold pt-1 border-t border-gray-100">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={resetAndClose}>
            Save as draft
          </Button>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={resetAndClose}>
            Send invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
