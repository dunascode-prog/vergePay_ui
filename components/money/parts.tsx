"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { cn } from "@/lib/utils";

/** A title and a short line under it, at the top of each money step. */
export function StepHeader({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/** One line of a review or receipt: label on the left, value on the right. */
export function SummaryRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right", strong ? "text-base font-semibold tabular-nums" : "font-medium")}>{value}</span>
    </div>
  );
}

export function Summary({ children }: { children: React.ReactNode }) {
  return <div className="divide-y rounded-xl border bg-muted/30 px-4">{children}</div>;
}

function initials(name: string) {
  const parts = name.split(/[\s_]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Who the money goes to: initials, name, account number. */
export function Party({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
        {initials(name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground tabular-nums">{detail}</p>
      </div>
    </div>
  );
}

/** The last screen: a tick, what happened, the details, and Done. */
export function SuccessView({
  title,
  amount,
  children,
  onDone,
}: {
  title: string;
  amount: string;
  children?: React.ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Check className="size-7" />
        </span>
        <DialogTitle className="text-sm font-normal text-muted-foreground">{title}</DialogTitle>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{amount}</p>
      </div>
      {children}
      <Button onClick={onDone} className={primaryButton}>
        Done
      </Button>
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
      {children}
    </p>
  );
}

/** "a8f3c2e1-…" → "A8F3C2E1": a short reference to quote to support. */
export const shortRef = (id: string) => id.replace(/-/g, "").slice(0, 10).toUpperCase();
