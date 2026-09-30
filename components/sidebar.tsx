"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserNav } from "./user_nav";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Analytics", url: "/dashboard/analytics", icon: ChartColumn },
    ],
  },
  {
    title: "Get paid",
    items: [
      { title: "Invoices", url: "/dashboard/invoices", icon: FileText },
      { title: "Recurring billing", url: "/dashboard/recurring", icon: Repeat },
      { title: "Clients", url: "/dashboard/clients", icon: Users },
    ],
  },
  {
    title: "Business",
    items: [
      { title: "Business overview", url: "/dashboard/business", icon: Briefcase },
      { title: "Expenses", url: "/dashboard/expenses", icon: Receipt },
      { title: "Payroll", url: "/dashboard/payroll", icon: Banknote },
    ],
  },
  {
    title: "Wealth",
    items: [
      { title: "Goals", url: "/dashboard/goals", icon: Target },
      { title: "Envelopes", url: "/dashboard/envelopes", icon: Mail },
    ],
  },
];

/** Home matches only itself; every other item also covers its sub-pages (e.g. /invoices/123). */
function isActive(pathname: string, url: string) {
  return url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b px-3">
        <Link
          href="/dashboard"
          aria-label="VergePay home"
          onClick={() => setOpenMobile(false)}
          className={cn("flex items-center", collapsed ? "justify-center" : "-ml-4.5 h-10 w-36 overflow-hidden")}
        >
          {collapsed ? (
            <Image src="/final_vergepay_logoc.svg" alt="VergePay" width={28} height={28} priority />
          ) : (
            // the wordmark file has built-in padding on its left; -ml lines it up
            <Image src="/final_vergepay_logo.svg" alt="VergePay" width={144} height={40} priority className="object-contain" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        {NAV.map((group) => (
          <SidebarGroup key={group.title} className="py-1.5">
            {/* collapsed, the label fades out over the icon above it, so it must not catch clicks */}
            <SidebarGroupLabel className="text-tiny font-medium uppercase tracking-wider text-muted-foreground/80 group-data-[collapsible=icon]:pointer-events-none">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      className="h-9 data-active:bg-emerald-50 data-active:text-emerald-800 dark:data-active:bg-emerald-950 dark:data-active:text-emerald-200"
                      render={
                        <Link
                          href={item.url}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className={cn("border-t", collapsed ? "items-center py-2" : "p-2")}>
        <UserNav compact={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
