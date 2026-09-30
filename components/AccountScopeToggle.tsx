"use client";

import { SegmentedToggle, SegmentedOption } from "./SegmentedToggle";
import { useAccountScope } from "./app-data";
import type { AccountScope } from "@/lib/ledger";

export type { AccountScope };

const OPTIONS: SegmentedOption<AccountScope>[] = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
  { value: "combined", label: "Combined" },
];

/**
 * Which accounts the dashboard shows: personal, business, or both. The choice
 * lives in the URL (?scope=), so every part of the page agrees on it.
 */
export function AccountScopeToggle() {
  const [current, setScope] = useAccountScope();

  return (
    <>
      {/* Tablet and up: segmented control */}
      <div className="hidden sm:block">
        <SegmentedToggle
          options={OPTIONS}
          value={current}
          onChange={setScope}
          aria-label="Account scope"
        />
      </div>

      {/* Phones: the same choice as a compact select */}
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="account-scope-select">
          Account scope
        </label>
        <select
          id="account-scope-select"
          value={current}
          onChange={(e) => setScope(e.target.value as AccountScope)}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm font-medium text-foreground"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
