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

/* ---------- helpers ---------- */
function formatCount(n: number) {
  // Use compact for big numbers (ja-JP shows 1.2万 etc.)
  const opts =
    n >= 10000
      ? ({ notation: "compact", compactDisplay: "short" } as const)
      : ({ notation: "standard" } as const);
  return new Intl.NumberFormat("ja-JP", opts).format(n);
}

function CountButton({
  count,
  label,
  onClick,
  ariaLabel,
  className,
}: {
  count: number;
  label: string;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${ariaLabel}（${count}）`}
      className={cn(
        "group inline-flex items-baseline gap-1 rounded-md py-0.5",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
    >
      <span className="tabular-nums text-sm font-semibold tracking-tight group-hover:underline underline-offset-4">
        {formatCount(count)}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

/* ---------- main ---------- */
export function FollowCounts({ profileId }: { profileId: string }) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<Kind>("followers");

  const fetchCounts = useCallback(async () => {
    const [qFollowers, qFollowing] = await Promise.all([
      supabase
        .from("follow")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", profileId),
      supabase
        .from("follow")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileId),
    ]);
    setFollowers(qFollowers.count ?? 0);
    setFollowing(qFollowing.count ?? 0);
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
      <div className="flex items-center gap-3">
        <CountButton
          count={followers}
          label="フォロワー"
          onClick={() => openDialog("followers")}
          ariaLabel="フォロワー一覧を表示"
        />

        <span aria-hidden className="h-3 w-px bg-border" />

        <CountButton
          count={following}
          label="フォロー中"
          onClick={() => openDialog("following")}
          ariaLabel="フォロー中の一覧を表示"
        />
      </div>

      <Dialog
        open={open}
        onOpenChange={async (v) => {
          setOpen(v);
          if (!v) await fetchCounts(); // 閉じたら数を更新
        }}
      >
        <DialogContent className="mx-auto">
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
