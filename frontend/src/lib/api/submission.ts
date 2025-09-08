import { supabase } from "@/lib/supabaseClient";

export async function upsertSubmission(payload: {
  event_id: string;
  profile_id: string;
  title: string;
  description?: string | null;
  track?: string | null;
  demo_url?: string | null;
  repo_url?: string | null;
  slide_url?: string | null;
}) {
  const { data, error } = await supabase
    .from("submission")
    .upsert(payload, { onConflict: "event_id,profile_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listSubmissions(eventId: string) {
  const { data, error } = await supabase
    .from("submission")
    .select("*, profile:profile_id(id, first_name, last_name, image_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMySubmission(eventId: string, profileId: string) {
  const { data } = await supabase
    .from("submission")
    .select("*")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return data;
}