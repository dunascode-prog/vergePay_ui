"use client";

import { Popover } from "@base-ui/react/popover";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Bell, BellOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useLiveUpdates } from "@/components/realtime/LiveUpdates";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppNotification } from "@/types/notification";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string, now: number) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (seconds > -45) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes > -60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (days > -7) return relative.format(days, "day");
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function KindIcon({ n }: { n: AppNotification }) {
  const base = "flex size-8 shrink-0 items-center justify-center rounded-full";
  if (n.kind === "kyc_approved") return <span className={cn(base, "bg-primary/10 text-primary")}><ShieldCheck className="size-4" /></span>;
  if (n.kind === "kyc_rejected") return <span className={cn(base, "bg-destructive/10 text-destructive")}><ShieldAlert className="size-4" /></span>;
  if (n.kind === "own_transfer") return <span className={cn(base, "bg-muted text-muted-foreground")}><ArrowLeftRight className="size-4" /></span>;
  if (n.direction === "credit") return <span className={cn(base, "bg-primary/10 text-primary")}><ArrowDownLeft className="size-4" /></span>;
  return <span className={cn(base, "bg-muted text-muted-foreground")}><ArrowUpRight className="size-4" /></span>;
}

/** The bell in the top bar: unread count, and the list of alerts. */
export function NotificationBell() {
  const { notifications, unreadCount, listState, hasMore, connection, loadMore, reload, markRead, markAllRead } = useLiveUpdates();
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // "5 minutes ago" is worked out when the panel opens, not on every render
  const [now, setNow] = useState(() => Date.now());

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setNow(Date.now());
          if (listState === "error") void reload();
        }
      }}
    >
      <Popover.Trigger
        render={
          <Button variant="secondary" size="icon" className="relative rounded-full" aria-label={label}>
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-background">
                {badge}
              </span>
            )}
          </Button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Popover.Popup className="w-[min(22rem,calc(100vw-2rem))] origin-(--transform-origin) overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Popover.Title className="text-sm font-semibold">Notifications</Popover.Title>
                {connection !== "live" && listState === "ready" && (
                  <span className="text-xs text-muted-foreground">{connection === "connecting" ? "Connecting…" : "Reconnecting…"}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button type="button" onClick={() => void markAllRead()} className="text-xs font-medium text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[min(26rem,70vh)] overflow-y-auto">
              {listState === "loading" && (
                <div className="space-y-3 p-4" aria-label="Loading notifications">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {listState === "error" && (
                <div className="px-4 py-8 text-center text-sm">
                  <p className="text-muted-foreground">We couldn&apos;t load your notifications.</p>
                  <button type="button" onClick={() => void reload()} className="mt-2 text-sm font-medium text-primary hover:underline">
                    Try again
                  </button>
                </div>
              )}

              {listState === "ready" && notifications.length === 0 && (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <BellOff className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium">You&apos;re all caught up</p>
                  <p className="mt-1 text-xs text-muted-foreground">Money in and out of your wallets shows up here.</p>
                </div>
              )}

              {listState === "ready" && notifications.length > 0 && (
                <ul className="divide-y">
                  {notifications.map((n) => (
                    <li key={n.notification_id}>
                      <button
                        type="button"
                        onClick={() => !n.read_at && void markRead(n.notification_id)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
                          !n.read_at && "bg-primary/[0.03]",
                        )}
                      >
                        <KindIcon n={n} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-sm leading-snug", n.read_at ? "text-foreground/80" : "font-medium")}>{n.title}</span>
                          {n.body && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.body}</span>}
                          <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.created_at, now)}</span>
                        </span>
                        {!n.read_at && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {listState === "ready" && hasMore && (
              <div className="border-t p-2">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={async () => {
                    setLoadingMore(true);
                    try {
                      await loadMore();
                    } finally {
                      setLoadingMore(false);
                    }
                  }}
                  className="w-full rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Show older"}
                </button>
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
