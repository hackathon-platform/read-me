"use client";

import React, { ReactNode, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/app-sidebar";
import { useSupabase } from "@/components/supabase-provider";
import { Toaster } from "@/components/ui/sonner";

type Props = { children: ReactNode };

// memoize the heavy sidebar so it won't re-render unless its props change
const MemoAppSidebar = React.memo(AppSidebar);

export default function Layout({ children }: Props) {
  const { user, loading } = useSupabase();
  const visible = !!user && !loading;

  // create the sidebar element once (props are static)
  const sidebar = useMemo(() => <MemoAppSidebar />, []);

  return (
    <div className="flex w-full flex-col">
      <div className="w-full">
        <div
          style={
            visible
              ? undefined
              : ({ ["--sidebar-width" as any]: "0px" } as React.CSSProperties)
          }
        >
          <SidebarProvider>
            {sidebar}
            <SidebarInset className="flex-1 overflow-y-auto mt-[2.7rem] h-[calc(100vh-2.7rem)]">
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}
