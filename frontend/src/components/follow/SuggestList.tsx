"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/supabaseClient";
import { FollowButton } from "./FollowButton";
import { useMyProfileId } from "@/hooks/useMyProfileId";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  image_url: string | null;
};

type Props = {
  pageSize?: number;
  /** md+ = "rail" (vertical), <md = "carousel" (horizontal) */
  variant?: "rail" | "carousel";
};

export function SuggestList({ pageSize = 10, variant = "rail" }: Props) {
  const { profileId: me } = useMyProfileId();
  const [items, setItems] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const followedIdsRef = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    (async () => {
      if (!me) return;
      const { data: edges } = await supabase
        .from("follow")
        .select("followee_id")
        .eq("follower_id", me)
        .limit(5000);
      edges?.forEach((e) => followedIdsRef.add(e.followee_id));
      followedIdsRef.add(me);
      await loadPage(0, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const loadPage = async (pageIndex: number, replace = false) => {
    if (!me || loading || done) return;
    setLoading(true);

    const moreFactor = variant === "carousel" ? 4 : 3;
    const { data: profiles } = await supabase
      .from("profile")
      .select("id, username, first_name, last_name, image_url, created_at")
      .order("created_at", { ascending: false })
      .range(
        pageIndex * pageSize,
        pageIndex * pageSize + pageSize * moreFactor - 1,
      );

    const filtered = (profiles ?? [])
      .filter((p) => !followedIdsRef.has(p.id))
      .slice(0, pageSize)
      .map<Row>((p) => ({
        id: p.id,
        username: p.username,
        first_name: p.first_name,
        last_name: p.last_name,
        image_url: p.image_url,
      }));

    setItems((prev) => (replace ? filtered : [...prev, ...filtered]));
    if (
      (profiles?.length ?? 0) < pageSize * moreFactor ||
      filtered.length < pageSize
    ) {
      setDone(true);
    }
    setLoading(false);
  };

  const onFollowed = (id: string) => {
    followedIdsRef.add(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const loadMore = async () => {
    const next = page + 1;
    setPage(next);
    await loadPage(next);
  };

  if (!me) return null;

  const initialLoading = loading && items.length === 0;
  const loadingMore = loading && items.length > 0;

  // ---------- vertical rail ----------
  if (variant === "rail") {
    return (
      <div className="space-y-2" aria-busy={loading}>
        {initialLoading && <RailSkeleton rows={5} />}

        {items.map((u) => (
          <Link
            key={u.id}
            href={`/me/${u.username}`}
            className="flex items-center justify-between gap-3 rounded-md border p-2"
            aria-label={`${u.last_name} ${u.first_name} のプロフィールへ`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={u.image_url || undefined} />
                <AvatarFallback>{u.last_name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {u.last_name} {u.first_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{u.username ?? "unknown"}
                </div>
              </div>
            </div>
            <FollowButton
              targetProfileId={u.id}
              onChanged={(now) => now && onFollowed(u.id)}
            />
          </Link>
        ))}

        {loadingMore && <RailSkeleton rows={2} />}

        {!done && items.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={loadMore}
          >
            もっと読み込む
          </Button>
        )}

        {items.length === 0 && done && !initialLoading && (
          <p className="text-sm text-muted-foreground py-2">
            おすすめユーザーは見つかりませんでした
          </p>
        )}
      </div>
    );
  }

  // ---------- horizontal carousel (mobile accordion) ----------
  return (
    <div
      className={cn(
        "overflow-x-auto pb-1",
        "[scrollbar-width:none] [-ms-overflow-style:none]",
        "[&::-webkit-scrollbar]:hidden",
      )}
      aria-busy={loading}
    >
      <div className="flex gap-3 px-1 snap-x snap-mandatory">
        {initialLoading && <CarouselSkeleton cards={4} />}

        {items.map((u) => (
          <Link
            key={u.id}
            href={`/me/${u.username}`}
            className="snap-start shrink-0 w-36 sm:w-40 rounded-md border p-3 flex flex-col items-center text-center"
            aria-label={`${u.last_name} ${u.first_name} のプロフィールへ`}
          >
            <Avatar className="h-14 w-14 mb-2">
              <AvatarImage src={u.image_url || undefined} />
              <AvatarFallback>{u.last_name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>

            <div className="w-full">
              <div className="text-sm font-medium leading-tight line-clamp-1">
                {u.last_name} {u.first_name}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                @{u.username ?? "unknown"}
              </div>
            </div>

            <div className="grow" />

            <div className="w-full pt-2">
              <FollowButton
                targetProfileId={u.id}
                onChanged={(now) => now && onFollowed(u.id)}
              />
            </div>
          </Link>
        ))}

        {loadingMore && <CarouselSkeleton cards={1} />}

        {!done && items.length > 0 && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="snap-start shrink-0 w-36 sm:w-40 rounded-md border p-3 grid place-items-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            もっと
          </button>
        )}
      </div>

      {items.length === 0 && done && !initialLoading && (
        <p className="text-sm text-muted-foreground py-2">
          おすすめがありません
        </p>
      )}
    </div>
  );
}

/* ---------- Skeletons ---------- */

function RailSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-md border p-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function CarouselSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="snap-start shrink-0 w-36 sm:w-40 rounded-md border p-3 flex flex-col items-center text-center"
        >
          <Skeleton className="h-14 w-14 rounded-full mb-2" />
          <div className="w-full space-y-1">
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="grow" />
          <Skeleton className="h-8 w-full rounded-md mt-2" />
        </div>
      ))}
    </>
  );
}
