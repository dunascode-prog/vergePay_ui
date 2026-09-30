"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SYMBOL: Record<string, string> = { NGN: "₦", USD: "$" };

/** "12,500.5" → 1250050 (minor units), or null when it isn't a valid amount. */
export function toMinor(text: string): number | null {
  const clean = text.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null;
  const minor = Math.round(Number(clean) * 100);
  return minor > 0 ? minor : null;
}

// Adds thousands separators to what's typed, keeping any decimals as they are.
function group(text: string): string {
  const clean = text.replace(/[^\d.]/g, "");
  const [whole, ...rest] = clean.split(".");
  const decimals = rest.length ? "." + rest.join("").slice(0, 2) : "";
  const grouped = whole.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return grouped + decimals;
}

/**
 * A large amount field: currency symbol in front, commas as you type,
 * reports the value in minor units (kobo, cents) through onChange.
 */
export function MoneyInput({
  id,
  currency,
  onChange,
  invalid = false,
  autoFocus = false,
}: {
  id: string;
  currency: string;
  onChange: (minor: number | null) => void;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 rounded-xl border bg-background px-4 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-600/15",
        invalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/15",
      )}
    >
      <span className="text-2xl font-semibold text-muted-foreground" aria-hidden>
        {SYMBOL[currency] ?? currency}
      </span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="0.00"
        value={text}
        aria-invalid={invalid}
        onChange={(e) => {
          const next = group(e.target.value);
          setText(next);
          onChange(toMinor(next));
        }}
        className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
      />
      <span className="text-sm font-medium text-muted-foreground">{currency}</span>
    </div>
  );
}
