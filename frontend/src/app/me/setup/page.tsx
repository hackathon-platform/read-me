// src/app/profile/setup/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ProfileSetupForm } from "@/components/me/ProfileSetupForm";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  // If not logged in, redirect to /auth/login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="text-center py-20">読み込み中…</div>;
  }

  return <ProfileSetupForm />;
}
