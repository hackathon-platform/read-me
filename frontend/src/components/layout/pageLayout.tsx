"use client";

import React, { ReactNode, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useSupabase } from "@/components/supabase-provider";

type Props = { children: ReactNode };

// memoize the heavy sidebar so it won't re-render unless its props change
const MemoAppSidebar = React.memo(AppSidebar);

export default function PageLayout({ children }: Props) {
  const { user, loading } = useSupabase();
  const visible = !!user && !loading;

  // create the sidebar element once (props are static)
  const sidebar = useMemo(() => <MemoAppSidebar className="pt-[3.5rem]" />, []);

  return (
    // override --sidebar-width on an ancestor so *both* aside & inset respect it
    <div
      style={
        visible
          ? undefined
          : ({ ["--sidebar-width" as any]: "0px" } as React.CSSProperties)
      }
    >
      <SidebarProvider>
        {sidebar}
        <SidebarInset className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
