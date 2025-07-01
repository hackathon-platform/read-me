"use client";
import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

type Props = {
  children: ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-[calc(100vh-0.5rem)] overflow-y-auto">
        <main className="p-3">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
