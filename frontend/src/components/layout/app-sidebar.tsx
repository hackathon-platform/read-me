"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  Home,
  User,
  SquarePlus,
  Megaphone,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { useSupabase } from "@/components/supabase-provider";
import { NavUser, type NavUserView } from "@/components/ui/nav-user";

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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut, loading } = useSupabase();
  const { isMobile } = useSidebar();

  const view: NavUserView | undefined = React.useMemo(() => {
    if (!user) return undefined;
    const first = user.first_name ?? "";
    const last = user.last_name ?? "";
    const name =
      first && last ? `${last} ${first}` : (user.full_name ?? "ユーザー");
    return {
      name,
      email: user.email ?? "",
      avatarUrl: user.image_url ?? "",
      initial: (last?.charAt(0) || "U").toUpperCase(),
    };
  }, [
    user?.first_name,
    user?.last_name,
    user?.full_name,
    user?.email,
    user?.image_url,
  ]);

  const onSignOut = React.useCallback(() => signOut(), [signOut]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          view={view}
          loading={loading}
          isMobile={isMobile}
          onSignOut={onSignOut}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
