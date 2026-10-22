"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Monitor, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AccountScopeToggle } from "./AccountScopeToggle";
import { useAssistant } from "./assistant/AssistantProvider";
import { useAppData } from "./app-data";
import { CommandPalette, useCommandShortcut } from "./CommandPalette";
import { NotificationBell } from "./notifications/NotificationBell";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";
import { pageFor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * What the top bar does on each section, beyond its title (which comes from
 * lib/navigation.ts). The Personal / Business / Combined switch only shows
 * where the page follows it; a section's main action only on its own page,
 * not on its sub-pages (no "New invoice" while editing one).
 */
const SECTION_EXTRAS: Record<string, { scope?: boolean; action?: { label: string; href: string } }> = {
  "/dashboard": { scope: true },
  "/dashboard/analytics": { scope: true },
  "/dashboard/business": { scope: true },
  "/dashboard/invoices": { action: { label: "New invoice", href: "/dashboard/invoices/new" } },
  "/dashboard/recurring": { action: { label: "New plan", href: "/dashboard/recurring/new" } },
};

// pages reachable by link but not in the sidebar
const OTHER_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard/expenses": { title: "Expenses", description: "Sample data" },
  "/dashboard/envelopes": { title: "Envelopes", description: "Sample data" },
  "/dashboard/investments": { title: "Investments", description: "Your linked brokerage" },
  "/dashboard/payments": { title: "Payment", description: "Finishing your payment" },
};

function Greeting() {
  const { user } = useAppData();
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user ? user.first_name || user.username : null;
  // the server and the browser can be in different time zones
  return <span suppressHydrationWarning>{name ? `${part}, ${name}` : part}</span>;
}

function ThemeMenu() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative size-9 text-muted-foreground hover:text-foreground" aria-label="Theme">
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8}>
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
  );
}

/**
 * The top bar: the sidebar button and where you are on the left; search,
 * the account switch and the page's main action, then alerts and theme on
 * the right. 56px tall, the same as the sidebar's header, so their borders meet.
 */
const Navbar = ({ className }: React.ComponentProps<"header">) => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandShortcut(openSearch);
  const { openAssistant } = useAssistant();

  const other = Object.entries(OTHER_TITLES).find(([url]) => pathname.startsWith(url))?.[1];
  const page = pageFor(pathname);
  const title = other?.title ?? page.title;
  const extras = other ? {} : (SECTION_EXTRAS[page.url] ?? {});
  const onSectionRoot = pathname === page.url;
  const isHome = !other && page.url === "/dashboard";

  return (
    <header className={cn("flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 sm:px-6 xl:px-8", className)}>
      <SidebarTrigger className="size-9 text-muted-foreground hover:text-foreground" />
      <div className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm leading-tight font-semibold">{title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {isHome ? <Greeting /> : (other?.description ?? page.description)}
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search pages (Ctrl+K)"
          className="hidden h-9 w-56 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border bg-background px-1.5 font-mono text-[10px]" suppressHydrationWarning>
            {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform) ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground lg:hidden" onClick={openSearch} aria-label="Search pages">
          <Search className="size-4" />
        </Button>

        {extras.scope && <AccountScopeToggle />}

        {onSectionRoot && extras.action && (
          <Link href={extras.action.href} className={cn(buttonVariants(), "h-9 bg-emerald-700 text-white hover:bg-emerald-800")} aria-label={extras.action.label}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{extras.action.label}</span>
          </Link>
        )}

        <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openAssistant()}
          className="h-9 gap-1.5 px-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:px-2.5 dark:text-emerald-400 dark:hover:bg-emerald-950"
          aria-label="Ask VergePay"
        >
          <Sparkles className="size-4" />
          <span className="hidden text-sm font-medium md:inline">Ask</span>
        </Button>
        <NotificationBell />
        <ThemeMenu />
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Navbar;
