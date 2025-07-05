"use client";

import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

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

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl: string;
}

const USER_DATA_KEY = "nav-user-data";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, signOut: originalSignOut, loading } = useSupabase();

  const [userData, setUserData] = useState<UserData>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(USER_DATA_KEY);
        return cached ? JSON.parse(cached) : defaultUserData();
      } catch {
        return defaultUserData();
      }
    }
    return defaultUserData();
  });

  const prevUserRef = useRef<User | null>(null);

  const defaultUserData = (): UserData => ({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    imageUrl: "",
  });

  const getInitial = (lastName?: string) =>
    lastName?.charAt(0).toUpperCase() || "U";

  const hasCachedData = userData.email !== "";

  const signOut = async () => {
    localStorage.removeItem(USER_DATA_KEY);
    setUserData(defaultUserData());
    await originalSignOut();
  };

  useEffect(() => {
    if (!user && !loading) {
      localStorage.removeItem(USER_DATA_KEY);
      setUserData(defaultUserData());
      prevUserRef.current = null;
      return;
    }

    if (user && JSON.stringify(prevUserRef.current) !== JSON.stringify(user)) {
      const newFirstName = user.first_name || "";
      const newLastName = user.last_name || "";
      const fullName = `${newLastName} ${newFirstName}`.trim();

      const newUserData: UserData = {
        firstName: newFirstName,
        lastName: newLastName,
        fullName,
        email: user.email || "",
        imageUrl: user.image_url || "",
      };

      setUserData(newUserData);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
      prevUserRef.current = user;
    }
  }, [user, loading]);

  if (loading && !hasCachedData) {
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

  if (!user && !hasCachedData) {
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
                  <AvatarImage
                    src={userData.imageUrl}
                    alt={userData.fullName}
                  />
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
                    <AvatarImage
                      src={userData.imageUrl}
                      alt={userData.fullName}
                    />
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
              <Link href="/navi">
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
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
