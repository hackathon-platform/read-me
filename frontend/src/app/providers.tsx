"use client";

import { ReactNode } from "react";
import { SupabaseProvider } from "@/components/supabase-provider";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { ThemeProvider } from "@/components/theme-provider";
import AuthWatcher from "@/components/auth/AuthWatcher";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system">
          <AuthWatcher />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}
