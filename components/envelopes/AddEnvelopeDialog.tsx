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
import { CreateEnvelopeInput } from "@/data/mock-envelopes";
import { Envelope } from "@/types/envelope";
import { Currency } from "@/types/invoice";
import { ALL_CATEGORIES, CATEGORY_COLORS } from "@/lib/expense-category";

interface AddEnvelopeDialogProps {
  onCreate: (input: CreateEnvelopeInput) => Promise<Envelope>;
  onCreated: (envelope: Envelope) => void;
  existingLinkedCategories: string[];
}

const CUSTOM_COLORS = ["bg-indigo-500", "bg-rose-500", "bg-teal-500", "bg-fuchsia-500"];

export function AddEnvelopeDialog({
  onCreate,
  onCreated,
  existingLinkedCategories,
}: AddEnvelopeDialogProps) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"linked" | "custom">("custom");
  const [name, setName] = useState("");
  const [linkedCategory, setLinkedCategory] = useState<string>("");
  const [allocated, setAllocated] = useState(0);
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = ALL_CATEGORIES.filter((c) => !existingLinkedCategories.includes(c));

  const isValid =
    allocated > 0 && (kind === "custom" ? name.trim() !== "" : linkedCategory !== "");

  async function handleSubmit() {
    if (!isValid) {
      setError(
        kind === "custom"
          ? "A name and an allocation greater than zero are required."
          : "Choose a category and an allocation greater than zero."
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const input: CreateEnvelopeInput =
        kind === "custom"
          ? {
              name,
              allocated,
              currency,
              linkedCategory: null,
              colorClass: CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)],
            }
          : {
              name: linkedCategory,
              allocated,
              currency,
              linkedCategory: linkedCategory as CreateEnvelopeInput["linkedCategory"],
              colorClass: CATEGORY_COLORS[linkedCategory as keyof typeof CATEGORY_COLORS],
            };

      const envelope = await onCreate(input);
      onCreated(envelope);
      setName("");
      setLinkedCategory("");
      setAllocated(0);
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
          New envelope
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New envelope</DialogTitle>
          <DialogDescription>
            Link to an Expenses category to track spend automatically, or create a custom envelope
            you'll manage manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "linked" | "custom")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom envelope</SelectItem>
                <SelectItem value="linked">Linked to an Expenses category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {kind === "custom" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Equipment upgrade fund"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={linkedCategory} onValueChange={setLinkedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      All categories already have an envelope
                    </SelectItem>
                  ) : (
                    availableCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="allocated">Allocation</Label>
              <Input
                id="allocated"
                type="number"
                min={0}
                value={allocated || ""}
                onChange={(e) => setAllocated(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
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
            {submitting ? "Creating…" : "Create envelope"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
