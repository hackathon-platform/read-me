"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { follow, unfollow, isFollowing } from "@/lib/supabase/follow";
import { useMyProfileId } from "@/hooks/useMyProfileId";

export function FollowButton({
  targetProfileId,
  onChanged,
}: {
  targetProfileId: string;
  onChanged?: (following: boolean) => void;
}) {
  const { profileId: me } = useMyProfileId();
  const disabled = !me || me === targetProfileId;
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!me || disabled) {
        setFollowing(false);
        return;
      }
      const f = await isFollowing(me, targetProfileId);
      if (alive) setFollowing(f);
    })();
    return () => {
      alive = false;
    };
  }, [me, targetProfileId, disabled]);

  const onToggle = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      if (following) {
        await unfollow(me!, targetProfileId);
        setFollowing(false);
        onChanged?.(false);
      } else {
        await follow(me!, targetProfileId);
        setFollowing(true);
        onChanged?.(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (disabled) return null;

  return (
    <Button
      variant={following ? "secondary" : "default"}
      size="sm"
      onClick={onToggle}
      disabled={loading}
    >
      {following ? "フォロー中" : "フォロー"}
    </Button>
  );
}
