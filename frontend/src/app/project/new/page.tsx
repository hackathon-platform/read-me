"use client";

import { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ThumbnailPicker from "@/components/media/ThumbnailPicker";
import MarkdownReadmeEditor from "@/components/markdown/MarkdownReadmeEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROJECT_BUCKET = "project"; // Supabase Storage のバケット名
const SUMMARY_LIMIT = 100;

export default function CreateProjectPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState(""); // 必須（100字以内）
  const [eventSlug, setEventSlug] = useState(""); // 任意（event.slug 参照）
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>(""); // content に保存
  const [saving, setSaving] = useState(false);

  const summaryLen = summary.length;
  const summaryTooLong = summaryLen > SUMMARY_LIMIT;
  const canSave =
    !saving && !!title.trim() && !!summary.trim() && !summaryTooLong;

  async function saveProject() {
    if (!title.trim()) {
      toast.error("タイトルを入力してください。");
      return;
    }
    if (!summary.trim()) {
      toast.error("概要（summary）を入力してください。");
      return;
    }
    if (summaryTooLong) {
      toast.error(`概要は${SUMMARY_LIMIT}字以内にしてください。`);
      return;
    }

    try {
      setSaving(true);

      // 認証ユーザーの取得（profile_id 用）
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = userData?.user;
      if (!user?.id) {
        toast.error("ログインが必要です。");
        setSaving(false);
        return;
      }

      const payload = {
        profile_id: user.id,
        title: title.trim(),
        summary: summary.trim(), // 100字以内
        thumbnail_url: thumbUrl ?? null,
        content: markdown || null, // 空なら null
        event_slug: eventSlug.trim() || null,
      };

      const { error } = await supabase
        .from("project")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      toast.success("プロジェクトを保存しました。");
      // 例: 保存後に詳細ページへ遷移したい場合
      // router.push(`/project/${data.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロジェクト", href: "/project" },
          { label: "新規作成", current: true },
        ]}
      />

      <div className="mx-auto max-w-5xl p-4">
        {/* サムネイル + タイトル（2カラム。狭い幅では1カラム） */}
        <div className="grid px-4 items-start gap-3 md:grid-cols-2">
          {/* Thumbnail */}
          <div className="w-full">
            <ThumbnailPicker
              value={thumbUrl}
              onChange={setThumbUrl}
              bucketName={PROJECT_BUCKET}
              mediaType="image"
              hintText="推奨 16:9 / 5MB 以下"
            />
          </div>

          {/* Title (最大2行で自動折返し) + Event Slug */}
          <div className="min-w-0 mx-2">
            <TwoLineTitle value={title} onChange={setTitle} />
            <div className="space-y-1">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:ring"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                placeholder="イベントスラッグ（任意）"
              />
            </div>
          </div>
        </div>

        {/* Summary（必須・100字以内） */}
        <div className="px-4 mt-4 space-y-1">
          <label className="text-sm font-medium">
            概要（必須・{SUMMARY_LIMIT}字以内）
          </label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            maxLength={SUMMARY_LIMIT} // 入力段階でブロック
            placeholder={`プロジェクトの概要を簡潔に記載してください（最大 ${SUMMARY_LIMIT} 文字）`}
          />
          <div
            className={cn(
              "text-xs text-right",
              summaryTooLong ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {summaryLen}/{SUMMARY_LIMIT} 文字
          </div>
        </div>

        {/* Editor（本文） */}
        <MarkdownReadmeEditor
          showThumbnail={false}
          onContentChange={setMarkdown}
        />

        {/* Save */}
        <div className="pt-2">
          <Button onClick={saveProject} disabled={!canSave}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>
    </>
  );
}

/** 最大2行で自動折返しするタイトル入力。改行キーは無効化（自然な折返しのみ） */
function TwoLineTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 一度リセットしてから scrollHeight を採用
    el.style.height = "auto";
    const cs = window.getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || 28; // フォールバック
    const pad =
      parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");
    const maxH = lh * 2 + pad; // 2行まで
    el.style.height = Math.min(el.scrollHeight, maxH) + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="w-full resize-none border-none bg-transparent text-2xl font-bold leading-snug outline-none focus-visible:ring-0 placeholder:text-muted-foreground"
      style={{ maxHeight: "calc(2 * 1.375em)" }} // leading-snug ≒ 1.375
      placeholder="プロジェクトタイトル"
      aria-label="プロジェクトタイトル"
    />
  );
}
