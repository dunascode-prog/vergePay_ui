"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvoiceFilter } from "@/types/invoice";

interface FilterOption {
  value: InvoiceFilter;
  label: string;
}

const FILTERS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
];

interface InvoiceFiltersProps {
  value: InvoiceFilter;
  onChange: (value: InvoiceFilter) => void;
}

export function InvoiceFilters({ value, onChange }: InvoiceFiltersProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter invoices by status"
      className="flex flex-wrap items-center gap-2"
    >
      {FILTERS.map((filter) => {
        const active = filter.value === value;
        return (
          <Button
            key={filter.value}
            type="button"
            role="radio"
            aria-checked={active}
            variant="ghost"
            size="sm"
            onClick={() => onChange(filter.value)}
            className={cn(
              "rounded-full px-5 transition-colors",
              active
                ? "bg-emerald-700 text-white hover:bg-emerald-700 hover:text-white"
                : "border border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
