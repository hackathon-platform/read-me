import { supabase } from "@/lib/supabase/supabaseClient";

export async function follow(profileIdMe: string, profileIdTarget: string) {
  if (profileIdMe === profileIdTarget)
    return { error: "自分はフォローできません" };
  return await supabase
    .from("follow")
    .insert({
      follower_id: profileIdMe,
      followee_id: profileIdTarget,
    })
    .select("id")
    .single();
}

export async function unfollow(profileIdMe: string, profileIdTarget: string) {
  if (profileIdMe === profileIdTarget) return { error: "自分は対象外" };
  return await supabase
    .from("follow")
    .delete()
    .match({ follower_id: profileIdMe, followee_id: profileIdTarget });
}

export async function isFollowing(
  profileIdMe: string | null,
  profileIdTarget: string,
) {
  if (!profileIdMe) return false;
  const { count } = await supabase
    .from("follow")
    .select("*", { count: "exact", head: true })
    .match({ follower_id: profileIdMe, followee_id: profileIdTarget });
  return (count ?? 0) > 0;
}
