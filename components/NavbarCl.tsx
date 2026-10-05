"use client";
import { Monitor, Moon, Plus, Search, Sun } from "lucide-react";
import { useCallback, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

import { useTheme } from "next-themes";

import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { AccountScopeToggle } from "./AccountScopeToggle";
import { useAppData } from "./app-data";
import Link from "next/link";
import { NotificationBell } from "./notifications/NotificationBell";
import { CommandPalette, useCommandShortcut } from "./CommandPalette";

type PageTitle = {
  title: string;
  description: string;
};

type Section =
  | "dashboard"
  | "analytics"
  | "invoices"
  | "recurring"
  | "clients"
  | "business"
  | "loans";

interface HeaderAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionConfig extends PageTitle {
  /** Base path for this section — used to gate the header action to the list view only, not sub-routes like [id]/edit. */
  basePath: string;
  /** Whether the Personal/Business/Combined toggle applies to this section (and all its sub-routes). */
  showAccountScope: boolean;
  /** Only rendered when the current pathname is exactly `basePath` — not on detail/edit/new sub-routes. */
  headerAction?: HeaderAction;
}

const SECTION_CONFIG: Record<Section, SectionConfig> = {
  dashboard: {
    basePath: "/dashboard",
    title: "Dashboard",
    // replaced by <Greeting /> (time of day + the user's name) when rendered
    description: "Welcome back",
    showAccountScope: true,
    // "Add Money" comes back with funding (Step 3); it had nowhere to go yet.
  },
  analytics: {
    basePath: "/dashboard/analytics",
    title: "Analytics",
    description: "Financial health & habits",
    // real data now: follows the Personal / Business / Combined view
    showAccountScope: true,
    // An "Export report" button comes back once there's an export to link to.
  },
  invoices: {
    basePath: "/dashboard/invoices",
    title: "Invoices",
    description: "Manage client invoices in one place.",
    // the invoice list covers both wallets, so the Personal/Business toggle doesn't apply
    showAccountScope: false,
    headerAction: {
      label: "New Invoice",
      href: "/dashboard/invoices/new",
      icon: Plus,
    },
  },
  recurring: {
    basePath: "/dashboard/recurring",
    title: "Recurring Billing",
    description: "Manage Recurrent Billings Here",
    showAccountScope: false,
    headerAction: {
      label: "New Plan",
      href: "/dashboard/recurring/new",
      icon: Plus,
    },
  },
  business: {
    basePath: "/dashboard/business",
    title: "Business Overview",
    description: "Check Full Overview",
    showAccountScope: false,
    // headerAction: { label: "New Plan", href: "/dashboard/recurring/new", icon: Plus },
  },
  loans: {
    basePath: "/dashboard/loans",
    title: "Loans",
    description: "Borrow and repay",
    // each loan is in one wallet's currency and shown on its own
    showAccountScope: false,
    // "Apply for a loan" sits on the page, where it can hide while an application is in review
  },
  clients: {
    basePath: "/dashboard/clients",
    title: "Clients",
    description: "Your client relationships, in one place.",
    showAccountScope: false,
    // No header action here on purpose — the Clients page has its own
    // "Add client" trigger inline (opens a dialog, not a route). Wiring that
    // same dialog to a navbar button too would mean lifting its open state
    // out of the page and into shared context — a reasonable follow-up, but
    // out of scope for this pass.
  },
};

/**
 * Single source of truth for "what section is this route in." Every other
 * piece of route-dependent UI (title, account-scope toggle, header action)
 * reads from this instead of running its own separate pathname check — that
 * duplication is exactly how the title/toggle/button drifted out of sync
 * with each other in the first place.
 *
 * Prefix matching (not exact-match) is deliberate: it's what makes the
 * section stay correct on nested routes like /dashboard/invoices/[id]/edit,
 * not just on the bare list page.
 */
function resolveSection(pathname: string): Section {
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/invoices")) return "invoices";
  if (pathname.startsWith("/dashboard/recurring")) return "recurring";
  if (pathname.startsWith("/dashboard/clients")) return "clients";
  if (pathname.startsWith("/dashboard/business")) return "business";
  if (pathname.startsWith("/dashboard/loans")) return "loans";

  return "dashboard";
}

function Greeting() {
  const { user } = useAppData();
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user ? user.first_name || user.username : null;
  // the server and the browser can be in different time zones
  return <span suppressHydrationWarning>{name ? `${part}, ${name}` : part}</span>;
}

const Navbar = ({ className }: React.ComponentProps<"div">) => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandShortcut(openSearch);

  const section = resolveSection(pathname);
  const config = SECTION_CONFIG[section];
  const isSectionRoot = pathname === config.basePath;

  return (
    <div className={cn("flex flex-row items-center justify-between gap-2 px-3 py-3", className)}>
      <div className="flex min-w-0 flex-row items-center gap-1">
        <SidebarTrigger />
        <div className="min-w-0">
          <p className="-mb-1 hidden lg:flex">{section === "dashboard" ? <Greeting /> : config.description}</p>
          <h6 className="truncate">{config.title}</h6>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        {/* tools first: search, alerts, theme; always shown, whatever the sidebar's state */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={openSearch}
            aria-label="Search pages (Ctrl+K)"
            title="Search pages (Ctrl+K)"
          >
            <Search className="size-4" />
          </Button>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="secondary" size="icon" className="relative rounded-full" aria-label="Theme">
                  <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" sideOffset={10}>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {config.showAccountScope && <AccountScopeToggle />}

        {/*
          Only rendered on the section's own root route (e.g. /dashboard/invoices),
          not on its sub-routes (e.g. /dashboard/invoices/[id]/edit): "New Invoice"
          floating in the navbar while you're editing an existing invoice would be
          misleading.
        */}
        {isSectionRoot && config.headerAction && (
          <Link href={config.headerAction.href}>
            <Button className="bg-emerald-700 hover:bg-emerald-800">
              <config.headerAction.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.headerAction.label}</span>
            </Button>
          </Link>
        )}
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default Navbar;
