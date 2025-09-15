"use client";

import Link from "next/link";
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
import {
  CalendarDays,
  Plus,
  Search,
  User,
  LogOut,
  Code2,
  ChevronDown,
} from "lucide-react";

export default function Header() {
  const { user, signOut, loading } = useSupabase();

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
  const userEmail = user?.email ?? "";
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
                        <ChevronDown className="ml-auto size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="font-medium">
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {fullName || "ユーザー"}
                          </span>
                          <span className="truncate text-xs">{userEmail}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <Link href="/me">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" />
                          <span>プロフィール</span>
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/event">
                        <DropdownMenuItem>
                          <CalendarDays className="h-4 w-4 mr-2" />
                          <span>イベント（開発中）</span>
                        </DropdownMenuItem>
                      </Link>
                      <ThemeToggle />

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
