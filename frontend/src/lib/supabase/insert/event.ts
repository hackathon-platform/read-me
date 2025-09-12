"use client";

import { supabase } from "@/lib/supabase/supabaseClient";

export type CreateEventInput = {
  name: string; // event.name
  slug: string; // event.slug（ユニーク）
  description?: string | null;
  /** Supabase Storage のパブリック URL */
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  createdBy: string; // owner となる profile.id
  /** "YYYY-MM-DDTHH:mm" or ISO or null */
  endAt?: string | null;
};

/** イベント作成 + オーナー設定 */
export async function createEventWithOwner(
  input: CreateEventInput,
): Promise<{ id: string; slug: string }> {
  const {
    createdBy,
    name,
    slug,
    description = null,
    bannerUrl = null,
    websiteUrl = null,
    endAt = null,
  } = input;

  // 2) event 作成
  const end_at_iso = endAt
    ? // endAt が "YYYY-MM-DDTHH:mm" でも ISO でも OK
      new Date(endAt).toISOString()
    : null;

  const { data: createdEvent, error: insertEventError } = await supabase
    .from("event")
    .insert([
      {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        banner_url: bannerUrl?.trim() || null,
        website_url: websiteUrl?.trim() || null,
        created_by: createdBy,
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
      profile_id: createdBy,
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
