"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export type NavUserView = {
  name: string;
  email: string;
  avatarUrl?: string;
  initial: string;
};

type NavUserProps = {
  view?: NavUserView; // undefined => guest
  loading?: boolean; // true => skeleton
  isMobile?: boolean; // controls dropdown side
  onSignOut?: () => void | Promise<void>;
};

export const NavUser = React.memo(function NavUser({
  view,
  loading = false,
  isMobile = false,
  onSignOut,
}: NavUserProps) {
  // Loading state — lightweight skeleton
  if (loading && !view) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">…</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading…</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Guest
  if (!view) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/auth/login">
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">ゲスト</span>
                <span className="truncate text-xs">ログインしてください</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {view.avatarUrl ? (
                  <AvatarImage src={view.avatarUrl} alt={view.name} />
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {view.initial}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{view.name}</span>
                <span className="truncate text-xs">{view.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {view.avatarUrl ? (
                    <AvatarImage src={view.avatarUrl} alt={view.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {view.initial}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{view.name}</span>
                  <span className="truncate text-xs">{view.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/me">
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
              </Link>
              <Link href="/event">
                <DropdownMenuItem>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  イベント（開発中）
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <ThemeToggle />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
