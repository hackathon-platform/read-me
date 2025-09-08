import { supabase } from "@/lib/supabaseClient";

export async function isJudge(eventId: string, profileId: string) {
  const { data } = await supabase
    .from("judge")
    .select("id")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return Boolean(data);
}

export async function upsertJudge(eventId: string, profileId: string) {
  const { data, error } = await supabase
    .from("judge")
    .upsert({ event_id: eventId, profile_id: profileId }, { onConflict: "event_id,profile_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertScore(payload: {
  submission_id: string;
  judge_id: string; // you can pass an id or resolve by (event_id, profile_id)
  novelty?: number | null;
  impact?: number | null;
  technical?: number | null;
  presentation?: number | null;
  comment?: string | null;
}) {
  const { data, error } = await supabase
    .from("judge_score")
    .upsert(payload, { onConflict: "submission_id,judge_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listScoresForEvent(eventId: string) {
  const { data, error } = await supabase
    .from("submission_scores")
    .select("*")
    .eq("event_id", eventId)
    .order("avg_overall", { ascending: false });
  if (error) throw error;
  return data;
}
