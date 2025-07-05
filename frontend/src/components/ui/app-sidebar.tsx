"use client"

import * as React from "react"
import {
  Code2,
  User,
  CalendarCheck,
  Megaphone,
  BookOpen,
  LifeBuoy,
  MessageSquare,
  Briefcase,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavSecondary } from "@/components/ui/nav-secondary";
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { user, signOut, loading } = useSupabase();
  
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Code2 className="!size-5" />
                <span className="text-base font-semibold">Event Navi.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
