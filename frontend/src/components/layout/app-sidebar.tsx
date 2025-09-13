"use client";

import * as React from "react";
import {
  User,
  Megaphone,
  LifeBuoy,
  MessageSquare,
  Home,
  SquarePlus,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "ホーム",
      url: "/",
      icon: Home,
      items: [],
    },
    {
      title: "プロフィール",
      url: "/me",
      icon: User,
      items: [],
    },
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
    {
      title: "サポート",
      url: "/#",
      icon: LifeBuoy,
    },
    {
      title: "フィードバック",
      url: "/#",
      icon: MessageSquare,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { user, signOut, loading } = useSupabase();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
