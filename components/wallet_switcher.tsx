import { CirclePlus } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { WalletCard } from "./wallet";

export function WalletSwitcher() {
  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="mb-2 px-2 text-[11px] uppercase tracking-widest">
        Wallets
      </SidebarGroupLabel>

      <SidebarGroupContent className="space-y-2">
        <WalletCard
          href="/wallets/personal"
          name="Personal Wallet"
          balance="$600,000"
          description="Main spending wallet"
          color="green"
          active
        />

        <WalletCard
          href="/wallets/business"
          name="Business Wallet"
          balance="$300,000"
          description="Client payments"
          color="blue"
        />

        <Button variant="ghost" className="w-full justify-start rounded-xl">
          <CirclePlus className="mr-2 size-4" />
          Add Wallet
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
