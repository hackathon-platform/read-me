"use client";

import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useSupabase } from "@/components/supabase-provider";

type Props = { children: ReactNode };

export default function PageLayout({ children }: Props) {
  const { user, loading } = useSupabase();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!user && !loading);
  }, [user, loading]);

  return (
    <SidebarProvider>
      <AppSidebar
        className="pt-[3.5rem]"
        data-hidden={!visible}
      />
      <SidebarInset
        className="h-[calc(100vh-3.5rem)] overflow-y-auto"
      >
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
