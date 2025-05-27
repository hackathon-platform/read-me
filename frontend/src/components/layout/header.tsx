"use client";

import { useState, useEffect } from "react";
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
import { CalendarDays, Menu, Plus, Search, User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavUser } from "@/components/ui/nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export default function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useSupabase();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      name: "My Events",
      href: "/dashboard",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
    });
  }

  const headerClasses = `sticky top-0 z-50 w-full transition-all duration-300 ${
    scrolled
      ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      : "bg-transparent"
  }`;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className={headerClasses}>
      <div className="w-full flex h-14 items-center justify-between px-4 bg-sidebar">
        <div className="flex">
          <Link href="/" className="flex text-2xl font-bold items-center">
            <CalendarDays className="h-6 w-6 mr-2" />
            <span className="hidden sm:inline">EventNavi</span>
          </Link>
        </div>

        <div className="flex ">
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar>
                        <AvatarImage
                          src={user.avatar_url || ""}
                          alt={user.full_name}
                        />
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className=" h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
                      <DropdownMenuItem>
                        <CalendarDays className="h-4 w-4" />
                        <span>My Events</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex space-x-2">
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
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <Link
                  href="/"
                  className="flex items-center text-2xl font-bold mb-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CalendarDays className="h-6 w-6 mr-2" />
                  <span>EventMaker</span>
                </Link>

                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        {item.icon}
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto">
                  {!loading && !user && (
                    <div className="grid gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}

                  {user && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
