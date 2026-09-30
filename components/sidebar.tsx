"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommandPalette, useCommandShortcut } from "./CommandPalette";
import { UserNav } from "./user_nav";
import { isActivePath, isGroup, NAV, type NavEntry, type NavLink } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// A floating, rounded panel (light and dark), with a collapse button on its
// edge. Groups open to show their pages on a tree line; collapsed to icons,
// a group's pages open in a flyout instead.

const item =
  "h-10 gap-3 rounded-xl px-3 text-sm text-sidebar-foreground/75 hover:text-sidebar-foreground " +
  "data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-foreground " +
  "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!";

function EdgeToggle() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const Icon = collapsed ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="absolute -right-3 top-1/2 z-20 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-sidebar text-muted-foreground shadow-sm transition-colors hover:text-foreground md:flex"
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function SearchButton({ collapsed, onOpen }: { collapsed: boolean; onOpen: () => void }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onOpen}
              aria-label="Search pages"
              className="mx-auto flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:text-foreground"
            />
          }
        >
          <Search className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right">Search · ⌘K</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-10 w-full items-center gap-2.5 rounded-xl border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left">Search</span>
      <span className="flex gap-1" aria-hidden>
        <kbd className="flex size-5 items-center justify-center rounded-md border bg-muted font-sans text-tiny">⌘</kbd>
        <kbd className="flex size-5 items-center justify-center rounded-md border bg-muted font-sans text-tiny">K</kbd>
      </span>
    </button>
  );
}

function PageLink({ page, pathname, onNavigate }: { page: NavLink; pathname: string; onNavigate: () => void }) {
  const active = isActivePath(pathname, page.url);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={page.title}
        className={item}
        render={
          // collapsed, the text is hidden, so the link needs its own name
          <Link href={page.url} aria-label={page.title} aria-current={active ? "page" : undefined} onClick={onNavigate}>
            <page.icon />
            <span className="group-data-[collapsible=icon]:hidden">{page.title}</span>
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}

function PageGroup({
  group,
  pathname,
  collapsed,
  onNavigate,
}: {
  group: Extract<NavEntry, { children: NavLink[] }>;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const hasActive = group.children.some((c) => isActivePath(pathname, c.url));
  const [open, setOpen] = useState(hasActive);

  // Collapsed to icons: the group's pages open in a flyout beside it.
  if (collapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            openOnHover
            delay={80}
            aria-label={group.title}
            render={
              <SidebarMenuButton isActive={hasActive} className={item}>
                <group.icon />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side="right" align="start" sideOffset={14} className="w-52 rounded-xl p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2.5 text-tiny font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </DropdownMenuLabel>
              {group.children.map((page) => {
                const active = isActivePath(pathname, page.url);
                return (
                  <DropdownMenuItem
                    key={page.url}
                    className={cn("rounded-lg px-2.5 py-2", active && "bg-accent font-medium")}
                    render={
                      <Link href={page.url} aria-current={active ? "page" : undefined}>
                        {page.title}
                      </Link>
                    }
                  />
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <Collapsible.Trigger
        render={
          <SidebarMenuButton className={cn(item, hasActive && "bg-sidebar-accent font-medium text-sidebar-foreground")}>
            <group.icon />
            <span className="flex-1">{group.title}</span>
            <ChevronDown className={cn("size-4! text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </SidebarMenuButton>
        }
      />
      <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-all duration-200 data-ending-style:h-0 data-starting-style:h-0">
        {/* a tree line with a curved elbow into each page (as in the reference design) */}
        <SidebarMenuSub className="mx-0 ml-5 gap-0.5 border-l-0 py-1 pl-3 pr-0">
          {group.children.map((page, i) => {
            const active = isActivePath(pathname, page.url);
            const last = i === group.children.length - 1;
            return (
              <SidebarMenuSubItem
                key={page.url}
                className={cn(
                  // the elbow: down from the line above, curving right into the page
                  "before:absolute before:-left-3 before:-top-0.5 before:h-[calc(50%+2px)] before:w-2.5 before:rounded-bl-lg before:border-b before:border-l before:border-sidebar-border",
                  // the line carries on past this page to the next one
                  !last && "after:absolute after:-left-3 after:top-1/2 after:h-[calc(50%+2px)] after:border-l after:border-sidebar-border",
                )}
              >
                <SidebarMenuSubButton
                  isActive={active}
                  className="h-8 rounded-lg px-2.5 text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-foreground"
                  render={
                    <Link href={page.url} aria-current={active ? "page" : undefined} onClick={onNavigate}>
                      <span>{page.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useCommandShortcut(openSearch);
  const closeMobile = () => setOpenMobile(false);

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        // the panel itself: rounder, softer than the default floating style
        className="[&>[data-slot=sidebar-inner]]:rounded-2xl [&>[data-slot=sidebar-inner]]:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_rgb(0_0_0/0.04)]"
      >
        <SidebarHeader className="relative gap-3 px-3 pb-2 pt-4 group-data-[collapsible=icon]:px-2">
          <Link
            href="/dashboard"
            aria-label="VergePay home"
            onClick={closeMobile}
            className={cn("flex h-9 items-center", collapsed ? "justify-center" : "-ml-4 w-36 overflow-hidden")}
          >
            {collapsed ? (
              <Image src="/final_vergepay_logoc.svg" alt="VergePay" width={28} height={28} priority />
            ) : (
              // the wordmark file has built-in padding on its left; -ml lines it up
              <Image src="/final_vergepay_logo.svg" alt="VergePay" width={144} height={40} priority className="object-contain" />
            )}
          </Link>
          <div className="absolute right-0 top-[34px]">
            <EdgeToggle />
          </div>
          <SearchButton collapsed={collapsed} onOpen={openSearch} />
        </SidebarHeader>

        <SidebarContent className="gap-0 px-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroup className="pt-1">
            <SidebarGroupLabel className="pointer-events-none px-3 text-tiny font-medium uppercase tracking-wider text-muted-foreground/80 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-100">
              {collapsed ? "Menu" : "Main menu"}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
              {NAV.map((entry) =>
                isGroup(entry) ? (
                  <PageGroup key={entry.title} group={entry} pathname={pathname} collapsed={collapsed} onNavigate={closeMobile} />
                ) : (
                  <PageLink key={entry.url} page={entry} pathname={pathname} onNavigate={closeMobile} />
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
          <UserNav compact={collapsed} />
        </SidebarFooter>
      </Sidebar>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
