"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { buttonVariants } from "./ui/button";
import { AccountScopeToggle } from "./AccountScopeToggle";
import { useAppData } from "./app-data";
import { cn } from "@/lib/utils";

// The top bar: where you are, and the one or two things you can do there.
// Nothing that doesn't work yet (search, notifications) and nothing that has
// a better home (theme lives in the user menu).

interface Section {
  /** Matches this path and everything under it. */
  path: string;
  title: string;
  /** Shows the Personal / Business / Combined toggle (only where the page uses it). */
  scope?: boolean;
  /** The page's main action, shown on its root route only (not on /[id]/edit etc.). */
  action?: { label: string; href: string };
}

// Most specific first; the dashboard home is the fallback.
const SECTIONS: Section[] = [
  { path: "/dashboard/analytics", title: "Analytics" },
  { path: "/dashboard/invoices", title: "Invoices", action: { label: "New invoice", href: "/dashboard/invoices/new" } },
  { path: "/dashboard/recurring", title: "Recurring billing", action: { label: "New plan", href: "/dashboard/recurring/new" } },
  { path: "/dashboard/clients", title: "Clients" },
  { path: "/dashboard/business", title: "Business overview" },
  { path: "/dashboard/expenses", title: "Expenses" },
  { path: "/dashboard/payroll", title: "Payroll" },
  { path: "/dashboard/goals", title: "Goals" },
  { path: "/dashboard/envelopes", title: "Envelopes" },
];
const HOME: Section = { path: "/dashboard", title: "Dashboard", scope: true };

function sectionFor(pathname: string): Section {
  return SECTIONS.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`)) ?? HOME;
}

function Greeting() {
  const { user } = useAppData();
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user ? user.first_name || user.username : null;
  // the server and the browser can be in different time zones
  return <span suppressHydrationWarning>{name ? `${part}, ${name}` : part}</span>;
}

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const section = sectionFor(pathname);
  const isHome = section === HOME;
  const action = pathname === section.path ? section.action : undefined;

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between gap-3 bg-background/85 px-3 backdrop-blur supports-backdrop-filter:bg-background/70 sm:px-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* phones only: on larger screens the sidebar has its own collapse button */}
        <SidebarTrigger className="-ml-1 shrink-0 md:hidden" />
        <div className="min-w-0 leading-tight">
          {isHome && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              <Greeting />
            </p>
          )}
          <h1 className="truncate text-base font-semibold tracking-tight">{section.title}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {section.scope && <AccountScopeToggle />}
        {action && (
          <Link
            href={action.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 gap-1.5 rounded-lg bg-emerald-700 px-3 text-white hover:bg-emerald-800",
            )}
            aria-label={action.label}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">{action.label}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
