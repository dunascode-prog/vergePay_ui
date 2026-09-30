"use client";

import { LineChart, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMinor } from "@/lib/ledger";
import { LinkAlpacaDialog } from "./LinkAlpacaDialog";
import type { BrokerageState } from "./useBrokerage";

const TOP = 4;
const timeAgo = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function syncedLabel(iso: string | null) {
  if (!iso) return "Not synced yet";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `Synced ${timeAgo.format(-minutes, "minute")}`;
  return `Synced ${timeAgo.format(-Math.round(minutes / 60), "hour")}`;
}

/**
 * Always on the dashboard, but optional: until the customer links Alpaca it
 * invites them to; once linked it shows their synced holdings.
 */
export function InvestmentsCard({ brokerage }: { brokerage: BrokerageState }) {
  const { state, link, linked, syncing, holdings, reload } = brokerage;
  const currency = holdings[0]?.security.currency_code ?? "USD";
  const total = holdings.reduce((sum, h) => sum + (h.market_value_minor ?? 0), 0);
  const pl = holdings.reduce((sum, h) => sum + (h.unrealized_pl_minor ?? 0), 0);

  const linkButton = (label: string, variant: "primary" | "outline" = "primary") => (
    <LinkAlpacaDialog
      onLinked={() => void reload()}
      trigger={
        <Button
          variant={variant === "outline" ? "outline" : "default"}
          className={cn(variant === "primary" && "bg-emerald-700 text-white hover:bg-emerald-800")}
        >
          {label}
        </Button>
      }
    />
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="size-4 text-emerald-700" aria-hidden />
            Investments
          </CardTitle>
          <CardDescription>
            {linked ? `Alpaca ${link?.provider_account ?? ""} · ${syncedLabel(link?.last_synced_at ?? null)}` : "Optional · via Alpaca"}
          </CardDescription>
        </div>
        {syncing && <Badge variant="secondary">Syncing…</Badge>}
        {link?.link_status === "expired" && <Badge variant="secondary">Needs reconnecting</Badge>}
      </CardHeader>

      <CardContent>
        {state === "loading" && <Skeleton className="h-24 w-full rounded-lg" />}

        {state === "error" && (
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            Couldn&apos;t load your investments.
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              <RefreshCw className="mr-1.5 size-4" /> Retry
            </Button>
          </div>
        )}

        {state === "ready" && !linked && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {link?.link_status === "expired"
                ? "Alpaca stopped sharing your holdings. Reconnect to keep them up to date."
                : "Link your Alpaca brokerage account to see your stocks and crypto alongside your money."}
            </p>
            {linkButton(link?.link_status === "expired" ? "Reconnect Alpaca" : "Link Alpaca")}
          </div>
        )}

        {state === "ready" && linked && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Portfolio value</p>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{formatMinor(total, currency)}</p>
              {holdings.length > 0 && (
                <p
                  className={cn(
                    "text-sm tabular-nums",
                    pl >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatMinor(pl, currency, { signed: true })} unrealised
                </p>
              )}
            </div>

            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {syncing ? "Fetching your holdings from Alpaca…" : "No holdings in this account yet."}
              </p>
            ) : (
              <ul className="divide-y">
                {holdings.slice(0, TOP).map((h) => (
                  <li key={h.holding_id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.security.ticker_symbol}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {h.quantity} · {h.security.company_name ?? h.security.asset_type}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {h.market_value_minor === null ? "—" : formatMinor(h.market_value_minor, h.security.currency_code)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {holdings.length > TOP && (
              <p className="text-xs text-muted-foreground">+{holdings.length - TOP} more holdings</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
