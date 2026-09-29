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
import { LuPlus } from "react-icons/lu";
import { CreatePayeeInput } from "@/data/mock-payroll";
import { Payee, PayType, PayFrequency } from "@/types/payroll";

interface AddPayeeDialogProps {
  onCreate: (input: CreatePayeeInput) => Promise<Payee>;
  onCreated: (payee: Payee) => void;
}

const EMPTY_FORM: CreatePayeeInput = {
  name: "",
  role: "",
  payType: "Retainer",
  frequency: "Monthly",
  rate: 0,
  currency: "NGN",
  bankName: "",
  accountNumberMasked: "",
};

export function AddPayeeDialog({ onCreate, onCreated }: AddPayeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreatePayeeInput>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = form.name.trim() !== "" && form.role.trim() !== "" && form.rate > 0;

  function update<K extends keyof CreatePayeeInput>(key: K, value: CreatePayeeInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!isValid) {
      setError("Name, role, and a rate greater than zero are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payee = await onCreate(form);
      onCreated(payee);
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
          Add to payroll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add team member or contractor</DialogTitle>
          <DialogDescription>
            They'll appear as active with no payment history until you run payroll for them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={form.role} onChange={(e) => update("role", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-type">Pay type</Label>
              <Select value={form.payType} onValueChange={(v) => update("payType", v as PayType)}>
                <SelectTrigger id="pay-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retainer">Retainer</SelectItem>
                  <SelectItem value="Per-project">Per-project</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => update("frequency", v as PayFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Biweekly">Biweekly</SelectItem>
                  <SelectItem value="One-off">One-off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">Rate (NGN)</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              value={form.rate || ""}
              onChange={(e) => update("rate", Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
                placeholder="e.g. GTBank"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="account">Account (masked)</Label>
              <Input
                id="account"
                value={form.accountNumberMasked}
                onChange={(e) => update("accountNumberMasked", e.target.value)}
                placeholder="•••• 1234"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
