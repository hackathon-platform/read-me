"use client";

import { supabase } from "@/lib/supabase/supabaseClient";

/** 画像をイベント用バケットへアップロードし、公開URLを返す */
export async function uploadEventBanner(
  file: File,
  userId: string,
  slug: string,
  bucketName = "event", // Storage バケット名（デフォルト: event）
): Promise<string> {
  // 一意なファイル名を作成
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `${userId}/${slug || "event"}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: false,
      cacheControl: "0",
      contentType: file.type || "image/png",
    });

  if (uploadError) {
    throw new Error(
      uploadError.message || "バナー画像のアップロードに失敗しました。",
    );
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error("バナー画像URLの取得に失敗しました。");
  }

  // キャッシュバスティング用クエリを付与
  return `${data.publicUrl}?v=${Date.now()}`;
}

export type CreateEventInput = {
  userId: string; // owner となる profile.id
  name: string; // event.name
  slug: string; // event.slug（ユニーク）
  description?: string | null;
  websiteUrl?: string | null;
  /** "YYYY-MM-DDTHH:mm" or ISO or null */
  endAt?: string | null;
  /** 任意：バナー画像ファイル（あれば先にアップロード） */
  bannerFile?: File | null;
  /** Storage のバケット名。省略時は "event" */
  bucketName?: string;
};

/**
 * 画像アップロード（任意）→ event 挿入 → participant(owner) 挿入（ロールバック付き）
 * 成功時: { id, slug } を返す
 */
export async function createEventWithOwner(
  input: CreateEventInput,
): Promise<{ id: string; slug: string }> {
  const {
    userId,
    name,
    slug,
    description = null,
    websiteUrl = null,
    endAt = null,
    bannerFile = null,
    bucketName = "event",
  } = input;

  // 1) バナーがあればアップロード
  let banner_url: string | null = null;
  if (bannerFile) {
    banner_url = await uploadEventBanner(bannerFile, userId, slug, bucketName);
  }

  // 2) event 作成
  const end_at_iso = endAt
    ? // endAt が "YYYY-MM-DDTHH:mm" でも ISO でも OK
      new Date(endAt).toISOString()
    : null;

  const { data: createdEvent, error: insertEventError } = await supabase
    .from("event")
    .insert([
      {
        created_by: userId,
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        banner_url,
        website_url: websiteUrl?.trim() || null,
        end_at: end_at_iso,
      },
    ])
    .select("id, slug")
    .single();

  if (insertEventError || !createdEvent?.id) {
    throw new Error(
      insertEventError?.message || "イベントの作成に失敗しました。",
    );
  }

  // 3) participant(owner) 追加（失敗時は event をロールバック）
  const { error: insertOwnerError } = await supabase
    .from("participant")
    .insert({
      event_id: createdEvent.id,
      profile_id: userId,
      role: "owner",
    });

  if (insertOwnerError) {
    try {
      await supabase.from("event").delete().eq("id", createdEvent.id);
    } catch (rollbackErr) {
      console.warn("[createEventWithOwner] rollback failed:", rollbackErr);
    }
    throw new Error(
      insertOwnerError.message || "オーナーの設定に失敗しました。",
    );
  }

  return { id: createdEvent.id, slug: createdEvent.slug };
}

/** スラッグの重複確認（true: 使用済み） */
export async function isEventSlugTaken(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("event")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data);
}
