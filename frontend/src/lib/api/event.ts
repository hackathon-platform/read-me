import { supabase } from "@/lib/supabaseClient";
export async function createEvent(payload: {
  name: string;
  slug: string;
  description?: string | null;
  banner_url?: string | null;
  icon_url?: string | null;
  website?: string | null;
  email?: string | null;
  created_by?: string | null; // profile.id を想定
}) {
  const { data, error } = await supabase
    .from("event")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}