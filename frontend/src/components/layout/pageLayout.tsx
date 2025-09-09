"use client";
import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

type Props = {
  children: ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar className="pt-[3.5rem]" />
      <SidebarInset className="h-[calc(100vh-3.5rem)] overflow-y-auto">
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
