// src/app/profile/page.tsx - Optimized Version
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import PageLayout from "@/components/layout/pageLayout";

export default function YourProfileRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Early return if still loading auth
    if (isLoading) return;

    // Immediate redirect if no user
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Only check profile if we haven't started redirecting
    if (isRedirecting) return;

    const checkProfileAndRedirect = async () => {
      setIsRedirecting(true);

      try {
        // Single optimized query with specific field selection
        const { data, error } = await supabase
          .from("profile")
          .select("username")
          .eq("id", user.id)
          .single();

        // Handle the redirect based on result
        if (error || !data?.username) {
          router.replace("/navi/setup");
        } else {
          router.replace(`/navi/${data.username}`);
        }
      } catch (err) {
        console.error("Profile check error:", err);
        router.replace("/navi/setup");
      }
    };

    checkProfileAndRedirect();
  }, [user, isLoading, router, isRedirecting]);

  // Show loading only when necessary
  if (isLoading || isRedirecting) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中…</p>
        </div>
      </PageLayout>
    );
  }

  return null;
}
