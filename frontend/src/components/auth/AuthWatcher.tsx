"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";

/** Redirects to "/" immediately when a SIGNED_OUT event happens */
export default function AuthWatcher() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/"); // landing page
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}
