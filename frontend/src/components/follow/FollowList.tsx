"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/supabaseClient";
import { FollowButton } from "./FollowButton";
import Link from "next/link";

type Row = {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  image_url: string | null;
};

export function FollowList({
  kind,
  profileId,
  pageSize = 10,
  enabled = true,
}: {
  kind: "followers" | "following";
  profileId: string;
  pageSize?: number;
  enabled?: boolean; // ← 追加
}) {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [everLoaded, setEverLoaded] = useState(false);
  const requestIdRef = useRef(0); // ← 遅延応答無視

  // 初期化（enabled の変化も見る）
  useEffect(() => {
    if (!enabled) return;
    setItems([]);
    setPage(0);
    setDone(false);
    setEverLoaded(false);
  }, [kind, profileId, enabled]);

  // 初回ロード
  useEffect(() => {
    if (!enabled) return;
    void fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, profileId, enabled]);

  const fetchPage = async (pageIndex: number, replace = false) => {
    if (!enabled || loading || (done && !replace)) return;
    setLoading(true);
    const myReq = ++requestIdRef.current;

    // 1) follow edges
    const base = supabase
      .from("follow")
      .select("follower_id, followee_id, created_at")
      .order("created_at", { ascending: false })
      .range(pageIndex * pageSize, pageIndex * pageSize + pageSize - 1);

    const { data: edges, error: edgeErr } =
      kind === "followers"
        ? await base.eq("followee_id", profileId)
        : await base.eq("follower_id", profileId);

    if (requestIdRef.current !== myReq) return; // 古い応答を破棄
    if (edgeErr) {
      setLoading(false);
      setEverLoaded(true);
      return;
    }

    const ids = Array.from(
      new Set(
        (edges ?? []).map((e) =>
          kind === "followers" ? e.follower_id : e.followee_id,
        ),
      ),
    );

    if (ids.length === 0) {
      setDone(true);
      setLoading(false);
      setEverLoaded(true);
      if (replace) setItems([]); // 明示
      return;
    }

    // 2) profiles
    const { data: profiles, error: profErr } = await supabase
      .from("profile")
      .select("id, username, first_name, last_name, image_url")
      .in("id", ids);

    if (requestIdRef.current !== myReq) return; // 古い応答を破棄
    if (profErr) {
      setLoading(false);
      setEverLoaded(true);
      return;
    }

    const byId = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        {
          id: p.id,
          username: p.username,
          first_name: p.first_name,
          last_name: p.last_name,
          image_url: p.image_url,
        } as Row,
      ]),
    );

    const merged = ids.map((id) => byId.get(id)).filter(Boolean) as Row[];

    setItems((prev) => {
      const seen = new Set(prev.map((x) => x.id));
      const dedup = merged.filter((x) => !seen.has(x.id));
      return replace ? dedup : [...prev, ...dedup];
    });

    if ((edges?.length ?? 0) < pageSize) setDone(true);

    setLoading(false);
    setEverLoaded(true);
  };

  const loadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  };

  const onRelationChange = (nowFollowing: boolean, id: string) => {
    if (kind === "following" && !nowFollowing) {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const goProfile = (username: string) => {
    router.push(`/me/${username}`);
  };

  const initialLoading = !everLoaded && loading;

  return (
    <div className="space-y-2" aria-busy={loading}>
      {/* 初回スケルトン */}
      {initialLoading && <RailSkeleton rows={5} />}

      <ul className="space-y-2" aria-busy={loading}>
        {items.map((u) => (
          <li
            key={`${kind}-${u.id}`}
            className="flex items-center justify-between gap-3 rounded-md border p-2"
          >
            {u.username ? (
              <Link
                href={`/me/${u.username}`}
                className="flex items-center gap-3 min-w-0"
                aria-label={`${u.last_name} ${u.first_name} のプロフィールへ`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.image_url || undefined} />
                  <AvatarFallback>{u.last_name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium leading-tight truncate">
                    {u.last_name} {u.first_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{u.username}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 min-w-0 opacity-70">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.image_url || undefined} />
                  <AvatarFallback>{u.last_name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium leading-tight truncate">
                    {u.last_name} {u.first_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @unknown
                  </div>
                </div>
              </div>
            )}

            <FollowButton
              targetProfileId={u.id}
              onChanged={(now) => onRelationChange(now, u.id)}
            />
          </li>
        ))}
      </ul>

      {/* 追加読み込み中のスケルトン */}
      {everLoaded && loading && items.length > 0 && <RailSkeleton rows={2} />}

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

      {items.length === 0 && !loading && everLoaded && (
        <p className="text-sm text-muted-foreground py-2">ユーザーがいません</p>
      )}
    </div>
  );
}

/* スケルトン */
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
