// frontend/src/lib/api/geteventbyowner.ts
import { supabase } from "@/lib/supabaseClient";

export type EventForOrgCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  icon_url?: string | null;       // for the card's round icon (fallback shown if null)
  members_count?: number;         // participants length
  // you can add status/end_at/etc if you want to surface later
};

export async function getEventByOwner(userId: string): Promise<EventForOrgCard[]> {
  // Join participants to compute a count; explicit FK name avoids ambiguity
  const { data, error } = await supabase
    .from("event")
    .select(`
      id,
      name,
      slug,
      description,
      banner_url,
      created_at,
      participants:participant!organizer_organization_id_fkey ( id )
    `)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getEventByOwner] error", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    banner_url: string | null;
    participants?: Array<{ id: string }>;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    banner_url: r.banner_url,
    icon_url: null,
    members_count: r.participants?.length ?? 0,
  }));
}
