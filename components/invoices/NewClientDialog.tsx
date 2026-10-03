"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNote } from "@/components/money/parts";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { ApiError } from "@/lib/api";
import { createClient } from "@/services/invoices";
import { ApiClient } from "@/types/invoicing";

/** Adds a client to the book without leaving the invoice form. */
export function NewClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (client: ApiClient) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter the client's or business's name.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFormError(null);
    try {
      const client = await createClient({
        name: name.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
      setName("");
      setEmail("");
      setPhone("");
      onCreated(client);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors()).length) setErrors(err.fieldErrors());
      else setFormError(err instanceof ApiError ? err.message : "Couldn't add the client. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>Who you&apos;re billing. They don&apos;t need a VergePay account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field id="client-name" label="Name" error={errors.name}>
            <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. TechCorp Ltd" autoFocus aria-invalid={!!errors.name} className="h-11" />
          </Field>
          <Field id="client-email" label="Email" hint="Invoices and reminders are sent here." error={errors.email}>
            <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@techcorp.com" aria-invalid={!!errors.email} className="h-11" />
          </Field>
          <Field id="client-phone" label="Phone (optional)" error={errors.phone}>
            <Input id="client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" aria-invalid={!!errors.phone} className="h-11" />
          </Field>
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <Button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Adding…" : "Add client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
