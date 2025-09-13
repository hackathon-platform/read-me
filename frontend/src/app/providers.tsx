"use client";

import { ReactNode } from "react";
import { SupabaseProvider } from "@/components/supabase-provider";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import PageLayout from "@/components/layout/pageLayout";
import AuthWatcher from "@/components/auth/AuthWatcher";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system">
          <Header />
          <AuthWatcher />
          <PageLayout>{children}</PageLayout>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}
