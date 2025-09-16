"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { ParticipantWithProfile } from "@/lib/types";
import useIsMobile from "./useIsMobile";
import GalleryHeader from "./GalleryHeader";
import DesktopGalleryLayout from "./DesktopGalleryLayout";
import MobileGalleryLayout from "./MobileGalleryLayout";
import type { ProjectWithPeople } from "@/lib/types";

export default function EventDeliverablesGallery({
  eventId,
  eventSlug,
  pageSize = 24,
}: {
  eventId?: string;
  eventSlug?: string;
  pageSize?: number;
}) {
  const isMobile = useIsMobile();

  const [resolved, setResolved] = React.useState<{
    id?: string;
    slug?: string;
  }>({ id: eventId, slug: eventSlug });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<ProjectWithPeople[]>([]);
  const [participants, setParticipants] = React.useState<
    ParticipantWithProfile[]
  >([]);

  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<ProjectWithPeople | null>(
    null,
  );
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [tab, setTab] = React.useState<"preview" | "participants">("preview");
  const [page, setPage] = React.useState(1);

  // Resolve id/slug either way
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!resolved.slug && resolved.id) {
          const { data, error } = await supabase
            .from("event")
            .select("slug")
            .eq("id", resolved.id)
            .single();
          if (error) throw error;
          if (!cancelled) setResolved((r) => ({ ...r, slug: data?.slug }));
        } else if (!resolved.id && resolved.slug) {
          const { data, error } = await supabase
            .from("event")
            .select("id")
            .eq("slug", resolved.slug)
            .single();
          if (error) throw error;
          if (!cancelled) setResolved((r) => ({ ...r, id: data?.id }));
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError("イベント情報の解決に失敗しました");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolved.id, resolved.slug]);

  // Load gallery + participants
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!resolved.slug) return;
      setLoading(true);
      setError(null);
      try {
        const { data: projects, error: pErr } = await supabase
          .from("project")
          .select(
            `
            id,
            profileId:profile_id,
            title,
            summary,
            thumbnailUrl:thumbnail_url,
            createdAt:created_at,
            updatedAt:updated_at,
            content,
            eventSlug:event_slug,
            slug,
            owner:profile_id (
              id,
              username,
              imageUrl:image_url,
              firstName:first_name,
              lastName:last_name
            ),
            members:project_member (
              profile:profile_id (
                id,
                username,
                imageUrl:image_url,
                firstName:first_name,
                lastName:last_name
              )
            )
          `,
          )
          .eq("event_slug", resolved.slug)
          .order("created_at", { ascending: false });

        if (pErr) throw pErr;
        if (!cancelled)
          setItems((projects as unknown as ProjectWithPeople[]) ?? []);

        if (resolved.id) {
          const { data: parts, error: partsErr } = await supabase
            .from("participant")
            .select(
              `
              id,
              role,
              joinedAt:joined_at,
              profile:profile_id!inner (
                id,
                username,
                firstName:first_name,
                lastName:last_name,
                imageUrl:image_url
              )
            `,
            )
            .eq("event_id", resolved.id)
            .order("role", { ascending: true });

          if (partsErr) throw partsErr;
          if (!cancelled)
            setParticipants(
              (parts as unknown as ParticipantWithProfile[]) ?? [],
            );
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e?.message ?? "読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolved.slug, resolved.id]);

  // Search + pagination
  const { pageItems, totalPages } = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? items.filter((d) =>
          [
            d.title,
            d.summary ?? "",
            d.owner?.username ?? "",
            `${d.owner?.firstName ?? ""} ${d.owner?.lastName ?? ""}`,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : items;

    const total = Math.max(1, Math.ceil(base.length / pageSize));
    const clampedPage = Math.min(page, total);
    const start = (clampedPage - 1) * pageSize;
    const pageSlice = base.slice(start, start + pageSize);

    return { pageItems: pageSlice, totalPages: total };
  }, [items, query, page, pageSize]);

  const handleSelect = (d: ProjectWithPeople) => {
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
      <GalleryHeader
        query={query}
        onQueryChange={(v) => {
          setPage(1);
          setQuery(v);
        }}
        totalCount={items.length}
      />

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopGalleryLayout
          items={pageItems}
          loading={loading}
          error={error}
          selected={selected}
          onSelect={handleSelect}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          tab={tab}
          setTab={setTab}
          participants={participants}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileGalleryLayout
          items={pageItems}
          loading={loading}
          error={error}
          selected={selected}
          onSelect={handleSelect}
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
        />
      </div>
    </div>
  );
}
