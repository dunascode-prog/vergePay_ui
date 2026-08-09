"use client";
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
} from "@/components/ui/sidebar";

import { useSidebar } from "@/components/ui/sidebar";

import {
  Home,
  ChartColumn,
  FileText,
  Repeat,
  Users,
  Briefcase,
  Wallet,
  Banknote,
  Target,
  Mail,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import { WalletSwitcher } from "./wallet_switcher";
import { UserNav } from "./user_nav";

const sidebarMenu = {
  main: {
    title: "Main",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: ChartColumn,
      },
    ],
  },

  payments: {
    title: "Payments",
    items: [
      {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: FileText,
        badge: 4,
      },
      {
        title: "Recurring billing",
        url: "dashboard/recurring-billing",
        icon: Repeat,
      },
      {
        title: "Clients",
        url: "dashboard/clients",
        icon: Users,
      },
    ],
  },

  business: {
    title: "Business",
    items: [
      {
        title: "Business overview",
        url: "/business",
        icon: Briefcase,
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: Wallet,
      },
      {
        title: "Payroll",
        url: "/payroll",
        icon: Banknote,
      },
    ],
  },

  wealth: {
    title: "Wealth",
    items: [
      {
        title: "Goals",
        url: "/goals",
        icon: Target,
      },
      {
        title: "Envelopes",
        url: "/envelopes",
        icon: Mail,
      },
    ],
  },
};
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link
                  href="/"
                  className="flex items-center justify-center gap-3"
                >
                  {collapsed ? (
                    <Image
                      src="/final_vergePay_logoc.svg"
                      alt="VergePay"
                      width={34}
                      height={34}
                      className="rounded-lg"
                    />
                  ) : (
                    <Image
                      src="/final_vergePay_logo.svg"
                      alt="VergePay"
                      width={154}
                      height={154}
                      className="rounded-lg"
                    />
                  )}
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={collapsed ? "" : "px-2 py-4"}>
        {Object.values(sidebarMenu).map((section) => (
          <SidebarGroup key={section.title} className="mb-5">
            <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              {section.title}
            </SidebarGroupLabel>

            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        {collapsed ? (
          <SidebarGroup>
            <SidebarMenu className="flex items-center">
              <SidebarMenuButton
                render={
                  <Link href="/">
                    <CreditCard className="size-4" />
                  </Link>
                }
              />
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <WalletSwitcher />
        )}
      </SidebarContent>

      {collapsed ? (
        <SidebarFooter className="flex items-center pb-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://i.pravatar.cc/300" />
            <AvatarFallback>SA</AvatarFallback>
            <AvatarBadge className="bg-emerald-500" />
          </Avatar>
        </SidebarFooter>
      ) : (
        <SidebarFooter className="border-t px-2 py-3">
          <UserNav />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
