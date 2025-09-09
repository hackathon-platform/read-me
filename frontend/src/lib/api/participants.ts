import type { SupabaseClient } from "@supabase/supabase-js";

export type EventRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  website_url: string | null;
  end_at: string | null;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  // プロファイルに email がない環境もあるので optional にしておくと安全
  email?: string | null;
};

export type ParticipantWithProfile = {
  id: string;
  role: string | null;
  joined_at: string | null;
  profile: ProfileRow;
};

// Event basic by slug
export async function getEventBasicBySlug(
  sb: SupabaseClient,
  slug: string
): Promise<EventRow | null> {
  const { data, error } = await sb
    .from("event")
    .select("id,name,slug,description,banner_url,website_url,end_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getEventBasicBySlug] error", error);
    return null;
  }
  return (data as EventRow) ?? null;
}

// Participants with joined profile (INNER JOIN with explicit FK + fallback)
export async function getParticipantsWithProfiles(
  sb: SupabaseClient,
  eventId: string
): Promise<ParticipantWithProfile[]> {
  const fkCandidates = [
    "organizer_profile_id_fkey",
    "organizer_user_id_fkey",
  ];

  for (const fk of fkCandidates) {
    const { data, error } = await sb
      .from("participant")
      .select(
        `
        id,
        role,
        joined_at,
        profile:profile!${fk} (
          id,
          username,
          first_name,
          last_name,
          image_url
        )
      `
      ) // ← 末尾カンマを削除
      .eq("event_id", eventId)
      .order("joined_at", { ascending: true });

    if (!error) {
      return (data ?? []).filter((r: any) => r.profile) as ParticipantWithProfile[];
    }
    console.warn(`[getParticipantsWithProfiles] try fk=${fk} failed`, error);
  }

  console.error("[getParticipantsWithProfiles] all FK candidates failed");
  return [];
}
