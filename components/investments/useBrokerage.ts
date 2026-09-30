"use client";

import { useCallback, useEffect, useState } from "react";
import { listBrokerageLinks, listHoldings } from "@/services/brokerage";
import { BrokerageLink, Holding } from "@/types/brokerage";

type LoadState = "loading" | "ready" | "error";

/** The customer's brokerage link (if any) and synced holdings. */
export function useBrokerage() {
  const [links, setLinks] = useState<BrokerageLink[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const reload = useCallback(async () => {
    try {
      const [l, h] = await Promise.all([listBrokerageLinks(), listHoldings()]);
      setLinks(l);
      setHoldings(h);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on mount
    void reload();
  }, [reload]);

  // The newest link that isn't revoked (the API hides revoked ones).
  const link = links[0] ?? null;
  const linked = link?.link_status === "active";
  const syncing = linked && (link.last_sync_status === "queued" || link.last_sync_status === "running" || link.last_sync_status === "retrying");

  // While the first sync runs, check back a few times so holdings appear on their own.
  useEffect(() => {
    if (!syncing) return;
    const timer = setTimeout(() => void reload(), 4000);
    return () => clearTimeout(timer);
  }, [syncing, reload, links]);

  return { state, link, linked, syncing, holdings, reload };
}

export type BrokerageState = ReturnType<typeof useBrokerage>;
