"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  href: string;
  name: string;
  balance: string;
  currency: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
}

export function WalletCard({
  href,
  name,
  balance,
  currency,
  description,
  icon: Icon,
  active,
}: WalletCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block rounded-xl border border-border bg-card p-3.5 transition-colors",
        "hover:border-primary/30 hover:bg-accent/50",
        active && "border-primary/40 bg-accent/60",
      )}
    >
      {/* ledger-style active rail */}
      <span
        className={cn(
          "absolute inset-y-3 left-0 w-[3px] rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">{name}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {active && (
          <Badge
            variant="secondary"
            className="shrink-0 text-[10px] font-medium"
          >
            Viewing
          </Badge>
        )}
      </div>

      <div className="mt-3.5 flex items-baseline gap-1.5">
        <span className="text-lg font-semibold tracking-tight tabular-nums">
          {balance}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {currency}
        </span>
      </div>
    </Link>
  );
}
