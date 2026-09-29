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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LuPlus } from "react-icons/lu";
import { CreateExpenseInput } from "@/data/mock-expenses";
import { Expense, ExpenseCategoryName, PaymentMethod } from "@/types/expense";
import { ALL_CATEGORIES } from "@/lib/expense-category";

interface AddExpenseDialogProps {
  onCreate: (input: CreateExpenseInput) => Promise<Expense>;
  onCreated: (expense: Expense) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "Card", "Direct Debit"];

const EMPTY_FORM: CreateExpenseInput = {
  description: "",
  vendor: "",
  category: "Software & tools",
  amount: 0,
  currency: "NGN",
  paymentMethod: "Card",
  isRecurring: false,
  date: new Date().toISOString().slice(0, 10),
};

export function AddExpenseDialog({ onCreate, onCreated }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateExpenseInput>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = form.description.trim() !== "" && form.vendor.trim() !== "" && form.amount > 0;

  function update<K extends keyof CreateExpenseInput>(key: K, value: CreateExpenseInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!isValid) {
      setError("A description, vendor, and amount greater than zero are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const expense = await onCreate(form);
      onCreated(expense);
      setForm(EMPTY_FORM);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-700 hover:bg-emerald-800">
          <LuPlus className="h-4 w-4 mr-1.5" />
          Add expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an expense</DialogTitle>
          <DialogDescription>
            Posts as a debit to the expense category and a credit to Cash once saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="e.g. Design subscription"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={form.vendor}
                onChange={(e) => update("vendor", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v as ExpenseCategoryName)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Payment method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) => update("paymentMethod", v as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={form.amount || ""}
              onChange={(e) => update("amount", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={form.isRecurring}
              onCheckedChange={(v) => update("isRecurring", !!v)}
            />
            <Label htmlFor="recurring" className="font-normal">
              This is a recurring subscription
            </Label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Adding…" : "Add expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
