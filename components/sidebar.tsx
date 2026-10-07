"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Landmark, Plus, Repeat } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { GroupToggle } from "./sidebar-group-toggle";
import { UserNav } from "./user_nav";
import { WalletsSidebarGroup } from "./wallet";

// What "Create" offers: things that have their own page to start from.
const CREATE = [
  { title: "New invoice", url: "/dashboard/invoices/new", icon: FileText },
  { title: "New recurring plan", url: "/dashboard/recurring/new", icon: Repeat },
  { title: "Apply for a loan", url: "/dashboard/loans/apply", icon: Landmark },
];

// Which groups the person closed, remembered in this browser only.
const CLOSED_KEY = "vergepay.sidebar.closed";

function useClosedGroups() {
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CLOSED_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved choice once, after hydration
      if (Array.isArray(saved)) setClosed(saved.filter((x) => typeof x === "string"));
    } catch {
      // storage blocked or corrupt: every group starts open
    }
  }, []);
  const toggle = (title: string) =>
    setClosed((prev) => {
      const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
      try {
        localStorage.setItem(CLOSED_KEY, JSON.stringify(next));
      } catch {
        // not saved; it still works for this visit
      }
      return next;
    });
  return { closed, toggle };
}

/**
 * The app's sidebar: expanded by default, collapsible to icons (the top
 * bar's button, the rail on its edge, or Ctrl/⌘ B), and a sheet on phones
 * that closes when a page is picked. Each group opens and closes on its
 * label; the group holding the current page is always open.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const closeOnPhone = () => isMobile && setOpenMobile(false);
  const { closed, toggle } = useClosedGroups();

  return (
    <Sidebar collapsible="icon">
      {/* The logo is centred both ways in the header. The wordmark sits in the
          middle of its square file, so a centred frame centres the wordmark;
          the frame is 40px tall and clips the file's empty top and bottom. */}
      <SidebarHeader className="h-14 flex-row items-center justify-center border-b p-0">
        <Link href="/dashboard" onClick={closeOnPhone} className="flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none" aria-label="VergePay home">
          {collapsed ? (
            <Image src="/final_vergepay_logoc.svg" alt="" width={28} height={28} priority className="size-7" />
          ) : (
            <span className="flex h-10 w-40 items-center justify-center overflow-hidden">
              <Image src="/final_vergepay_logo.svg" alt="" width={160} height={160} priority className="max-w-none dark:brightness-125" />
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup className="pb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      aria-label="Create"
                      className="h-9 justify-center bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800 hover:text-white data-open:bg-emerald-800 data-open:text-white group-data-[collapsible=icon]:size-8!"
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

        {NAV.map((group) => {
          const holdsCurrent = group.links.some((link) => isActivePath(pathname, link.url));
          // collapsed to icons, every page shows; otherwise as the person left it
          const open = collapsed || holdsCurrent || !closed.includes(group.title);
          return (
            <SidebarGroup key={group.title} className="py-0.5">
              <GroupToggle title={group.title} open={open} onToggle={() => toggle(group.title)} />
              {open && (
                <SidebarGroupContent className="mt-0.5">
                  <SidebarMenu className="gap-0.5">
                    {group.links.map((link) => {
                      const active = isActivePath(pathname, link.url);
                      return (
                        <SidebarMenuItem key={link.url}>
                          <SidebarMenuButton
                            isActive={active}
                            tooltip={link.title}
                            className={cn(
                              "h-8 text-sm text-muted-foreground hover:text-foreground data-active:text-foreground",
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
              )}
            </SidebarGroup>
          );
        })}

        <WalletsSidebarGroup
          collapsed={collapsed}
          onNavigate={closeOnPhone}
          open={collapsed || !closed.includes("Wallets")}
          onToggle={() => toggle("Wallets")}
        />
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserNav compact={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
