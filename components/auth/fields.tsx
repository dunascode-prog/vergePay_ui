"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LuCheck, LuX } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Shared pieces of the sign-in and sign-up forms, so both screens look the same.

/** Taller than the app's default controls, as on most fintech auth screens. */
export const authInputClass = "h-11 rounded-lg px-3 text-base md:text-sm";
export const authSubmitClass =
  "mt-1 h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800";
export const authLinkClass = "font-medium text-emerald-700 hover:underline";

export function AuthHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <header className="mb-8 space-y-2">
      {icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          {icon}
        </span>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}

export function AuthNotice({ tone, children }: { tone: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm",
        tone === "error"
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {children}
    </div>
  );
}

/** A password input with a show/hide button. Works with react-hook-form's register(). */
export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={shown ? "text" : "password"}
        className={cn(authInputClass, "pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

// The API's password rules (vergePay_api utils/passwordRules.js), for signing
// up and resetting a password, shown live as a checklist.
export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "Upper and lowercase letters", test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A special character", test: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]';`~]/.test(v) },
];

/** Live checklist under a new password. Unmet rules turn red once the form was submitted. */
export function PasswordChecklist({
  rules,
  value,
  showErrors,
}: {
  rules: PasswordRule[];
  value: string;
  showErrors: boolean;
}) {
  return (
    <ul id="password-rules" className="grid gap-1.5 text-xs sm:grid-cols-2">
      {rules.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              met ? "text-emerald-700" : showErrors ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {met || !showErrors ? (
              <LuCheck className={cn("h-3.5 w-3.5", !met && "opacity-40")} />
            ) : (
              <LuX className="h-3.5 w-3.5" />
            )}
            {rule.label}
            <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
