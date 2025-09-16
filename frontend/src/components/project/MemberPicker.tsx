"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileMini = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};

type Props = {
  excludeIds?: string[]; // 例: 自分の profile_id を渡して候補から除外
  selected: ProfileMini[]; // 選択済み
  onAdd: (p: ProfileMini) => void; // 追加コールバック
  onRemove: (id: string) => void; // 削除コールバック
  className?: string;
};

export function MemberPicker({
  excludeIds = [],
  selected,
  onAdd,
  onRemove,
  className,
}: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProfileMini[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // debounce: 250ms
  useEffect(() => {
    const t = setTimeout(() => {
      void runSearch();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function runSearch() {
    const query = q.trim();
    if (!query) {
      setResults([]);
      setErr(null);
      return;
    }
    try {
      setLoading(true);
      setErr(null);

      // username のみで検索
      const { data, error } = await supabase
        .from("profile")
        .select("id, username, first_name, last_name, image_url")
        .ilike("username", `%${query}%`)
        .order("username", { ascending: true })
        .limit(20);

      if (error) throw error;

      const exclude = new Set([...excludeIds, ...selected.map((s) => s.id)]);

      const filtered = (data ?? [])
        .filter((p) => p.username) // username を持つものだけ表示
        .filter((p) => !exclude.has(p.id)); // 除外

      setResults(filtered);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function add(p: ProfileMini) {
    onAdd(p);
    setQ("");
    setResults([]);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 入力 */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="メンバーを追加する（@username で検索）"
          className="pl-8"
        />
        {q && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="clear"
            onClick={() => {
              setQ("");
              setResults([]);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 候補リスト */}
      {q && (
        <div className="rounded-md border">
          {loading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              検索中…
            </div>
          )}
          {!loading && err && (
            <div className="px-3 py-2 text-sm text-destructive">{err}</div>
          )}
          {!loading && !err && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              一致するユーザーが見つかりません。
            </div>
          )}

          {!loading &&
            !err &&
            results.map((p) => {
              const displayName =
                `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() ||
                (p.username ? `@${p.username}` : "User");
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={p.image_url ?? undefined}
                        alt={p.username ?? ""}
                      />
                      <AvatarFallback>
                        {(
                          p.last_name?.[0] ??
                          p.username?.[0] ??
                          "U"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {displayName}
                      </div>
                      {p.username && (
                        <div className="truncate text-xs text-muted-foreground">
                          @{p.username}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="追加"
                    onClick={() => add(p)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
        </div>
      )}

      {/* 選択済み（小さなチップ） */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((m) => {
            const label = m.username ? `@${m.username}` : "User";
            return (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]"
              >
                {label}
                <button
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label="remove"
                  onClick={() => onRemove(m.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
