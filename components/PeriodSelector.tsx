"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period } from "@/types/analytics";

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
}

const OPTIONS: { value: Period; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "this_year", label: "This year" },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Period)}>
      <TabsList>
        {OPTIONS.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value} className="text-sm">
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
