import { RecurringFrequency } from "@/types/recurring";

// Mirrors the multiplier used in the Recurring Billing page's summary cards.
// Kept in sync manually across the two feature folders for now — a good
// candidate to extract into one shared package once both pages live in the
// same codebase.
const MONTHLY_MULTIPLIER: Record<RecurringFrequency, number> = {
  weekly: 4.33,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

export function monthlyEquivalent(amount: number, frequency: RecurringFrequency): number {
  return amount * MONTHLY_MULTIPLIER[frequency];
}
