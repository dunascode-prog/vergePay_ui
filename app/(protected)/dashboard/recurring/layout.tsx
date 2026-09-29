import type { ReactNode } from "react";

// Centralizes the shared page chrome (background + max-width container) so
// page.tsx, loading.tsx, [id]/page.tsx, [id]/not-found.tsx, and new/page.tsx
// don't each repeat the same wrapper divs. This layout stays mounted across
// navigation between all of those routes.
export default function RecurringLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto">{children}</div>
    </div>
  );
}
