"use client";

import { useState } from "react";
import { SegmentedToggle, SegmentedOption } from "./SegmentedToggle";

export type AccountScope = "personal" | "business" | "combined";

const OPTIONS: SegmentedOption<AccountScope>[] = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
  { value: "combined", label: "Combined" },
];

interface AccountScopeToggleProps {
  value?: AccountScope;
  onChange?: (value: AccountScope) => void;
}

/**
 * Controls which wallet/ledger scope the dashboard is showing. Uncontrolled
 * by default (manages its own state) but accepts value/onChange if the page
 * needs to read or drive the selection itself.
 */
export function AccountScopeToggle({
  value,
  onChange,
}: AccountScopeToggleProps) {
  const [internalValue, setInternalValue] = useState<AccountScope>("personal");
  const current = value ?? internalValue;

  function handleChange(next: AccountScope) {
    setInternalValue(next);
    onChange?.(next);
  }

  return (
    <>
      {/* Desktop: segmented control */}
      <div className="hidden lg:block">
        <SegmentedToggle
          options={OPTIONS}
          value={current}
          onChange={handleChange}
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
          onChange={(e) => handleChange(e.target.value as AccountScope)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900"
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
