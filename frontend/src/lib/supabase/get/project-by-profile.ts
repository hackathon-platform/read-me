import { supabase } from "@/lib/supabase/supabaseClient";

export type DbProject = {
  id: string;
  profile_id: string;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  content: string | null;
  event_slug: string | null;
  created_at: string; // ISO
  updated_at: string; // ISO
};

/** プロフィールの全プロジェクト（更新日降順） */
export async function getProjectsByProfileId(profileId: string) {
  const { data, error } = await supabase
    .from("project")
    .select(
      "id, profile_id, title, summary, thumbnail_url, content, event_slug, created_at, updated_at",
    )
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false });

  return { data: (data ?? []) as DbProject[], error };
}
