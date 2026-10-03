"use client";

import { useEffect, useState } from "react";
import { listAccountTransactionsSince } from "@/services/accounts";
import { ScopedTransaction } from "@/types/account";

export type LoadState = "loading" | "ready" | "error";

/**
 * Ledger lines for these accounts since `fromDate` (YYYY-MM-DD). Keyed on the
 * account ids, the start date and `version` (it goes up after money moves),
 * so it refetches when something changed, not on every render. A refetch
 * keeps the old lines on screen until the new ones arrive.
 */
export function useLedgerLines(accountIds: string[], version: number, fromDate: string) {
  const key = `${accountIds.join(",")}|${fromDate}`;
  const [lines, setLines] = useState<ScopedTransaction[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const [idList, from] = key.split("|");
    const ids = idList ? idList.split(",") : [];
    // only a different set of accounts or dates shows the skeleton again
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start of a fetch
    if (loadedKey !== key) setState("loading");
    Promise.all(
      ids.map(async (id) =>
        (await listAccountTransactionsSince(id, from)).map((line) => ({ ...line, account_id: id })),
      ),
    )
      .then((perAccount) => {
        if (cancelled) return;
        setLines(perAccount.flat());
        setState("ready");
        setLoadedKey(key);
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
    // loadedKey is read to decide on the skeleton, not a reason to refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt, version]);

  // Until lines for exactly these accounts and dates have arrived, it's
  // loading: otherwise the first render after a change would show the old
  // (or empty) lines as if they were the answer.
  const current = loadedKey === key;
  return {
    lines: current ? lines : [],
    state: current || state === "error" ? state : "loading",
    retry: () => setAttempt((n) => n + 1),
  };
}
