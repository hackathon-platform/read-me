// app/org/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { getEventByOwner } from "@/lib/supabase/get/event-by-owner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ImageOff, Plus, ExternalLink, LayoutGrid, List } from "lucide-react";

/* ====================== Types ====================== */
type Org = {
  id: string;
  name: string;
  slug?: string;
  org_name?: string; // fallback for slug
  description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  status?: "draft" | "published";
  members_count?: number;
  events_count?: number;
};
type ViewMode = "grid" | "list";

/* ====================== Page ====================== */
export default function OrganizationsPage() {
  const { user } = useSupabaseAuth();
  const [events, setEvents] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getEventByOwner(user.id);
        setEvents((data || []) as Org[]);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "運営", href: "/org", current: true }]}
      />

      <div className="animate-in fade-in duration-500 mx-auto w-full px-4 py-4">
        {/* Heading */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-2xl md:text-3xl font-bold">運営中のイベント</h3>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              <Button
                type="button"
                variant={view === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("grid")}
                aria-label="グリッド表示"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={view === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("list")}
                aria-label="リスト表示"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton view={view} />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NewCard />
            {events.map((e) => (
              <OrganizationCard key={e.id} org={e} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <NewRow />
            {events.map((e) => (
              <OrganizationRow key={e.id} org={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================== Helpers ====================== */
function getEventHref(e: Org) {
  const slug = e.slug ?? e.org_name ?? e.id;
  return `/event/${slug}`;
}

/* ====================== Grid Card ====================== */
function OrganizationCard({ org }: { org: Org }) {
  const href = getEventHref(org);
  return (
    <Link href={href} className="group block">
      <Card className="relative pt-0 overflow-hidden border-2 hover:border-ring transition">
        {/* Banner */}
        <div className="relative h-28 bg-muted">
          {org.banner_url ? (
            <img
              src={org.banner_url}
              alt={`${org.name} banner`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground">
              <ImageOff className="w-6 h-6" />
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base md:text-lg leading-tight">
              <span className="line-clamp-1">{org.name}</span>
            </CardTitle>
            {/* <ExternalLink className="w-4 h-4 absolute z-20 top-2 right-2 text-muted-background opacity-0 group-hover:opacity-100 transition-opacity" /> */}
          </div>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {org.status && (
              <Badge
                variant={org.status === "published" ? "default" : "secondary"}
                className="px-2 py-0.5"
              >
                {org.status === "published" ? "公開中" : "下書き"}
              </Badge>
            )}
            {typeof org.members_count === "number" && (
              <Badge variant="outline" className="px-2 py-0.5">
                参加者 {org.members_count}
              </Badge>
            )}
            {typeof org.events_count === "number" && (
              <Badge variant="outline" className="px-2 py-0.5">
                イベント {org.events_count}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p
            className="text-sm text-muted-foreground line-clamp-1"
            title={org.description ?? undefined}
          >
            {org.description || "説明がありません。"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ====================== List Row ====================== */
function OrganizationRow({ org }: { org: Org }) {
  const href = getEventHref(org);
  return (
    <Link href={href} className="group block">
      <Card className="py-0 overflow-hidden border-2 hover:border-ring transition">
        <div className="flex items-stretch gap-4">
          {/* Thumb */}
          <div className="w-40 bg-muted shrink-0">
            {org.banner_url ? (
              <img
                src={org.banner_url}
                alt={`${org.name} banner`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-muted-foreground min-h-20">
                <ImageOff className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 py-3 pr-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
                    {org.name}
                  </span>
                  {org.status && (
                    <Badge
                      variant={
                        org.status === "published" ? "default" : "secondary"
                      }
                      className="px-2 py-0.5"
                    >
                      {org.status === "published" ? "公開中" : "下書き"}
                    </Badge>
                  )}
                </div>

                <p
                  className="text-sm text-muted-foreground mt-1 line-clamp-1"
                  title={org.description ?? undefined}
                >
                  {org.description || "説明がありません。"}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {typeof org.members_count === "number" && (
                    <Badge variant="outline" className="px-2 py-0.5">
                      参加者 {org.members_count}
                    </Badge>
                  )}
                  {typeof org.events_count === "number" && (
                    <Badge variant="outline" className="px-2 py-0.5">
                      イベント {org.events_count}
                    </Badge>
                  )}
                  {org.slug && (
                    <Badge variant="outline" className="px-2 py-0.5">
                      /event/{org.slug}
                    </Badge>
                  )}
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

/* ====================== “Create new” ====================== */
function NewCard() {
  return (
    <Link href="/event/new" className="group block">
      <Card className="pt-0 border-2 border-dashed hover:border-solid hover:border-ring transition">
        <div className="h-28 grid place-items-center bg-muted/30" />
        <CardHeader className="py-4">
          <CardTitle className="text-base md:text-lg flex items-center">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border mr-2 group-hover:bg-accent">
              <Plus className="w-4 h-4" />
            </span>
            新しいイベントを作成
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function NewRow() {
  return (
    <Link href="/event/new" className="group block">
      <Card className="border-2 border-dashed hover:border-solid hover:border-ring transition">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-muted-foreground">
            新しいイベントを作成
          </div>
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            作成
          </Button>
        </div>
      </Card>
    </Link>
  );
}

/* ====================== Empty / Skeleton ====================== */
function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted grid place-items-center">
          <ImageOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h4 className="text-lg font-semibold">
            運営中のイベントがありません
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            まずは新しいイベントを作成しましょう。
          </p>
        </div>
        <Button asChild>
          <Link href="/event/new">
            <Plus className="w-4 h-4 mr-1" />
            新しいイベント
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
function SkeletonCard() {
  return (
    <Card className="overflow-hidden pt-0">
      <Skeleton className="h-28 w-full rounded-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <Skeleton className="h-4 w-full mb-2" />
      </CardContent>
    </Card>
  );
}
function SkeletonRow() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-stretch gap-4">
        <Skeleton className="w-40 h-20" />
        <div className="flex-1 py-3 pr-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4 mt-2" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}
