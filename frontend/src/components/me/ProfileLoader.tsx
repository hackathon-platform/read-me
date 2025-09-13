"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileContent } from "@/components/me/ProfileContent";
import type { Profile } from "@/lib/types";
import { getProfileByUsername } from "@/lib/supabase/get/profile";

type Props = { username: string };

export function ProfileLoader({ username }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!username) return;

    (async () => {
      setLoading(true);
      try {
        const { data } = await getProfileByUsername(username);
        if (!cancelled) setProfile(data ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!username) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        ユーザー名が指定されていません。
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        プロフィールを読み込めませんでした。
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}
