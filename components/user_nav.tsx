"use client";

import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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

import {
  Bell,
  CreditCard,
  LogOut,
  MoreHorizontal,
  Settings,
  User,
} from "lucide-react";

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        // the button renders as a <div>, so it isn't a native <button>
        nativeButton={false}
        render={
        <SidebarMenuButton
          className="h-auto rounded-xl p-3 transition-colors hover:bg-sidebar-accent"
          render={
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="https://i.pravatar.cc/300"
                    alt="Seun Adeyemi"
                  />

                  <AvatarFallback>SA</AvatarFallback>

                  <AvatarBadge className="bg-emerald-500" />
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Seun Adeyemi</p>

                  <p className="truncate text-xs text-muted-foreground">
                    Enterprise
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    seun@example.com
                  </p>
                </div>
              </div>

              <MoreHorizontal className="size-4 text-muted-foreground" />
            </div>
          }
        />
        }
      />

      <DropdownMenuContent align="end" side="right" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="font-medium">Seun Adeyemi</p>

            <p className="text-xs text-muted-foreground">seun@example.com</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link href="/profile">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            }
          />

          <DropdownMenuItem
            render={
              <Link href="/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            }
          />

          <DropdownMenuItem
            render={
              <Link href="/billing">
                <CreditCard className="mr-2 size-4" />
                Billing
              </Link>
            }
          />

          <DropdownMenuItem
            render={
              <Link href="/notifications">
                <Bell className="mr-2 size-4" />
                Notifications
              </Link>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
