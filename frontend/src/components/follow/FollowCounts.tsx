// frontend/src/components/follow/FollowCounts.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/supabaseClient";
import { FollowList } from "./FollowList";

type Kind = "followers" | "following";

export function FollowCounts({ profileId }: { profileId: string }) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<Kind>("followers");

  const fetchCounts = useCallback(async () => {
    const [{ count: c1 }, { count: c2 }] = await Promise.all([
      supabase
        .from("follow")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", profileId),
      supabase
        .from("follow")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileId),
    ]);
    setFollowers(c1 ?? 0);
    setFollowing(c2 ?? 0);
  }, [profileId]);

  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  const openDialog = (kind: Kind) => {
    setActiveKind(kind);
    setOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-4 text-sm">
        <button
          className={cn("hover:underline underline-offset-4")}
          onClick={() => openDialog("followers")}
          aria-label="フォロワー一覧を表示"
        >
          <span className="font-semibold">{followers}</span> フォロワー
        </button>

        <button
          className={cn("hover:underline underline-offset-4")}
          onClick={() => openDialog("following")}
          aria-label="フォロー中の一覧を表示"
        >
          <span className="font-semibold">{following}</span> フォロー中
        </button>
      </div>

      <Dialog
        open={open}
        onOpenChange={async (v) => {
          setOpen(v);
          if (!v) await fetchCounts(); // 閉じたら数を更新
        }}
      >
        {/* ← ポイント: forceMount でアンマウントしない */}
        <DialogContent className="max-w-lg" forceMount>
          <DialogHeader>
            <DialogTitle>
              {activeKind === "followers" ? "フォロワー" : "フォロー中"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {activeKind === "followers"
                ? "あなたをフォローしているユーザーの一覧です。"
                : "あなたがフォローしているユーザーの一覧です。"}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            {/* ← ポイント: enabled と key で安定制御 */}
            <FollowList
              key={`${activeKind}-${profileId}`}
              kind={activeKind}
              profileId={profileId}
              enabled={open}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
