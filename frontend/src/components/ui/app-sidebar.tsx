"use client";

import * as React from "react";
import {
  User,
  CalendarCheck,
  Megaphone,
  BookOpen,
  LifeBuoy,
  MessageSquare,
  Briefcase,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "プロファイル",
      url: "/navi",
      icon: User,
      items: [
        { title: "ポートファリオ", url: "/navi" },
        { title: "質問事項", url: "/navi/edit" },
      ],
    },
    {
      title: "参加する",
      url: "/events",
      icon: CalendarCheck,
      isActive: true,
      items: [
        { title: "イベント検索", url: "/events" },
        { title: "登録済みイベント", url: "/#" },
      ],
    },
    {
      title: "開催する",
      url: "/orgs",
      icon: Megaphone,
      items: [
        { title: "開催中のイベント", url: "/#" },
        { title: "運営チーム", url: "/#" },
      ],
    },
    {
      title: "応募する",
      url: "/apply",
      icon: Briefcase,
      items: [
        { title: "インターン受付", url: "/#" },
        { title: "メール", url: "/#" },
      ],
    },
    {
      title: "ドキュメント",
      url: "/#",
      icon: BookOpen,
      items: [
        { title: "ようこそ！", url: "/#" },
        { title: "はじめに", url: "/#" },
        { title: "イベント参加方法", url: "/#" },
        { title: "イベント開催方法", url: "/#" },
      ],
    },
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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      {...props}
      collapsible="icon"
      className="h-[calc(100vh-4rem)] top-10"
    >
      <SidebarContent className="py-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
