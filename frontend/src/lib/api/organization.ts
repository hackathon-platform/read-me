import { supabase } from "@/lib/supabaseClient";

/**
 * Get full organization object by slug (e.g., from URL).
 */
export async function getOrganizationBySlug(slug: string) {
  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// export async function getEventsByOrganizer(profileId: string) {
//   // 1. Get all organization IDs the user belongs to
//   const { data: organizerData, error: organizerError } = await supabase
//     .from("organizer")
//     .select("organization_id")
//     .eq("profile_id", profileId);

//   if (organizerError) throw new Error(organizerError.message);
//   const orgIds = organizerData.map((o) => o.organization_id);

//   if (orgIds.length === 0) return [];

//   // 2. Get events that belong to those organizations
//   const { data: events, error: eventsError } = await supabase
//     .from("event")
//     .select("*")
//     .in("organizationId", orgIds);

//   if (eventsError) throw new Error(eventsError.message);
//   return events;
// }


/**
 * Create a new organization and register creator as 'owner'.
 */
export async function createOrganization({
  name,
  slug,
  description,
  website,
  email,
  banner_url,
  icon_url,
  created_by,
}: {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  email?: string;
  banner_url?: string;
  icon_url?: string;
  created_by: string;
}) {
  // 1. Create organization
  const { data: org, error: orgError } = await supabase
    .from("organization")
    .insert({
      name,
      slug,
      description,
      website,
      email,
      banner_url,
      icon_url,
      created_by,
    })
    .select()
    .single();

  if (orgError || !org) throw new Error(orgError?.message || "組織の作成に失敗しました");

  // 2. Insert initial organizer record
  const { error: organizerError } = await supabase.from("organizer").insert({
    profile_id: created_by,
    organization_id: org.id,
    role: "owner",
  });

  if (organizerError) throw new Error("オーナーとしての登録に失敗しました");

  return org;
}

/**
 * Get all organizations a user is part of.
 */
export async function getOrganizationsByUser(profileId: string) {
  const { data, error } = await supabase
    .from("organizer")
    .select("organization:organization_id(*)")
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);
  console.log("Fetched organizer data:", data);
  return data.map((entry) => entry.organization);
}
