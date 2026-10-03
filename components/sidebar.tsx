"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV, isActivePath, isGroup, type NavLink } from "@/lib/navigation";
import { UserNav } from "./user_nav";
import { WalletsSidebarGroup } from "./wallet";

/**
 * The app's sidebar: the logo, the pages (from lib/navigation.ts, the same
 * list the ⌘K search uses), the wallets and the account. Collapses to icons
 * with tooltips; on phones it opens as a sheet from the top bar's button.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const item = (link: NavLink) => (
    <SidebarMenuItem key={link.url}>
      <SidebarMenuButton
        isActive={isActivePath(pathname, link.url)}
        tooltip={link.title}
        render={
          <Link href={link.url} onClick={() => isMobile && setOpenMobile(false)}>
            <link.icon />
            <span>{link.title}</span>
          </Link>
        }
      />
    </SidebarMenuItem>
  );

  const top = NAV.filter((entry): entry is NavLink => !isGroup(entry));
  const groups = NAV.filter(isGroup);

  return (
    <Sidebar collapsible="icon">
      {/* same height as the top bar, so their bottom borders line up */}
      <SidebarHeader className="h-14 justify-center border-b px-3 py-0 group-data-[collapsible=icon]:px-2">
        <Link href="/dashboard" aria-label="VergePay home" className="flex items-center">
          {collapsed ? (
            <Image src="/final_vergepay_logoc.svg" alt="" width={32} height={32} priority className="mx-auto size-8 scale-125" />
          ) : (
            // the logo file at the sign-in page's size (components/auth/AuthShell.tsx)
            <span className="-ml-[22px] flex h-10 w-36 items-center overflow-hidden">
              <Image src="/final_vergepay_logo.svg" alt="" width={144} height={40} priority className="object-contain dark:brightness-[2.2] dark:saturate-[0.85]" />
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup className="py-1">
          <SidebarMenu>{top.map(item)}</SidebarMenu>
        </SidebarGroup>

        {groups.map((group) => (
          <SidebarGroup key={group.title} className="py-1">
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>{group.children.map(item)}</SidebarMenu>
          </SidebarGroup>
        ))}

        {!collapsed && <WalletsSidebarGroup />}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserNav />
      </SidebarFooter>

      {/* click the edge to collapse or expand */}
      <SidebarRail />
    </Sidebar>
  );
}
