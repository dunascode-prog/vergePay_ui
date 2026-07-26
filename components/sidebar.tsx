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
        url: "/",
        icon: Home,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: ChartColumn,
      },
    ],
  },

  payments: {
    title: "Payments",
    items: [
      {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
        badge: 4,
      },
      {
        title: "Recurring billing",
        url: "/recurring-billing",
        icon: Repeat,
      },
      {
        title: "Clients",
        url: "/clients",
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
    // <Sidebar collapsible="icon">
    //   <SidebarHeader>
    //     <SidebarMenuButton
    //       render={
    //         <Link href="/">
    //           <Image src="/vergepay2.svg" alt="logo" width={30} height={30} />
    //           <div className="flex flex-col">
    //             <h6 className="-mb-2">VergePay</h6>
    //             <small>Enterprise</small>
    //           </div>
    //         </Link>
    //       }
    //     />
    //   </SidebarHeader>
    //   <SidebarContent>
    //     {Object.values(sidebarMenu).map((section) => (
    //       <SidebarGroup key={section.title}>
    //         <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
    //         {section.items.map((item) => {
    //           return (
    //             <SidebarMenuItem key={item.title}>
    //               <SidebarMenuButton
    //                 render={
    //                   <Link href={item.url}>
    //                     <item.icon />
    //                     <span>{item.title}</span>
    //                   </Link>
    //                 }
    //               />
    //             </SidebarMenuItem>
    //           );
    //         })}
    //       </SidebarGroup>
    //     ))}
    //     <SidebarGroup className="bg-popover rounded-lg">
    //       <SidebarGroupLabel>Wallets</SidebarGroupLabel>
    //       <SidebarMenu>
    //         <SidebarMenuItem>
    //           <SidebarMenuButton
    //             className="py-2"
    //             render={
    //               <Link
    //                 href="/"
    //                 className="flex flex-row justify-between items-center py-5 px-2"
    //               >
    //                 <div className="flex flex-row items-center gap-3">
    //                   <div className="relative flex h-3 w-3 items-center justify-center">
    //                     <span className="absolute h-3 w-3 rounded-full bg-green-500 blur-sm opacity-70" />
    //                     <span className="relative h-2 w-2 rounded-full bg-green-500" />
    //                   </div>

    //                   <span>Personal</span>
    //                 </div>
    //                 <div className="text-xs text-muted-foreground">600k</div>
    //               </Link>
    //             }
    //             isActive
    //           >
    //             {" "}
    //           </SidebarMenuButton>
    //         </SidebarMenuItem>

    //         <SidebarMenuItem>
    //           <SidebarMenuButton
    //             render={
    //               <Link
    //                 href="/"
    //                 className="flex flex-row justify-between items-center py-5 px-2"
    //               >
    //                 <div className="flex flex-row items-center gap-3">
    //                   <div className="relative flex h-3 w-3 items-center justify-center">
    //                     <span className="absolute h-3 w-3 rounded-full bg-blue-500 blur-sm opacity-70" />
    //                     <span className="relative h-2 w-2 rounded-full bg-blue-500" />
    //                   </div>

    //                   <span>Business</span>
    //                 </div>
    //                 <div className="text-xs text-muted-foreground">300k</div>
    //               </Link>
    //             }
    //           >
    //             {" "}
    //           </SidebarMenuButton>
    //         </SidebarMenuItem>
    //         <SidebarMenuItem>
    //           <SidebarMenuButton
    //             render={
    //               <Link href="/">
    //                 <CirclePlus />
    //                 <span>Add Wallet</span>
    //               </Link>
    //             }
    //           >
    //             {" "}
    //           </SidebarMenuButton>
    //         </SidebarMenuItem>
    //       </SidebarMenu>
    //     </SidebarGroup>
    //     <SidebarFooter className="py-3">
    //       <SidebarMenu>
    //         <SidebarMenuItem>
    //           <SidebarMenuButton
    //             className="py-8"
    //             render={
    //               <div className="flex flex-row items-center justify-between">
    //                 <div className="flex flex-row items-center gap-2">
    //                   <Avatar>
    //                     <AvatarImage
    //                       src="https://i.pravatar.cc/300"
    //                       alt="@shadcn"
    //                     />
    //                     <AvatarFallback>CN</AvatarFallback>
    //                     <AvatarBadge className="bg-green-600 dark:bg-green-800" />
    //                   </Avatar>
    //                   <div className="flex flex-col justify-center">
    //                     <div className="text-sm font-medium tracking-tight -mb-1">
    //                       Seun Adeyemi
    //                     </div>
    //                     <div className="text-xs text-muted-foreground">
    //                       seun@example.com
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div>
    //                   <Settings className="h-4 w-4" />
    //                 </div>
    //               </div>
    //             }
    //           ></SidebarMenuButton>
    //         </SidebarMenuItem>
    //         <SidebarMenuItem>
    //           <SidebarMenuButton
    //             render={
    //               <Link href="/">
    //                 <LogOut />
    //                 <span>Sign out</span>
    //               </Link>
    //             }
    //           />
    //         </SidebarMenuItem>
    //       </SidebarMenu>
    //     </SidebarFooter>
    //   </SidebarContent>
    // </Sidebar>
    <Sidebar collapsible="icon">
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b px-4 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/" className="flex items-center justify-start">
                  <Image
                    src="/vergepay_final.svg"
                    alt="VergePay"
                    width={136}
                    height={136}
                    className="rounded-lg"
                  />
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ================= MAIN NAV ================= */}
      <SidebarContent className="px-2 py-4">
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
        <WalletSwitcher />
      </SidebarContent>

      {collapsed ? (
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://i.pravatar.cc/300" />
          <AvatarFallback>SA</AvatarFallback>
          <AvatarBadge className="bg-emerald-500" />
        </Avatar>
      ) : (
        <SidebarFooter className="border-t px-2 py-3">
          <UserNav />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
