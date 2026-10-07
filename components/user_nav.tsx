"use client";

import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { LogOut, MoreHorizontal } from "lucide-react";

import { signout } from "@/services/auth";
import { useAppData } from "@/components/app-data";
import { UserProfile } from "@/types/auth";

function displayName(user: UserProfile): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username;
}

function initials(user: UserProfile): string {
  const parts = displayName(user).split(/[\s_]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/** `compact`: avatar only, for the collapsed (icon) sidebar. */
export function UserNav({ compact = false }: { compact?: boolean }) {
  const { user } = useAppData();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signout().catch(() => {});
    // A full page load, so nothing from this session stays in the router cache.
    window.location.assign("/signin");
  };

  const avatar = (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{user ? initials(user) : ""}</AvatarFallback>

      <AvatarBadge className="bg-emerald-500" />
    </Avatar>
  );

  return (
    <DropdownMenu>
      {compact ? (
        <DropdownMenuTrigger
          aria-label={user ? `Account menu for ${displayName(user)}` : "Account menu"}
          className="mx-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {avatar}
        </DropdownMenuTrigger>
      ) : (
      <DropdownMenuTrigger
        // the button renders as a <div>, so it isn't a native <button>
        nativeButton={false}
        render={
        <SidebarMenuButton
          className="h-auto rounded-lg p-2 transition-colors hover:bg-sidebar-accent"
          render={
            <div className="flex w-full items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {avatar}

                {user ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName(user)}</p>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                )}
              </div>

              <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" />
            </div>
          }
        />
        }
      />
      )}

      <DropdownMenuContent align="end" side="right" className="w-64">
        {/* Base UI's menu label must sit inside a group, or opening the menu throws */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="space-y-1">
              <p className="font-medium">{user ? displayName(user) : "…"}</p>

              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {/* Profile and settings pages come later; only what exists is linked. */}
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
