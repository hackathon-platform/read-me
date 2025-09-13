"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useSupabase } from "@/components/supabase-provider";

type Props = { children: ReactNode };

export default function PageLayout({ children }: Props) {
  const { user, loading } = useSupabase();
  const showSidebar = !!user && !loading;

  return (
    <SidebarProvider>
      {showSidebar ? <AppSidebar className="pt-[3.5rem]" /> : null}

      <SidebarInset
        className="h-[calc(100vh-3.5rem)] overflow-y-auto"
        // shadcn/sidebar uses a CSS var for width—set to 0 when hidden
        style={
          showSidebar
            ? undefined
            : ({ ["--sidebar-width" as any]: "0px" } as React.CSSProperties)
        }
      >
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
