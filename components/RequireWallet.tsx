"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/app-data";
import { walletsOf } from "@/lib/ledger";

/**
 * The dashboard needs a wallet. Until the customer has created one (right
 * after sign-up), every dashboard page sends them to /onboarding.
 */
export function RequireWallet({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accounts, accountsState } = useAppData();
  const wallets = walletsOf(accounts);
  const missing = accountsState === "ready" && !wallets.personal && !wallets.business;

  useEffect(() => {
    if (missing) router.replace("/onboarding");
  }, [missing, router]);

  if (missing) return null;
  return <>{children}</>;
}
