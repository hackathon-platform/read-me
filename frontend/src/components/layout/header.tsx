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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Plus,
  Search,
  User,
  LogOut,
  Code2,
  ChevronDown,
} from "lucide-react";
import { NavUser } from "@/components/ui/nav-user";

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
    sticky top-0 z-50 w-full transition-all duration-300 bg-transparent border-b
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
    <div>
      <header className={headerClasses}>
        <div className="w-full flex h-[3.5rem] items-center justify-between px-4 bg-sidebar">
          {/* Logo / Brand */}
          <div className="flex">
            <Link href="/" className="flex text-xl font-bold items-center">
              <Code2 className="h-6 w-6 mr-2" />
              <span>ReadME</span>
            </Link>
          </div>

          {/* Right side: Theme toggle + user menu / auth links */}
          <div>
            {!loading && (
              <>
                {user ? (
                  // ─── ログイン済みユーザー向けメニュー ───
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="link" className="relative h-8 p-0">
                        <Avatar className="h-7 w-7 rounded-full">
                          {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={fullName} />
                          ) : (
                            <AvatarFallback className="rounded-full">
                              {getInitial(lastName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {fullName || "ユーザー"}
                          </span>
                          <span className="truncate text-xs">{user.email}</span>
                        </div>
                        <ChevronDown className="ml-auto size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="font-medium">
                        {fullName || "ユーザー"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <Link href="/me">
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

                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="flex items-center justify-between"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <ThemeToggle />
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

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
