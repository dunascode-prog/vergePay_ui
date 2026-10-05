"use client";

import { useState } from "react";
import { ErrorNote } from "@/components/money/parts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createClient, updateClient } from "@/services/invoices";
import { ApiClient, ClientFields } from "@/types/invoicing";

type Form = Record<"name" | "contact_name" | "email" | "phone" | "industry" | "location" | "notes", string> & { is_vip: boolean };

const fromClient = (c?: ApiClient | null): Form => ({
  name: c?.name ?? "",
  contact_name: c?.contact_name ?? "",
  email: c?.email ?? "",
  phone: c?.phone ?? "",
  industry: c?.industry ?? "",
  location: c?.location ?? "",
  notes: c?.notes ?? "",
  is_vip: c?.is_vip ?? false,
});

/** Add a client, or edit one (pass `client`). */
export function AddClientDialog({
  open,
  onOpenChange,
  client,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ApiClient | null;
  onSaved: (client: ApiClient) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* remounted on every open, so it starts from the client as it is now */}
        {open && <ClientForm client={client} onCancel={() => onOpenChange(false)} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}

function ClientForm({ client, onCancel, onSaved }: { client?: ApiClient | null; onCancel: () => void; onSaved: (c: ApiClient) => void }) {
  const [form, setForm] = useState<Form>(() => fromClient(client));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof Form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) return setErrors({ name: "Enter a name." });
    setBusy(true);
    setError(null);
    setErrors({});
    // empty fields: left out when adding, cleared when editing
    const value = (key: Exclude<keyof Form, "is_vip">) => form[key].trim() || (client ? null : undefined);
    const body: ClientFields = {
      name: form.name.trim(),
      email: value("email"),
      phone: value("phone"),
      contact_name: value("contact_name"),
      industry: value("industry"),
      location: value("location"),
      notes: value("notes"),
      is_vip: form.is_vip,
    };
    try {
      onSaved(client ? await updateClient(client.client_id, body) : await createClient(body));
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      setError(err instanceof ApiError ? err.message : "Couldn't save. Please try again.");
      setBusy(false);
    }
  };

  const field = (key: Exclude<keyof Form, "is_vip" | "notes">, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`client-${key}`}>{label}</Label>
      <Input id={`client-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={!!errors[key]} {...props} />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{client ? `Edit ${client.name}` : "Add a client"}</DialogTitle>
        <DialogDescription>
          {client ? "Changes show on invoices you send from now on." : "Only the name is needed. How they pay fills in as you invoice them."}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        {field("name", "Client or company name", { placeholder: "e.g. Northwind Studio", maxLength: 120 })}
        <div className="grid gap-3 sm:grid-cols-2">
          {field("contact_name", "Contact person", { placeholder: "e.g. Funke Ade", maxLength: 120 })}
          {field("industry", "Industry", { placeholder: "e.g. E-commerce", maxLength: 80 })}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("email", "Email", { type: "email", placeholder: "Where invoices are sent" })}
          {field("phone", "Phone", { type: "tel", placeholder: "+234 803 000 0000" })}
        </div>
        {field("location", "Location", { placeholder: "e.g. Yaba, Lagos", maxLength: 120 })}
        <div className="space-y-1.5">
          <Label htmlFor="client-notes">Notes (only you see these)</Label>
          <Textarea id="client-notes" rows={3} maxLength={2000} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Prefers WhatsApp, pays after the 25th…" />
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.is_vip} onChange={(e) => set("is_vip", e.target.checked)} className="accent-emerald-700" />
          Mark as a VIP client
        </label>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy} className="bg-emerald-700 text-white hover:bg-emerald-800">
            {busy ? "Saving…" : client ? "Save changes" : "Add client"}
          </Button>
        </div>
      </div>
    </>
  );
}
