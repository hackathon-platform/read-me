// app/org/page.tsx (or your current path)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { getOrganizationsByUser } from "@/lib/api/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ImageOff,
  Plus,
  ExternalLink,
  Building2,
} from "lucide-react";

type Org = {
  id: string;
  name: string;
  org_name?: string; // slug-ish
  slug?: string;
  description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  status?: "draft" | "published"; // if exists
  members_count?: number; // if exists
  events_count?: number;  // if exists
};

export default function OrganizationsPage() {
  const { user } = useSupabaseAuth();
  const [events, setEvents] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const eventData = await getOrganizationsByUser(user.id);
        setEvents((eventData || []) as Org[]);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: "運営", href: "/org", current: true }]} />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full md:px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl md:text-3xl font-bold">運営中のイベント</h3>
          <Button asChild>
            <Link href="/org/new">
              <Plus className="w-4 h-4 mr-1" />
              新しいイベント
            </Link>
          </Button>
        </div>

        {loading ? (
          <LoadingGridSkeleton />
        ) : (
          <section className="space-y-6">
            {events.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* New card shortcut */}
                <NewCard />

                {events.map((e) => (
                  <OrganizationCard key={e.id} org={e} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ UI Parts ------------------------------ */

function getOrgHref(e: Org) {
  const slug = e.slug ?? e.org_name ?? e.id;
  // 元コードは `/event/${e.org_name}`。ルーティングに合わせて必要ならここを調整。
  return `/event/${slug}`;
}

function OrganizationCard({ org }: { org: Org }) {
  const href = getOrgHref(org);
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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

          {/* Icon */}
          <div className="absolute -bottom-6 left-4">
            <div className="h-12 w-12 rounded-xl ring-2 ring-background border bg-background overflow-hidden grid place-items-center shadow-sm">
              {org.icon_url ? (
                <img
                  src={org.icon_url}
                  alt={`${org.name} icon`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <CardHeader className="pt-7 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base md:text-lg leading-tight">
              <span className="line-clamp-2">{org.name}</span>
            </CardTitle>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Chips row */}
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
                メンバー {org.members_count}
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
          <p className="text-sm text-muted-foreground line-clamp-3">
            {org.description || "説明がありません。"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function NewCard() {
  return (
    <Link href="/org/new" className="group block">
      <Card className="border-dashed hover:border-solid hover:shadow-md transition">
        <div className="h-28 grid place-items-center bg-muted/30" />
        <CardHeader className="py-4">
          <CardTitle className="text-base md:text-lg flex items-center">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border mr-2 group-hover:bg-accent">
              <Plus className="w-4 h-4" />
            </span>
            新しいハッカソンを作成
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted grid place-items-center">
          <ImageOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h4 className="text-lg font-semibold">まだ参加中の組織がありません</h4>
          <p className="text-sm text-muted-foreground mt-1">
            まずは新しいを作成するか、既存の組織に参加しましょう。
          </p>
        </div>
        <Button asChild>
          <Link href="/org/new">
            <Plus className="w-4 h-4 mr-1" />
            新しいイベント
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingGridSkeleton() {
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
      <Skeleton className="h-28 w-full" />
      <CardHeader className="pt-2 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}
