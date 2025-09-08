// src/app/profile/page.tsx - Optimized Version
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import Loading from "@/components/common/Loading";

export default function ProfileRedirectPage() {
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
          router.replace("/me/setup");
        } else {
          router.replace(`/me/${data.username}`);
        }
      } catch (err) {
        console.error("Profile check error:", err);
        router.replace("/me/setup");
      }
    };

    checkProfileAndRedirect();
  }, [user, isLoading, router, isRedirecting]);

  // Show loading only when necessary
  if (isLoading || isRedirecting) {
    return <Loading/>
  }

  return null;
}
