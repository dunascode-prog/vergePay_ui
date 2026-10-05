import type { ReactNode } from "react";

// The dashboard layout already gives every page its padding and width, so the
// recurring pages add nothing of their own (like invoices and analytics).
export default function RecurringLayout({ children }: { children: ReactNode }) {
  return children;
}
