"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { useSupabase } from "@/components/supabase-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState, useRef } from "react";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, signOut, loading } = useSupabase();

  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    imageUrl: string;
  }>({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    imageUrl: "",
  });

  // Store previous user to compare
  const prevUserRef = useRef<User | null>(null);

  // last_name のイニシャルを取得する（フォールバック）
  const getInitial = (lastName: string | undefined) => {
    if (!lastName) return "U";
    return lastName.charAt(0).toUpperCase();
  };

  useEffect(() => {
    // Only update if the user object has actually changed
    if (user && JSON.stringify(prevUserRef.current) !== JSON.stringify(user)) {
      console.log("NavUser → user updated:", user);
      
      const newFirstName = user.first_name || "";
      const newLastName = user.last_name || "";
      const newFullName = newFirstName && newLastName 
        ? `${newLastName} ${newFirstName}`.trim() 
        : "";
      
      setUserData({
        firstName: newFirstName,
        lastName: newLastName,
        fullName: newFullName,
        email: user.email || "",
        imageUrl: user.image_url || "",
      });
      
      prevUserRef.current = user;
    }
  }, [user]);

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/auth/login">
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <User className="h-4 w-4" />
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
                {userData.imageUrl ? (
                  <AvatarImage src={userData.imageUrl} alt={userData.fullName} />
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {getInitial(userData.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {userData.fullName || "ユーザー"}
                </span>
                <span className="truncate text-xs">{userData.email}</span>
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
                  {userData.imageUrl ? (
                    <AvatarImage src={userData.imageUrl} alt={userData.fullName} />
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {getInitial(userData.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userData.fullName || "ユーザー"}
                  </span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/profile">
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
              </Link>
              <Link href="/events/registered">
                <DropdownMenuItem>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  登録済みイベント
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="flex items-center justify-between"
                onSelect={(e) => {
                  e.preventDefault(); // Prevent dropdown from closing
                }}
              >
                <ThemeToggle />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}