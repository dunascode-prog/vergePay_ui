"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/components/app-data";
import { signout } from "@/services/auth";
import { UserProfile } from "@/types/auth";

function displayName(user: UserProfile): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username;
}

function initials(user: UserProfile): string {
  const parts = displayName(user).split(/[\s_]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/**
 * The account, at the foot of the sidebar: avatar, name and email, opening
 * a menu. In the collapsed sidebar only the avatar shows.
 */
export function UserNav() {
  const { user } = useAppData();
  const { isMobile } = useSidebar();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signout().catch(() => {});
    // A full page load, so nothing from this session stays in the router cache.
    window.location.assign("/signin");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={user ? displayName(user) : "Account"}
                aria-label={user ? `Account menu for ${displayName(user)}` : "Account menu"}
                className="data-popup-open:bg-sidebar-accent"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-emerald-100 text-xs font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                    {user ? initials(user) : ""}
                  </AvatarFallback>
                </Avatar>
                {user ? (
                  <span className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{displayName(user)}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                ) : (
                  <span className="grid flex-1 gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </span>
                )}
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="w-60">
            {/* Base UI's menu label must sit inside a group, or opening the menu throws */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block truncate font-medium text-foreground">{user ? displayName(user) : "…"}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {/* Profile and settings pages come later; only what exists is linked. */}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={signingOut} onClick={handleSignOut}>
              <LogOut className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
