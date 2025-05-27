"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavProjects } from "@/components/ui/nav-projects";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { NavUser } from "@/components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "プロファイル",
      url: "profile",
      icon: Settings2,
      items: [
        {
          title: "ポートファリオ",
          url: "profile",
        },
        {
          title: "質問事項",
          url: "profile/edit",
        },
      ],
    },
    {
      title: "参加する",
      url: "events",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "イベント検索",
          url: "events",
        },
        {
          title: "登録済みイベント",
          url: "#",
        },
      ],
    },
    {
      title: "開催する",
      url: "host",
      icon: Bot,
      items: [
        {
          title: "運営チーム",
          url: "#",
        },
        {
          title: "開催中のイベント",
          url: "#",
        },
      ],
    },
    {
      title: "ドキュメント",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "ようこそ！",
          url: "#",
        },
        {
          title: "はじめに",
          url: "#",
        },
        {
          title: "イベント参加方法",
          url: "#",
        },
        {
          title: "イベント開催方法",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      {...props}
      collapsible="icon"
      className="h-[calc(100vh-4rem)] top-16"
    >
      <SidebarHeader className="border-b px-4 py-2">
        <SidebarTrigger className="-ml-1" />
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
