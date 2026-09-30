"use client";

import Link from "next/link";
import { LucideIcon, Wallet, Building2, CirclePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountScope, useAppData } from "@/components/app-data";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { walletName, walletsOf } from "@/lib/ledger";

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

/** The sidebar's wallets: the customer's personal and business wallet, each opening that view. */
export function WalletsSidebarGroup() {
  const { accounts, accountsState } = useAppData();
  const [scope] = useAccountScope();
  const wallets = walletsOf(accounts);

  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="mb-2 px-2 text-[11px] uppercase tracking-widest">
        Wallets
      </SidebarGroupLabel>

      <SidebarGroupContent className="space-y-2">
        {accountsState === "loading" && (
          <>
            <Skeleton className="h-[86px] w-full rounded-xl" />
            <Skeleton className="h-[86px] w-full rounded-xl" />
          </>
        )}

        {accountsState === "error" && (
          <p className="px-2 text-xs text-muted-foreground">Couldn&apos;t load your wallets.</p>
        )}

        {accountsState === "ready" &&
          (["personal", "business"] as const).map((purpose) => {
            const wallet = wallets[purpose];
            if (!wallet) {
              return (
                <AddWalletDialog
                  key={purpose}
                  purpose={purpose}
                  trigger={
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <CirclePlus className="mr-2 size-4" />
                      Add a {walletName(purpose).toLowerCase()}
                    </Button>
                  }
                />
              );
            }
            return (
              <WalletCard
                key={purpose}
                href={`/dashboard?scope=${purpose}`}
                name={walletName(purpose)}
                balance={(wallet.balance_minor / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                currency={wallet.currency_code}
                description={
                  wallet.account_status === "frozen" ? `Frozen · ${wallet.account_number}` : wallet.account_number
                }
                icon={purpose === "business" ? Building2 : Wallet}
                active={scope === purpose}
              />
            );
          })}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
