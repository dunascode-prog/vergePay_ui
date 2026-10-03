"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/components/app-data";
import { refreshSession } from "@/lib/api";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notifications";
import { AppNotification, LiveEvent } from "@/types/notification";

type Connection = "connecting" | "live" | "offline";
type LoadState = "loading" | "ready" | "error";

interface LiveUpdates {
  notifications: AppNotification[];
  unreadCount: number;
  listState: LoadState;
  hasMore: boolean;
  connection: Connection;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const LiveUpdatesContext = createContext<LiveUpdates | null>(null);

// Most to wait between reconnect attempts, and after a refusal (4403/4429).
const MAX_BACKOFF_MS = 30_000;
const REFUSED_RETRY_MS = 60_000;
// Several events in a burst (both sides of a transfer, a replayed batch)
// become one balance refresh.
const ACCOUNTS_DEBOUNCE_MS = 300;

// Shows a toast only for what the customer didn't just do themselves:
// money coming in, and identity decisions.
function shouldToast(n: AppNotification) {
  return n.direction === "credit" || n.kind === "kyc_approved" || n.kind === "kyc_rejected";
}

/**
 * Keeps the dashboard live. Holds one WebSocket to /v1/ws (proxied to the
 * API by the /v1 rewrite, so the session cookie goes with it) and:
 *  - refreshes balances and history when money moves (accounts.changed)
 *  - adds new alerts to the bell and toasts incoming money
 *  - re-reads everything after a reconnect, so nothing missed while offline
 *    is lost (the API's notifications are the durable copy)
 * The server closes the socket with 4401 when the short-lived access token
 * expires; the session is refreshed over HTTP and the socket reopened.
 */
export function LiveUpdatesProvider({ children }: { children: React.ReactNode }) {
  const { reloadAccounts, reloadUser } = useAppData();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listState, setListState] = useState<LoadState>("loading");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [connection, setConnection] = useState<Connection>("connecting");
  // ids already in the list, so a live alert is never shown or counted twice
  const known = useRef(new Set<string>());

  const reload = useCallback(async () => {
    try {
      const page = await listNotifications();
      for (const n of page.data) known.current.add(n.notification_id);
      setNotifications(page.data);
      setUnreadCount(page.unread_count);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
      setListState("ready");
    } catch {
      setListState((s) => (s === "ready" ? s : "error"));
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    const page = await listNotifications({ after: cursor });
    for (const n of page.data) known.current.add(n.notification_id);
    setNotifications((list) => [...list, ...page.data.filter((n) => !list.some((m) => m.notification_id === n.notification_id))]);
    setUnreadCount(page.unread_count);
    setCursor(page.next_cursor);
    setHasMore(page.has_more);
  }, [cursor]);

  const markRead = useCallback(async (notificationId: string) => {
    const now = new Date().toISOString();
    setNotifications((list) => list.map((n) => (n.notification_id === notificationId && !n.read_at ? { ...n, read_at: now } : n)));
    try {
      const result = await markNotificationRead(notificationId);
      setUnreadCount(result.unread_count);
    } catch {
      void reload();
    }
  }, [reload]);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((list) => list.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      void reload();
    }
  }, [reload]);

  // The socket lives for the whole session; the handlers it calls change, so
  // it reads them from a ref instead of reconnecting on every render.
  const handlers = useRef({ reloadAccounts, reloadUser, reload });
  useEffect(() => {
    handlers.current = { reloadAccounts, reloadUser, reload };
  }, [reloadAccounts, reloadUser, reload]);

  useEffect(() => {
    void handlers.current.reload();

    let socket: WebSocket | null = null;
    let stopped = false;
    let attempt = 0;
    let expiredInARow = 0;
    let everReady = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let accountsTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshAccountsSoon = () => {
      clearTimeout(accountsTimer);
      accountsTimer = setTimeout(() => void handlers.current.reloadAccounts(), ACCOUNTS_DEBOUNCE_MS);
    };

    const onEvent = (event: LiveEvent) => {
      switch (event.type) {
        case "accounts.changed":
          refreshAccountsSoon();
          break;
        case "user.changed":
          void handlers.current.reloadUser();
          break;
        case "notification.created": {
          const n = event.notification;
          // the same alert can arrive live and in a catch-up reload
          if (known.current.has(n.notification_id)) break;
          known.current.add(n.notification_id);
          setNotifications((list) => [n, ...list]);
          if (!n.read_at) setUnreadCount((c) => c + 1);
          if (shouldToast(n)) {
            const show = n.kind === "kyc_rejected" ? toast.error : toast.success;
            show(n.title, { description: n.body ?? undefined });
          }
          break;
        }
        case "notifications.read":
          if (event.all) {
            const now = new Date().toISOString();
            setNotifications((list) => list.map((n) => (n.read_at ? n : { ...n, read_at: now })));
            setUnreadCount(0);
          } else {
            // read in another tab: the count may include alerts not loaded here
            void handlers.current.reload();
          }
          break;
      }
    };

    const scheduleReconnect = (delay: number) => {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(open, delay);
    };

    function open() {
      if (stopped || socket) return;
      setConnection("connecting");
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${window.location.host}/v1/ws`);
      socket = ws;

      ws.onmessage = (message) => {
        let event: LiveEvent;
        try {
          event = JSON.parse(message.data);
        } catch {
          return;
        }
        if (event.type === "ready") {
          attempt = 0;
          expiredInARow = 0;
          setConnection("live");
          // back after a drop: catch up on anything missed meanwhile
          if (everReady) {
            refreshAccountsSoon();
            void handlers.current.reload();
            void handlers.current.reloadUser();
          }
          everReady = true;
          return;
        }
        onEvent(event);
      };

      ws.onclose = async (close) => {
        if (socket === ws) socket = null;
        if (stopped) return;
        setConnection("offline");

        if (close.code === 4401) {
          // the access token expired: refresh it, then reconnect straight away
          expiredInARow += 1;
          if (expiredInARow <= 2 && (await refreshSession())) return scheduleReconnect(0);
          // signed out for real: the next API call sends the browser to /signin
          return scheduleReconnect(REFUSED_RETRY_MS);
        }
        if (close.code === 4403 || close.code === 4429) return scheduleReconnect(REFUSED_RETRY_MS);

        const backoff = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt);
        attempt += 1;
        scheduleReconnect(backoff / 2 + Math.random() * (backoff / 2));
      };
    }

    // come back quickly when the network or the tab does
    const reconnectNow = () => {
      if (!socket && !stopped) {
        attempt = 0;
        scheduleReconnect(0);
      }
    };
    const onVisible = () => document.visibilityState === "visible" && reconnectNow();
    window.addEventListener("online", reconnectNow);
    document.addEventListener("visibilitychange", onVisible);

    open();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearTimeout(accountsTimer);
      window.removeEventListener("online", reconnectNow);
      document.removeEventListener("visibilitychange", onVisible);
      socket?.close(1000);
      socket = null;
    };
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, listState, hasMore, connection, loadMore, reload, markRead, markAllRead }),
    [notifications, unreadCount, listState, hasMore, connection, loadMore, reload, markRead, markAllRead],
  );
  return <LiveUpdatesContext.Provider value={value}>{children}</LiveUpdatesContext.Provider>;
}

export function useLiveUpdates(): LiveUpdates {
  const value = useContext(LiveUpdatesContext);
  if (!value) throw new Error("useLiveUpdates must be used inside <LiveUpdatesProvider>");
  return value;
}
