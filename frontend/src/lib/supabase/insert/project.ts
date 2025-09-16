import type { SupabaseClient } from "@supabase/supabase-js";

export const SUMMARY_LIMIT = 100;

export type CreateProjectInput = {
  title: string;
  summary: string; // <= SUMMARY_LIMIT chars
  eventSlug?: string | null; // nullable, pass '' as null
  thumbnailUrl?: string | null; // nullable
  content?: string | null; // nullable
};

export type CreateProjectResult = {
  id: string;
  slug: string; // returned as string for easy URL routing
};

type Result<T> = { data: T | null; error?: string };

/** 現在ログイン中ユーザーの profile.id を取得 */
async function getCurrentProfileId(
  sb: SupabaseClient,
): Promise<Result<string>> {
  const { data: userData, error: authErr } = await sb.auth.getUser();
  if (authErr) return { data: null, error: authErr.message };

  const userId = userData?.user?.id;
  if (!userId) return { data: null, error: "ログインが必要です。" };

  const { data: prof, error: profErr } = await sb
    .from("profile")
    .select("id")
    .eq("auth_id", userId)
    .single();

  if (profErr || !prof?.id) {
    return {
      data: null,
      error: "プロフィールが見つかりません。初期登録を完了してください。",
    };
  }
  return { data: prof.id };
}

/**
 * プロジェクトと project_owner(=project_member の owner) を作成。
 * - オーナー登録に失敗したら作成した project を削除してロールバックします。
 * - 後続の「メンバー追加」失敗は呼び出し側でロールバックしてください。
 */
export async function createProjectWithOwner(
  sb: SupabaseClient,
  input: CreateProjectInput,
): Promise<Result<CreateProjectResult>> {
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";
  const eventSlug = input.eventSlug?.trim() || null;

  // 1) profile_id 解決
  const { data: profileId, error: profileErr } = await getCurrentProfileId(sb);
  if (profileErr || !profileId) return { data: null, error: profileErr };

  // 2) project 作成
  const insertPayload = {
    profile_id: profileId,
    title,
    summary,
    thumbnail_url: input.thumbnailUrl ?? null,
    content: input.content ?? null,
    event_slug: eventSlug,
  };

  const { data: created, error: insertErr } = await sb
    .from("project")
    .insert(insertPayload)
    .select("id, slug")
    .single();

  if (insertErr || !created?.id || created.slug === undefined) {
    return {
      data: null,
      error: insertErr?.message ?? "プロジェクトの保存に失敗しました。",
    };
  }

  // 3) owner を project_member に登録（失敗したらロールバック = project を削除）
  const { error: memberError } = await sb.from("project_member").insert({
    project_id: created.id,
    profile_id: profileId,
    role: "owner",
  });

  console.log("memberError", memberError);

  if (memberError) {
    // 失敗したので作った project を削除（副作用の後始末）
    await deleteProjectCascade(sb, created.id);
    return { data: null, error: "オーナー登録に失敗しました。" };
  }

  return {
    data: {
      id: created.id,
      slug: String(created.slug),
    },
  };
}

/**
 * プロジェクト配下の関連レコードを削除してから project を削除。
 * FK に ON DELETE CASCADE を付けているなら project の DELETE のみでOK。
 */
export async function deleteProjectCascade(
  sb: SupabaseClient,
  projectId: string,
): Promise<Result<null>> {
  // 1) 子テーブル（CASCADE が無い前提）の後片付け
  await sb.from("project_member").delete().eq("project_id", projectId);
  await sb.from("project_skill").delete().eq("project_id", projectId);
  // 他にぶら下がりがあればここで削除（例: deliverables 等）

  // 2) 親テーブル
  const { error: projErr } = await sb
    .from("project")
    .delete()
    .eq("id", projectId);
  if (projErr) return { data: null, error: projErr.message };

  return { data: null };
}

/**
 * 後から複数メンバーを追加するユーティリティ。
 * 同一 (project_id, profile_id) は upsert で重複を防ぐ。
 */
export async function addProjectMembers(
  sb: SupabaseClient,
  projectId: string,
  profileIds: string[],
  role: "maintainer" | "contributor" | "viewer" = "contributor",
): Promise<Result<null>> {
  if (!projectId) return { data: null, error: "projectId が必要です。" };
  if (!profileIds.length)
    return { data: null, error: "追加するユーザーがありません。" };

  const rows = profileIds.map((pid) => ({
    project_id: projectId,
    profile_id: pid,
    role,
  }));

  const { error } = await sb
    .from("project_member")
    .upsert(rows, { onConflict: "project_id,profile_id" });

  if (error) return { data: null, error: error.message };
  return { data: null };
}
