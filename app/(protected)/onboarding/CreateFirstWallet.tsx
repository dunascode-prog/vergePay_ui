"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthHeader } from "@/components/auth/fields";
import { useAppData } from "@/components/app-data";
import { CreateWalletForm } from "@/components/accounts/CreateWalletForm";
import { walletsOf } from "@/lib/ledger";

export function CreateFirstWallet() {
  const router = useRouter();
  const { user, accounts, accountsState } = useAppData();
  const wallets = walletsOf(accounts);
  const hasWallet = Boolean(wallets.personal || wallets.business);

  // Someone who already has a wallet doesn't need this screen.
  useEffect(() => {
    if (accountsState === "ready" && hasWallet) router.replace("/dashboard");
  }, [accountsState, hasWallet, router]);

  if (accountsState !== "ready" || hasWallet) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthHeader
        title={user?.first_name ? `Welcome, ${user.first_name}` : "Create your wallet"}
        subtitle="Choose the wallet you'll use first. You can add the other one later."
      />
      <CreateWalletForm submitLabel="Create wallet" onCreated={() => router.replace("/dashboard")} />
    </div>
  );
}
