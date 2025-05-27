// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/components/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Navi",
  description: "Join and Participate in Events with Portfolio",
};


// suppressHydrationWarning は後で対応
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden
        `}
        suppressHydrationWarning
      >
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <Header />
            <Toaster />
            <main>{children}</main>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
