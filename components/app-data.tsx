"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getMe } from "@/services/auth";
import { listAccounts } from "@/services/accounts";
import { UserProfile } from "@/types/auth";
import { Account } from "@/types/account";
import { AccountScope } from "@/lib/ledger";

type LoadState = "loading" | "ready" | "error";

interface AppData {
  user: UserProfile | null;
  accounts: Account[];
  accountsState: LoadState;
  /** Re-fetch accounts, e.g. after opening one or moving money. */
  reloadAccounts: () => Promise<void>;
  /** Re-fetch the profile, e.g. after identity verification or turning 2FA on. */
  reloadUser: () => Promise<void>;
  /** Goes up every time accounts are reloaded, so views of transactions know to refetch. */
  dataVersion: number;
}

const AppDataContext = createContext<AppData | null>(null);

// Loads the signed-in user and their accounts once for the whole dashboard,
// so the top bar, sidebar and pages share one copy instead of each fetching.
// A 401 is handled inside api(): it refreshes the session or goes to /signin.
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsState, setAccountsState] = useState<LoadState>("loading");
  const [dataVersion, setDataVersion] = useState(0);

  const reloadAccounts = useCallback(async () => {
    try {
      setAccounts(await listAccounts());
      setAccountsState("ready");
      setDataVersion((v) => v + 1);
    } catch {
      setAccountsState("error");
    }
  }, []);

  const reloadUser = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      // keep the last known profile; a 401 is handled inside api()
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on mount
    void reloadUser();
    void reloadAccounts();
  }, [reloadAccounts, reloadUser]);

  const value = useMemo(
    () => ({ user, accounts, accountsState, reloadAccounts, reloadUser, dataVersion }),
    [user, accounts, accountsState, reloadAccounts, reloadUser, dataVersion],
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside <AppDataProvider>");
  return value;
}

const SCOPES: AccountScope[] = ["personal", "business", "combined"];

/**
 * The Personal / Business / Combined choice, kept in the URL (?scope=) so the
 * top bar, sidebar and page agree and a refresh or shared link keeps it.
 * Default: combined, i.e. everything.
 */
export function useAccountScope(): [AccountScope, (scope: AccountScope) => void] {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const raw = params.get("scope");
  const scope: AccountScope = SCOPES.includes(raw as AccountScope) ? (raw as AccountScope) : "combined";

  const setScope = useCallback(
    (next: AccountScope) => {
      const query = new URLSearchParams(params.toString());
      if (next === "combined") query.delete("scope");
      else query.set("scope", next);
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
  return [scope, setScope];
}
