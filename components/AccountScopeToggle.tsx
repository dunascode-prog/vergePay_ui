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
      {/* Desktop: segmented control */}
      <div className="hidden lg:block">
        <SegmentedToggle
          options={OPTIONS}
          value={current}
          onChange={setScope}
          aria-label="Account scope"
        />
      </div>

      {/* Mobile/tablet: same choice, no control lost below the lg breakpoint */}
      <div className="lg:hidden">
        <label className="sr-only" htmlFor="account-scope-select">
          Account scope
        </label>
        <select
          id="account-scope-select"
          value={current}
          onChange={(e) => setScope(e.target.value as AccountScope)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground"
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
