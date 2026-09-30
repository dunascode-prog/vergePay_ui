// The app's pages, in the order the sidebar shows them. The ⌘K search reads
// the same list, so the two can never disagree.
import {
  Banknote,
  Briefcase,
  ChartColumn,
  FileText,
  Home,
  Mail,
  Receipt,
  Repeat,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Extra words the search matches (e.g. "budget" finds Envelopes). */
  keywords?: string;
}

/** A top-level entry: a page, or a group that opens to show its pages. */
export type NavEntry = NavLink | { title: string; icon: LucideIcon; children: NavLink[] };

export const NAV: NavEntry[] = [
  { title: "Home", url: "/dashboard", icon: Home, keywords: "dashboard overview wallets balance" },
  { title: "Analytics", url: "/dashboard/analytics", icon: ChartColumn, keywords: "reports insights trends" },
  {
    title: "Get paid",
    icon: Wallet,
    children: [
      { title: "Invoices", url: "/dashboard/invoices", icon: FileText, keywords: "bill payment" },
      { title: "Recurring billing", url: "/dashboard/recurring", icon: Repeat, keywords: "retainer subscription plan" },
      { title: "Clients", url: "/dashboard/clients", icon: Users, keywords: "customers" },
    ],
  },
  {
    title: "Business",
    icon: Briefcase,
    children: [
      { title: "Business overview", url: "/dashboard/business", icon: Briefcase, keywords: "health ledger" },
      { title: "Expenses", url: "/dashboard/expenses", icon: Receipt, keywords: "spending costs receipts" },
      { title: "Payroll", url: "/dashboard/payroll", icon: Banknote, keywords: "salary staff payees" },
    ],
  },
  {
    title: "Wealth",
    icon: Target,
    children: [
      { title: "Goals", url: "/dashboard/goals", icon: Target, keywords: "savings" },
      { title: "Envelopes", url: "/dashboard/envelopes", icon: Mail, keywords: "budget budgets" },
    ],
  },
];

export const isGroup = (entry: NavEntry): entry is Extract<NavEntry, { children: NavLink[] }> =>
  "children" in entry;

/** Every page, flattened, with the group it sits in. */
export const ALL_PAGES: (NavLink & { group?: string })[] = NAV.flatMap((entry) =>
  isGroup(entry) ? entry.children.map((c) => ({ ...c, group: entry.title })) : [entry],
);

/** Home matches only itself; every other page also covers its sub-pages (e.g. /invoices/123). */
export function isActivePath(pathname: string, url: string) {
  return url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}
