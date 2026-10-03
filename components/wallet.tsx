"use client";

import Link from "next/link";
import { Building2, CirclePlus, Wallet } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountScope, useAppData } from "@/components/app-data";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";

const LABEL = { personal: "Personal", business: "Business" } as const;

/**
 * The sidebar's wallets: one slim row each (name, the last digits of the
 * account number, balance), opening that wallet's view of the dashboard.
 */
export function WalletsSidebarGroup() {
  const { accounts, accountsState } = useAppData();
  const [scope] = useAccountScope();
  const wallets = walletsOf(accounts);

  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="px-2 text-[11px] tracking-widest uppercase">Wallets</SidebarGroupLabel>

      <SidebarGroupContent>
        {accountsState === "loading" && (
          <div className="space-y-1 px-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        )}

        {accountsState === "error" && <p className="px-2 text-xs text-muted-foreground">Couldn&apos;t load your wallets.</p>}

        {accountsState === "ready" && (
          <ul className="space-y-0.5">
            {(["personal", "business"] as const).map((purpose) => {
              const wallet = wallets[purpose];
              const Icon = purpose === "business" ? Building2 : Wallet;
              if (!wallet) {
                return (
                  <li key={purpose}>
                    <AddWalletDialog
                      purpose={purpose}
                      trigger={
                        <button
                          type="button"
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                        >
                          <CirclePlus className="size-4 shrink-0" />
                          Add a {walletName(purpose).toLowerCase()}
                        </button>
                      }
                    />
                  </li>
                );
              }
              const active = scope === purpose;
              const frozen = wallet.account_status === "frozen";
              return (
                <li key={purpose}>
                  <Link
                    href={`/dashboard?scope=${purpose}`}
                    aria-current={active ? "page" : undefined}
                    title={`${walletName(purpose)} · ${wallet.account_number}${frozen ? " · frozen" : ""}`}
                    className={cn(
                      "flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors hover:bg-sidebar-accent",
                      active && "bg-sidebar-accent font-medium",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{LABEL[purpose]}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ••{wallet.account_number.slice(-4)}
                      {frozen && " · frozen"}
                    </span>
                    <span className="ml-auto text-xs font-medium tabular-nums">
                      {formatMinor(wallet.balance_minor, wallet.currency_code, { compact: true })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
