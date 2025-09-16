// frontend/src/components/event/participant/ProfileLoader.tsx
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileContent } from "@/components/me/ProfileContent";
import { getProfileByUsername } from "@/lib/supabase/get/profile";
import type { Profile } from "@/lib/types";

type Props = { username: string };

export function ProfileLoader({ username }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!username) {
      setError("ユーザー名が指定されていません。");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setProfile(null);

    (async () => {
      const { data, error } = await getProfileByUsername(username);
      if (cancelled) return;
      if (error) {
        setError(error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true; // avoid setting state after unmount
    };
  }, [username]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 w-48">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        プロフィールが見つかりませんでした。
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}
