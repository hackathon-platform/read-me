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
  techKeys?: string[];
};

/** ref → key[] へまとめる（重複除去） */
function toKeyMap(rows: Array<{ ref: string; key: string }>) {
  const map: Record<string, string[]> = {};
  for (const r of rows ?? []) {
    const arr = (map[r.ref] ??= []);
    if (!arr.includes(r.key)) arr.push(r.key);
  }
  return map;
}

/** プロフィールの全プロジェクト（更新日降順）＋ techKeys */
export async function getProjectsByProfileId(profileId: string) {
  // 1) projects 本体
  const { data: projects, error } = await supabase
    .from("project")
    .select(
      "id, profile_id, title, summary, thumbnail_url, content, event_slug, created_at, updated_at",
    )
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false });

  if (error) return { data: [] as DbProject[], error };

  const list = (projects ?? []) as DbProject[];
  if (list.length === 0) return { data: [], error: null as any };

  // 2) tech を一括取得（kind = 'project'、ref ∈ ids）
  const projIds = list.map((p) => p.id);
  const { data: techRows, error: techErr } = await supabase
    .from("tech")
    .select("ref, key")
    .eq("kind", "project")
    .in("ref", projIds);

  if (techErr) {
    // tech が落ちても最低限プロジェクトは返す
    console.error("[getProjectsByProfileId] tech error:", techErr);
    return { data: list.map((p) => ({ ...p, techKeys: [] })), error: null as any };
  }

  // 3) ref → key[] にまとめて付与
  const techKeysByRef = toKeyMap((techRows ?? []) as Array<{ ref: string; key: string }>);
  const withTech = list.map((p) => ({
    ...p,
    techKeys: techKeysByRef[p.id] ?? [],
  }));

  return { data: withTech, error: null as any };
}

/** 単一プロジェクト（slug 指定）＋ tech keys を取得 */
export async function getProjectBySlug(slug: string): Promise<{
  data: DbProject | null;
  error?: string;
}> {
  // 1) project 本体
  const { data: proj, error: projErr } = await supabase
    .from("project")
    .select(
      "id, profile_id, title, summary, thumbnail_url, content, event_slug, created_at, updated_at",
    )
    .eq("slug", slug)
    .single();

  if (projErr || !proj) {
    return { data: null, error: projErr?.message ?? "project not found" };
  }

  // 2) tech keys
  const { data: techRows, error: techErr } = await supabase
    .from("tech")
    .select("key")
    .eq("kind", "project")
    .eq("ref", proj.id);

  const techKeys = Array.from(new Set((techRows ?? []).map((r: any) => r.key)));
  if (techErr) console.error("[getProjectBySlug] tech error:", techErr);

  return { data: { ...(proj as DbProject), techKeys }, error: undefined };
}

/** 命名互換エイリアス */
export async function getExperienceBySlug(slug: string) {
  return getProjectBySlug(slug);
}
