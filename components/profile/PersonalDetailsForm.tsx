"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/components/app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/services/profile";
import { ProfileUpdate, UserProfile } from "@/types/auth";

type Field = keyof Required<ProfileUpdate>;
type Values = Record<Field, string>;

const FIELDS: { name: Field; label: string; autoComplete: string; identity?: boolean; optional?: boolean; wide?: boolean; type?: string; max: number }[] = [
  { name: "first_name", label: "First name", autoComplete: "given-name", identity: true, max: 80 },
  { name: "last_name", label: "Last name", autoComplete: "family-name", identity: true, max: 80 },
  { name: "date_of_birth", label: "Date of birth", autoComplete: "bday", identity: true, type: "date", max: 10 },
  { name: "city", label: "City", autoComplete: "address-level2", max: 100 },
  { name: "present_address", label: "Home address", autoComplete: "street-address", wide: true, max: 255 },
  { name: "permanent_address", label: "Permanent address", autoComplete: "off", wide: true, max: 255 },
  { name: "postal_code", label: "Postal code", autoComplete: "postal-code", optional: true, max: 20 },
];

const initialValues = (user: UserProfile): Values =>
  Object.fromEntries(FIELDS.map(({ name }) => [name, user[name] ?? ""])) as Values;

/**
 * The profile's personal details. Only changed fields are sent. Name and date
 * of birth lock once identity verification starts (the API refuses them), so
 * they're shown read-only then.
 */
export function PersonalDetailsForm({ user }: { user: UserProfile }) {
  const { reloadUser } = useAppData();
  const [saved, setSaved] = useState<Values>(() => initialValues(user));
  const [values, setValues] = useState<Values>(saved);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const identityLocked = user.kyc_status === "pending" || user.kyc_status === "verified";

  const changed = FIELDS.filter(({ name }) => values[name].trim() !== saved[name].trim());

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const next: Partial<Record<Field, string>> = {};
    const body: ProfileUpdate = {};
    for (const field of changed) {
      const value = values[field.name].trim();
      if (!value) {
        if (field.optional) body[field.name] = null;
        else next[field.name] = `${field.label} can't be empty.`;
        continue;
      }
      body[field.name] = value;
    }
    setErrors(next);
    if (Object.keys(next).length || !Object.keys(body).length) return;

    setBusy(true);
    try {
      const updated = await updateProfile(body);
      const fresh = initialValues(updated);
      setSaved(fresh);
      setValues(fresh);
      toast.success("Your details are saved.");
      void reloadUser();
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      const known = Object.entries(fields).filter(([f]) => FIELDS.some((x) => x.name === f));
      if (known.length) setErrors(Object.fromEntries(known));
      else setFormError(err instanceof ApiError ? err.message : "We couldn't save your details. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {identityLocked && (
        <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your name and date of birth are locked because they were used to verify your identity.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const locked = field.identity && identityLocked;
          const error = errors[field.name];
          const id = `profile-${field.name}`;
          return (
            <div key={field.name} className={cn("space-y-2", field.wide && "sm:col-span-2")}>
              <Label htmlFor={id} className="flex items-center gap-1.5">
                {field.label}
                {field.optional && <span className="font-normal text-muted-foreground">(optional)</span>}
                {locked && <Lock className="size-3 text-muted-foreground" aria-label="locked" />}
              </Label>
              <Input
                id={id}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                maxLength={field.max}
                className="h-10 rounded-lg"
                value={values[field.name]}
                readOnly={locked}
                disabled={locked}
                aria-invalid={Boolean(error)}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          );
        })}
      </div>

      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {changed.length > 0 && (
          <Button type="button" variant="ghost" onClick={() => { setValues(saved); setErrors({}); }} disabled={busy}>
            Discard changes
          </Button>
        )}
        <Button type="submit" disabled={busy || changed.length === 0} className="bg-emerald-700 text-white hover:bg-emerald-800">
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
