import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event, ParticipantWithProfile } from "@/lib/types";

// Data Fetching
export async function getEventBySlug(
  sb: SupabaseClient,
  slug: string,
): Promise<{ data: Event | null; error?: string }> {
  const { data, error } = await sb
    .from("event")
    .select(
      `
      id,
      name,
      slug,
      description,
      bannerUrl:banner_url,
      websiteUrl:website_url,
      endAt:end_at
    `,
    )
    .eq("slug", slug)
    .maybeSingle()
    .overrideTypes<Event, { merge: false }>();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "event not found" };
  return { data };
}

export async function getParticipantsWithProfiles(
  sb: SupabaseClient,
  eventId: string,
): Promise<{ data: ParticipantWithProfile[]; error?: string }> {
  const { data, error } = await sb
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
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true })
    .overrideTypes<ParticipantWithProfile[], { merge: false }>();

  if (error) return { data: [], error: error.message };
  return { data: data ?? [] };
}

// Role display
export function getRoleBadgeVariant(
  role?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch ((role ?? "").toLowerCase()) {
    case "owner":
      return "destructive";
    case "admin":
    case "judge":
      return "default";
    case "mentor":
    case "member":
    case "participant":
    case "guest":
      return "secondary";
    default:
      return "outline";
  }
}

export function getRoleDisplay(role?: string | null) {
  const r = (role ?? "").toLowerCase();
  if (r === "owner") return "オーナー";
  if (r === "admin") return "管理者";
  if (r === "judge") return "審査員";
  if (r === "mentor") return "メンター";
  if (r === "participant" || r === "member") return "参加者";
  if (r === "guest") return "ゲスト";
  return role ?? "未設定";
}
