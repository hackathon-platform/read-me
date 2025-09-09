"use client";

import * as React from "react";
import {
  Code2,
  User,
  CalendarCheck,
  Megaphone,
  BookOpen,
  LifeBuoy,
  MessageSquare,
  Briefcase,
  Activity,
  SquarePlus,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

const data = {
  navMain: [
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
      title: "参加する",
      url: "/event",
      icon: CalendarCheck,
      isActive: true,
      items: [],
    },
    {
      title: "イベント開催",
      url: "/org",
      icon: Megaphone,
      items: [{ title: "イベント新規作成", url: "/org/new" }],
    },
    {
      title: "インターン",
      url: "/job",
      icon: Briefcase,
      items: [],
    },
    // {
    //   title: "ドキュメント",
    //   url: "/#",
    //   icon: BookOpen,
    //   items: [
    //     { title: "ようこそ！", url: "/#" },
    //     { title: "はじめに", url: "/#" },
    //     { title: "イベント参加方法", url: "/#" },
    //     { title: "イベント開催方法", url: "/#" },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
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
