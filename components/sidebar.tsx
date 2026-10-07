"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Landmark, Plus, Repeat } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { isActivePath, NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "./user_nav";
import { WalletsSidebarGroup } from "./wallet";

// What "Create" offers: things that have their own page to start from.
const CREATE = [
  { title: "New invoice", url: "/dashboard/invoices/new", icon: FileText },
  { title: "New recurring plan", url: "/dashboard/recurring/new", icon: Repeat },
  { title: "Apply for a loan", url: "/dashboard/loans/apply", icon: Landmark },
];

/**
 * The app's sidebar: expanded by default, collapsible to icons (the top
 * bar's button, the rail on its edge, or Ctrl/⌘ B), and a sheet on phones
 * that closes when a page is picked.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const closeOnPhone = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex-row items-center border-b px-4 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link href="/dashboard" onClick={closeOnPhone} className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none" aria-label="VergePay home">
          <Image src="/final_vergepay_logoc.svg" alt="" width={28} height={28} priority className="size-7 shrink-0" />
          {!collapsed && <span className="truncate text-[15px] font-semibold tracking-tight">VergePay</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup className="pb-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      aria-label="Create"
                      className="h-9 justify-center bg-emerald-700 font-medium text-white hover:bg-emerald-800 hover:text-white data-open:bg-emerald-800 data-open:text-white group-data-[collapsible=icon]:size-8!"
                    >
                      <Plus />
                      <span className="group-data-[collapsible=icon]:hidden">Create</span>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent align="start" side={collapsed ? "right" : "bottom"} className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Create</DropdownMenuLabel>
                    {CREATE.map((item) => (
                      <DropdownMenuItem key={item.url} render={<Link href={item.url} onClick={closeOnPhone} />}>
                        <item.icon className="mr-2 size-4" />
                        {item.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {NAV.map((group) => (
          <SidebarGroup key={group.title} className="py-1.5">
            <SidebarGroupLabel className="h-7 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.links.map((link) => {
                  const active = isActivePath(pathname, link.url);
                  return (
                    <SidebarMenuItem key={link.url}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={link.title}
                        className={cn(
                          "h-9 text-muted-foreground hover:text-foreground data-active:text-foreground",
                          active && "[&_svg]:text-emerald-700 dark:[&_svg]:text-emerald-400",
                        )}
                        render={<Link href={link.url} onClick={closeOnPhone} aria-current={active ? "page" : undefined} />}
                      >
                        <link.icon />
                        <span>{link.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <WalletsSidebarGroup collapsed={collapsed} onNavigate={closeOnPhone} />
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserNav compact={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
