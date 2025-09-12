"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ImageIcon, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";

// schema-aligned: project as deliverable, project_member for members, participant for attendees
export type Deliverable = {
  id: string;
  title: string;
  summary: string;
  thumbnail_url?: string | null;
  created_at?: string | null;
  content?: string | null;
  event_slug?: string | null;
  owner?: {
    id: string;
    username?: string | null;
    image_url?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  members?: Array<{
    profile: {
      id: string;
      username?: string | null;
      image_url?: string | null;
      first_name?: string | null;
      last_name?: string | null;
    };
  }> | null;
};

export type Participant = {
  id: string;
  role?: "owner" | "admin" | "member" | "guest" | null;
  profile: {
    id: string;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

export default function EventDeliverablesGallery({
  eventId,
  eventSlug,
  enableParticipantsTab = true,
  pageSize = 24,
}: {
  eventId?: string;
  eventSlug?: string;
  enableParticipantsTab?: boolean;
  pageSize?: number;
}) {
  const isMobile = useIsMobile();
  const [resolved, setResolved] = React.useState<{
    id?: string;
    slug?: string;
  }>({ id: eventId, slug: eventSlug });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Deliverable[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);

  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Deliverable | null>(null);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [tab, setTab] = React.useState("preview");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    (async () => {
      try {
        if (!resolved.slug && resolved.id) {
          const { data, error } = await supabase
            .from("event")
            .select("slug")
            .eq("id", resolved.id)
            .single();
          if (error) throw error;
          setResolved((r) => ({ ...r, slug: data?.slug }));
        } else if (!resolved.id && resolved.slug) {
          const { data, error } = await supabase
            .from("event")
            .select("id")
            .eq("slug", resolved.slug)
            .single();
          if (error) throw error;
          setResolved((r) => ({ ...r, id: data?.id }));
        }
      } catch (e: any) {
        console.error(e);
        setError("イベント情報の解決に失敗しました");
      }
    })();
  }, [resolved.id, resolved.slug]);

  React.useEffect(() => {
    (async () => {
      if (!resolved.slug) return;
      setLoading(true);
      setError(null);
      try {
        const { data: projects, error: pErr } = await supabase
          .from("project")
          .select(
            `
            id, title, summary, thumbnail_url, created_at, content, event_slug,
            owner:profile!projects_profile_id_fkey (
              id, username, image_url, first_name, last_name
            ),
            members:project_member (
              profile:profile!project_member_profile_id_fkey (
                id, username, image_url, first_name, last_name
              )
            )
          `,
          )
          .eq("event_slug", resolved.slug)
          .order("created_at", { ascending: false });

        if (pErr) throw pErr;
        setItems((projects as unknown as Deliverable[]) ?? []);

        if (enableParticipantsTab && resolved.id) {
          const { data: parts, error: partsErr } = await supabase
            .from("participant")
            .select(
              `id, role, profile:profile!organizer_profile_id_fkey(id, username, first_name, last_name, image_url)`,
            )
            .eq("event_id", resolved.id)
            .order("role", { ascending: true });
          if (partsErr) throw partsErr;
          setParticipants((parts as unknown as Participant[]) ?? []);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [resolved.slug, resolved.id, enableParticipantsTab]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? items.filter((d) =>
          [
            d.title,
            d.summary ?? "",
            d.owner?.username ?? "",
            `${d.owner?.first_name ?? ""} ${d.owner?.last_name ?? ""}`,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : items;
    const start = (page - 1) * pageSize;
    return base.slice(start, start + pageSize);
  }, [items, query, page, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil((query ? filtered.length : items.length) / pageSize),
  );

  const openPreview = (d: Deliverable) => {
    setSelected(d);
    if (isMobile) setOpenDrawer(true);
  };

  if (!resolved.slug && !resolved.id && !eventId && !eventSlug) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          eventId もしくは eventSlug を指定してください。
        </p>
      </Card>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="検索：タイトル、概要、作成者…"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            className="w-full sm:w-80"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{items.length} 件</Badge>
        </div>
      </div>

      <div className="hidden md:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border bg-card"
        >
          <ResizablePanel defaultSize={35} minSize={35} className="p-4">
            {loading ? (
              <GallerySkeleton />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <GalleryGrid items={filtered} onClick={openPreview} />
            )}
            {!loading && !error && items.length > pageSize && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  前へ
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  次へ
                </Button>
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={65}
            minSize={60}
            className="border-l bg-background"
          >
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="flex h-full flex-col"
            >
              <TabsList className="sticky top-0 z-10 -mb-px w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsTrigger value="preview">プレビュー</TabsTrigger>
                {enableParticipantsTab && (
                  <TabsTrigger value="participants">参加者</TabsTrigger>
                )}
              </TabsList>

              <TabsContent
                value="preview"
                className="m-0 flex-1 overflow-auto p-4"
              >
                {!selected ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      左のギャラリーからアイテムを選択してください
                    </p>
                  </div>
                ) : (
                  <DeliverablePreview d={selected} />
                )}
              </TabsContent>

              {enableParticipantsTab && (
                <TabsContent
                  value="participants"
                  className="m-0 flex-1 overflow-auto p-4"
                >
                  <ParticipantsList participants={participants} />
                </TabsContent>
              )}
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="md:hidden">
        {loading ? (
          <GallerySkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <GalleryGrid items={filtered} onClick={openPreview} />
        )}
        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
          <DrawerContent className="max-h-[85vh] overflow-auto p-0">
            <DrawerHeader className="px-4 pt-4">
              <DrawerTitle>プレビュー</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {selected && <DeliverablePreview d={selected} />}
            </div>
            <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background/80 p-3">
              <DrawerClose asChild>
                <Button variant="secondary">閉じる</Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function GalleryGrid({
  items,
  onClick,
}: {
  items: Deliverable[];
  onClick: (d: Deliverable) => void;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">
          提出された成果物はまだありません。
        </p>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {items.map((d) => (
        <button
          key={d.id}
          onClick={() => onClick(d)}
          className="group overflow-hidden rounded-xl border text-left transition hover:shadow-md"
        >
          <div className="relative aspect-video w-full bg-muted">
            {d.thumbnail_url ? (
              <img
                src={d.thumbnail_url || ""}
                alt={d.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-white opacity-0 transition group-hover:opacity-100">
              <p className="line-clamp-1 text-sm font-medium">{d.title}</p>
              <p className="line-clamp-1 text-xs opacity-80">
                {d.owner?.username ||
                  `${d.owner?.first_name ?? ""} ${d.owner?.last_name ?? ""}`}
              </p>
            </div>
          </div>
          <div className="space-y-2 p-3">
            <p className="line-clamp-1 font-medium">{d.title}</p>
            {d.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {d.summary}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function DeliverablePreview({ d }: { d: Deliverable }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{d.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {d.owner?.username ||
              `${d.owner?.first_name ?? ""} ${d.owner?.last_name ?? ""}`}
          </div>
        </div>
        {d.owner?.id && (
          <Button asChild size="sm" variant="secondary">
            <Link href={`/u/${d.owner.id}`}>
              <ExternalLink className="mr-1 h-4 w-4" /> View profile
            </Link>
          </Button>
        )}
      </div>

      {d.thumbnail_url && (
        <img
          src={d.thumbnail_url}
          alt={d.title}
          className="w-full rounded-lg border"
        />
      )}

      {d.summary && (
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {d.summary}
        </p>
      )}
      {d.content && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{d.content}</p>
        </div>
      )}
    </div>
  );
}

function ParticipantsList({ participants }: { participants: Participant[] }) {
  if (!participants || participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">参加者情報がありません。</p>
    );
  }
  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg border p-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={p.profile.image_url || undefined}
              alt={p.profile.username || ""}
            />
            <AvatarFallback>
              {(p.profile.username || p.profile.first_name || "?")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {p.profile.username ||
                `${p.profile.first_name || ""} ${p.profile.last_name || ""}` ||
                "匿名"}
            </p>
            {p.role && (
              <p className="truncate text-xs text-muted-foreground">{p.role}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/u/${p.profile.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
    </Card>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
