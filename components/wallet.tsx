"use client";

import Link from "next/link";
import { Building2, CirclePlus, Wallet } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountScope, useAppData } from "@/components/app-data";
import { AddWalletDialog } from "@/components/accounts/AddWalletDialog";
import { formatMinor, walletName, walletsOf } from "@/lib/ledger";
import { cn } from "@/lib/utils";
import { GroupToggle } from "./sidebar-group-toggle";

const LABEL = { personal: "Personal", business: "Business" } as const;

/**
 * The sidebar's wallets: one row each (name, the last digits of the account
 * number, balance), opening that wallet's view of Home. Collapsed, just the
 * icons, with the balance in the tooltip.
 */
export function WalletsSidebarGroup({
  collapsed = false,
  onNavigate,
  open = true,
  onToggle,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  open?: boolean;
  onToggle?: () => void;
}) {
  const { accounts, accountsState } = useAppData();
  const [scope] = useAccountScope();
  const wallets = walletsOf(accounts);

  return (
    <SidebarGroup className="py-0.5">
      <GroupToggle title="Wallets" open={open} onToggle={() => onToggle?.()} />
      {open && (
      <SidebarGroupContent className="mt-0.5">
        {accountsState === "loading" && !collapsed && (
          <div className="space-y-1 px-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        )}
        {accountsState === "error" && !collapsed && <p className="px-2 text-xs text-muted-foreground">Couldn&apos;t load your wallets.</p>}

        {accountsState === "ready" && (
          <SidebarMenu className="gap-0.5">
            {(["personal", "business"] as const).map((purpose) => {
              const wallet = wallets[purpose];
              const Icon = purpose === "business" ? Building2 : Wallet;
              if (!wallet) {
                if (collapsed) return null;
                return (
                  <SidebarMenuItem key={purpose}>
                    <AddWalletDialog
                      purpose={purpose}
                      trigger={
                        <SidebarMenuButton className="h-8 text-sm text-muted-foreground hover:text-foreground">
                          <CirclePlus />
                          <span>Add a {walletName(purpose).toLowerCase()}</span>
                        </SidebarMenuButton>
                      }
                    />
                  </SidebarMenuItem>
                );
              }
              const active = scope === purpose;
              const frozen = wallet.account_status === "frozen";
              const balance = formatMinor(wallet.balance_minor, wallet.currency_code, { compact: true });
              return (
                <SidebarMenuItem key={purpose}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={`${walletName(purpose)} · ${balance}`}
                    className="h-8 text-sm text-muted-foreground hover:text-foreground data-active:text-foreground"
                    render={
                      <Link
                        href={`/dashboard?scope=${purpose}`}
                        onClick={onNavigate}
                        title={`${walletName(purpose)} · ${wallet.account_number}${frozen ? " · frozen" : ""}`}
                      />
                    }
                  >
                    <Icon className={cn(active && "text-emerald-700 dark:text-emerald-400")} />
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span className="truncate">{LABEL[purpose]}</span>
                      <span className="text-[13px] text-muted-foreground tabular-nums">
                        ••{wallet.account_number.slice(-4)}
                        {frozen && " · frozen"}
                      </span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">{balance}</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}
