// The app's pages: one list for the sidebar (components/sidebar.tsx), the
// top bar's titles (components/NavbarCl.tsx) and the ⌘K search
// (components/CommandPalette.tsx), so the three can't drift apart.
import {
  Banknote,
  Briefcase,
  ChartColumn,
  FileText,
  Home,
  Landmark,
  Repeat,
  Target,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  title: string;
  url: string;
  icon: LucideIcon;
  /** The line under the title in the top bar. */
  description: string;
  /** Extra words the search matches (e.g. "salary" finds Payroll). */
  keywords?: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    links: [
      { title: "Home", url: "/dashboard", icon: Home, description: "Your money at a glance", keywords: "dashboard overview wallets balance" },
      { title: "Analytics", url: "/dashboard/analytics", icon: ChartColumn, description: "Financial health and habits", keywords: "reports insights trends" },
    ],
  },
  {
    title: "Get paid",
    links: [
      { title: "Invoices", url: "/dashboard/invoices", icon: FileText, description: "Bill clients and get paid", keywords: "bill payment" },
      { title: "Recurring billing", url: "/dashboard/recurring", icon: Repeat, description: "Plans that invoice on a schedule", keywords: "retainer subscription plan" },
      { title: "Clients", url: "/dashboard/clients", icon: Users, description: "Who you bill, and how they pay", keywords: "customers" },
    ],
  },
  {
    title: "Business",
    links: [
      { title: "Business overview", url: "/dashboard/business", icon: Briefcase, description: "How your business is doing", keywords: "health ledger" },
      { title: "Payroll", url: "/dashboard/payroll", icon: Banknote, description: "Pay your team in one go", keywords: "salary staff payees" },
    ],
  },
  {
    title: "Wealth",
    links: [
      { title: "Goals", url: "/dashboard/goals", icon: Target, description: "Save towards what matters", keywords: "savings" },
      { title: "Loans", url: "/dashboard/loans", icon: Landmark, description: "Borrow and repay", keywords: "borrow credit repay installment" },
    ],
  },
];

/** Pages reached from the account menu (not the sidebar), still in search and the top bar. */
export const ACCOUNT_PAGES: NavLink[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: UserRound,
    description: "Your details, email and sign-in security",
    keywords: "account settings personal details email two-factor 2fa security",
  },
];

/** Every page, flattened, with the group it sits in. */
export const ALL_PAGES: (NavLink & { group: string })[] = [
  ...NAV.flatMap((group) => group.links.map((link) => ({ ...link, group: group.title }))),
  ...ACCOUNT_PAGES.map((link) => ({ ...link, group: "Account" })),
];

/** Home matches only itself; every other page also covers its sub-pages (e.g. /invoices/123). */
export function isActivePath(pathname: string, url: string) {
  return url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}

/** The page a path belongs to (the closest match), or Home. */
export function pageFor(pathname: string): NavLink & { group: string } {
  return ALL_PAGES.filter((p) => isActivePath(pathname, p.url)).sort((a, b) => b.url.length - a.url.length)[0] ?? ALL_PAGES[0];
}
