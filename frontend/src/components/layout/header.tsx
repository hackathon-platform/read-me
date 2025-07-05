"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSupabase } from "@/components/supabase-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Plus, Search, User, LogOut } from "lucide-react";

export default function Header() {
  const { user, signOut, loading } = useSupabase();
  console.log("Header → user:", user, "loading:", loading);

  const navItems = [
    {
      name: "Discover",
      href: "/events",
      icon: <Search className="mr-2 h-4 w-4" />,
    },
    {
      name: "Create Event",
      href: "/events/create",
      icon: <Plus className="mr-2 h-4 w-4" />,
    },
  ];

  if (user) {
    navItems.push({
      name: "登録済みイベント",
      href: "/events/registered",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
    });
  }

  const headerClasses = `
    sticky top-0 z-50 w-full transition-all duration-300 bg-transparent
  `;

  // last_name のイニシャルを取得する（フォールバック）
  const getInitial = (lastName: string | undefined) => {
    if (!lastName) return "U";
    return lastName.charAt(0).toUpperCase();
  };

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const fullName = firstName && lastName ? `${lastName} ${firstName} ` : "";
  const avatarUrl = user?.image_url ?? "";
  console.log("user", user);
  return (
    <div className="md:hidden">
      <header className={headerClasses}>
        <div className="w-full flex h-12 items-center justify-between px-4 bg-sidebar">
          {/* Logo / Brand */}
          <div className="flex">
            <Link href="/" className="flex text-2xl font-bold items-center">
              <CalendarDays className="h-6 w-6 mr-2" />
              <span>EventNavi</span>
            </Link>
          </div>

          {/* Right side: Theme toggle + user menu / auth links */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  // ─── ログイン済みユーザー向けメニュー ───
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full p-0"
                      >
                        <Avatar>
                          {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={fullName} />
                          ) : (
                            <AvatarFallback>
                              {getInitial(lastName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="font-medium">
                        {fullName || "ユーザー"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <Link href="/profile">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" />
                          <span>プロフィール</span>
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/events/registered">
                        <DropdownMenuItem>
                          <CalendarDays className="h-4 w-4 mr-2" />
                          <span>登録済みイベント</span>
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>ログアウト</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // ─── 非ログイン時は常にログイン/新規登録を表示 ───
                  <div className="flex space-x-2">
                    <Link href="/auth/login">
                      <Button variant="ghost">ログイン</Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button>新規登録</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
