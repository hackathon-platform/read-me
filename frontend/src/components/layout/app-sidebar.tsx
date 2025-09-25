"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Megaphone,
  LifeBuoy,
  MessageSquare,
  Home,
  SquarePlus,
  Code2,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    { title: "ホーム", url: "/", icon: Home, items: [] },
    { title: "プロフィール", url: "/me", icon: User, items: [] },
    {
      title: "プロジェクト投稿",
      url: "/project/new",
      icon: SquarePlus,
      isActive: true,
      items: [],
    },
    {
      title: "イベント開催",
      url: "/org",
      icon: Megaphone,
      items: [{ title: "イベント新規作成", url: "/event/new" }],
    },
  ],
  navSecondary: [
    { title: "サポート", url: "/#", icon: LifeBuoy },
    { title: "フィードバック", url: "/#", icon: MessageSquare },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* `tooltip` shows on hover when collapsed */}
            <SidebarMenuButton asChild tooltip="ReadME">
              <Link href="/" className="flex items-center gap-2">
                <Code2 className="h-6 w-6 shrink-0" />
                {/* Hide name only when collapsed to icon mode */}
                <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
                  ReadME
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
