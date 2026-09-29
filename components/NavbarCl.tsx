"use client";
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Button } from "./ui/button";
import { LuDownload } from "react-icons/lu";
import { AccountScopeToggle } from "./AccountScopeToggle";
import Link from "next/link";

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
  | "business";

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
    description: "Good Morning, Seun",
    showAccountScope: true,
    // TODO: this button has nowhere to go yet (href=""). Either build the
    // "Add Money" destination/modal, or remove the Link wrapper until it does
    // — a Link with an empty href is a dead click right now.
    headerAction: { label: "Add Money", href: "", icon: Plus },
  },
  analytics: {
    basePath: "/dashboard/analytics",
    title: "Analytics",
    description: "Financial health & habits",
    showAccountScope: true,
    // Same issue as above — no real destination wired up yet.
    headerAction: { label: "Export Report", href: "", icon: LuDownload },
  },
  invoices: {
    basePath: "/dashboard/invoices",
    title: "Invoices",
    description: "Manage client invoices in one place.",
    showAccountScope: true,
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

  return "dashboard";
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const accounts = ["Personal", "Business", "Combined"];

interface AccountSwitcherProps {
  accountType: string;
  setAccountType: (value: string) => void;
}

/**
 * NOTE: no longer called from Navbar's own JSX below — it duplicated
 * AccountScopeToggle (which already has its own built-in desktop/mobile
 * split), and the two had entirely separate, unsynced state. Kept here,
 * still exported, in case something else in the app imports it directly.
 * If nothing does, this is safe to delete.
 */
export function AccountSwitcher({
  accountType,
  setAccountType,
}: AccountSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="lg:hidden 2xl:hidden h-10 w-30 rounded-xl border-0 bg-muted px-4 shadow-sm hover:bg-muted/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-medium">{accountType}</span>
              </div>
            </span>

            <ChevronDown className="h-4 w-4 opacity-60 transition-transform data-[state=open]:rotate-180" />
          </Button>
        }
      />

      <DropdownMenuContent align="start" className="w-56 rounded-xl">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account}
            onClick={() => setAccountType(account)}
            className="flex cursor-pointer items-center justify-between rounded-lg"
          >
            <span className="text-sm font-medium">{account}</span>

            {account === accountType && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MonthSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedMonth: string;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
}
export function DaySelector({
  className,
  selectedMonth,
  setSelectedMonth,
  ...props
}: MonthSelectorProps) {
  return (
    <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? "")}>
      <SelectTrigger
        className={cn(
          "h-10 w-30 rounded-xl border-0 bg-muted px-4 shadow-sm hover:bg-muted/80 transition-colors",
          className,
        )}
      >
        <SelectValue placeholder="Select Day" />
      </SelectTrigger>

      <SelectContent className="max-h-72">
        {months.map((month) => (
          <SelectItem key={month} value={month}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const Navbar = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()],
  );

  const section = resolveSection(pathname);
  const config = SECTION_CONFIG[section];
  const isSectionRoot = pathname === config.basePath;

  return (
    <div
      className={cn(
        "px-3 py-3 flex flex-row justify-between items-center",
        className,
      )}
    >
      <div className="flex flex-row items-center gap-1">
        <SidebarTrigger />
        <div>
          <p className="hidden lg:flex 2xl:flex -mb-1">{config.description}</p>
          <h6>{config.title}</h6>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        {config.showAccountScope && <AccountScopeToggle />}

        <div
          className={cn(
            !collapsed ? "hidden" : "hidden lg:flex lg:flex-row lg:gap-1",
          )}
        >
          <Button variant="secondary" size="icon" className="rounded-full">
            <Search className="size-3" />
          </Button>
          <div className="relative">
            <Button variant="secondary" size="icon" className="rounded-full">
              <Bell className="size-3" />
            </Button>
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="rounded-full">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              }
            />

            <DropdownMenuContent align="end" sideOffset={10}>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={cn(!collapsed ? "" : "lg:hidden 2xl:hidden")}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon">
                  <Command className="h-5 w-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4" />
                  Appearance
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>{selectedMonth}</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  {months.map((month) => (
                    <DropdownMenuItem
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/*
          Only rendered on the section's own root route (e.g. /dashboard/invoices),
          not on its sub-routes (e.g. /dashboard/invoices/[id]/edit) — "New Invoice"
          floating in the navbar while you're editing an existing invoice would be
          misleading, so this is intentionally narrower than the title/toggle above,
          which stay visible across the whole section.
        */}
        {isSectionRoot && config.headerAction && (
          <Link href={config.headerAction.href}>
            <Button className="bg-emerald-700 hover:bg-emerald-800">
              <config.headerAction.icon className="h-4 w-4" />
              {config.headerAction.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
