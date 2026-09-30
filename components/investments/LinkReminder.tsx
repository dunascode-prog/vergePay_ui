"use client";

import { useState } from "react";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkAlpacaDialog } from "./LinkAlpacaDialog";
import type { BrokerageState } from "./useBrokerage";

// "Not now" hides the reminder for three days, then it comes back until the
// customer links their brokerage. Stored per browser; that's all it needs.
const SNOOZE_KEY = "vergepay.linkReminder.snoozedUntil";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

function snoozedNow(): boolean {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export function LinkReminder({ brokerage }: { brokerage: BrokerageState }) {
  // read once on mount; the dashboard is client-rendered after its data loads
  const [hidden, setHidden] = useState(snoozedNow);
  if (brokerage.state !== "ready" || brokerage.linked || hidden) return null;

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      // storage blocked: hide for this visit only
    }
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label="Link your brokerage"
      className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center dark:border-emerald-900 dark:bg-emerald-950/40"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        <LineChart className="size-5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">Track your investments here too</p>
        <p className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
          Link your Alpaca account to see your stocks and crypto next to your wallets.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <LinkAlpacaDialog
          onLinked={() => void brokerage.reload()}
          trigger={<Button className="bg-emerald-700 text-white hover:bg-emerald-800">Link Alpaca</Button>}
        />
        <Button variant="ghost" onClick={snooze} aria-label="Not now (remind me in 3 days)">
          Not now
        </Button>
      </div>
    </div>
  );
}
