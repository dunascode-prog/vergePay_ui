"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Check, ChevronDown, LogOut, Monitor, Moon, Sun } from "lucide-react";

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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { signout } from "@/services/auth";
import { useAppData } from "@/components/app-data";
import { UserProfile } from "@/types/auth";
import { walletsOf } from "@/lib/ledger";

function displayName(user: UserProfile): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username;
}

function initials(user: UserProfile): string {
  const parts = displayName(user).split(/[\s_]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

const THEMES = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * The account menu at the bottom of the sidebar: who's signed in, the
 * appearance setting, and sign out. `compact` shows just the avatar, for the
 * collapsed (icon) sidebar.
 */
export function UserNav({ compact = false }: { compact?: boolean }) {
  const { user, accounts } = useAppData();
  // a short caption under the name: which wallets they have
  const wallets = walletsOf(accounts);
  const caption = [wallets.personal && "Personal", wallets.business && "Business"].filter(Boolean).join(" · ") || "VergePay";
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signout().catch(() => {});
    // A full page load, so nothing from this session stays in the router cache.
    window.location.assign("/signin");
  };

  const avatar = (
    <Avatar className="size-9 shrink-0 rounded-lg after:rounded-lg">
      <AvatarFallback className="rounded-lg bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
        {user ? initials(user) : ""}
      </AvatarFallback>
    </Avatar>
  );

  const label = user ? `Account menu for ${displayName(user)}` : "Account menu";

  return (
    <DropdownMenu>
      {compact ? (
        <DropdownMenuTrigger
          aria-label={label}
          className="rounded-xl border bg-background p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {avatar}
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          aria-label={label}
          render={
            <SidebarMenuButton className="h-auto gap-3 rounded-xl border bg-background p-2 hover:bg-sidebar-accent">
              {avatar}
              {user ? (
                <span className="min-w-0 flex-1 text-left leading-tight">
                  <span className="block truncate text-sm font-medium">{displayName(user)}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {caption}
                  </span>
                </span>
              ) : (
                <span className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </span>
              )}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </SidebarMenuButton>
          }
        />
      )}

      <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-60">
        {/* Base UI's menu label must sit inside a group, or opening the menu throws */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium text-foreground">{user ? displayName(user) : "…"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Appearance</DropdownMenuLabel>
          {THEMES.map(({ value, label: text, Icon }) => (
            <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
              <Icon className="mr-2 size-4" aria-hidden />
              {text}
              {theme === value && <Check className="ml-auto size-4 text-emerald-700" aria-label="selected" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" aria-hidden />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
