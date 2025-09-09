"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Loader2,
} from "lucide-react";

const isSlugValid = (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  const [eventName, setEventName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [bannerUrl, setBannerUrl] = useState(""); // 即時プレビュー（確定）
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0); // Inputの値リセット用

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [endAt, setEndAt] = useState(""); // "YYYY-MM-DDTHH:mm"
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [slugChecking, setSlugChecking] = useState(false);
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);

  // Auth gate
  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
  }, [isLoading, user, router]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || !isSlugValid(slug)) {
      setSlugTaken(null);
      return;
    }
    const id = setTimeout(async () => {
      try {
        setSlugChecking(true);
        const { data: row } = await supabase
          .from("event")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        setSlugTaken(Boolean(row));
      } catch {
        setSlugTaken(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [slug]);

  if (isLoading) {
    return <div className="text-center py-20">読み込み中…</div>;
  }

  async function uploadImageToSupabase(file: File, userId: string) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    // organize by user and slug so multiple events don’t clash
    const filePath = `${userId}/${slug || "event"}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("event")
      .upload(filePath, file, {
        upsert: false, // unique filename, no need to upsert
        cacheControl: "0", // be explicit (helps downstream caches)
      });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from("event").getPublicUrl(filePath);
    // add a version param for extra safety
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        e.target?.result
          ? resolve(e.target.result as string)
          : reject(new Error("failed to read"));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 画像選択 → 即時プレビュー＆保存対象にセット
  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size / 1024 / 1024 > 1) {
      toast.error("画像は1MB以下にしてください。");
      // 入力をリセット（同じファイルも再選択可能に）
      setFileKey((k) => k + 1);
      return;
    }
    const dataUrl = await readAsDataURL(file);
    setBannerUrl(dataUrl); // 即時反映
    setSelectedFile(file); // 保存時にアップロード
  }

  // キャンセル → バナー設定をリセット（プレビューとファイル選択を元に戻す＝空に）
  function cancelBanner() {
    setBannerUrl("");
    setSelectedFile(null);
    setFileKey((k) => k + 1); // Inputを再マウントして値クリア
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!eventName.trim() || !slug.trim()) {
      setError("すべての必須項目を入力してください。");
      return;
    }
    if (!isSlugValid(slug)) {
      setError("スラッグは半角英数字とハイフンのみ使用できます。");
      return;
    }
    if (slugTaken) {
      setError("このスラッグは既に使用されています。");
      return;
    }
    if (!user?.id) {
      setError("認証エラー。再度ログインしてください。");
      return;
    }

    setIsSaving(true);
    try {
      // 1) 画像のアップロード（任意）
      let uploadedImageUrl: string | null = null;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToSupabase(
          selectedFile,
          user.id,
          slug.trim(),
        );
      }

      // 2) イベント作成（insertでIDを取得）
      const { data: createdEvent, error: insertEventError } = await supabase
        .from("event")
        .insert([
          {
            created_by: user.id,
            name: eventName.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            banner_url: uploadedImageUrl ?? null,
            website_url: websiteUrl.trim() || null,
            end_at: endAt ? new Date(endAt).toISOString() : null,
          },
        ])
        .select("id, slug")
        .single();

      if (insertEventError || !createdEvent?.id) {
        throw new Error(
          insertEventError?.message || "イベントの作成に失敗しました。",
        );
      }

      // 3) 参加者（owner）として作成者を登録
      const { error: insertOwnerError } = await supabase
        .from("participant")
        .insert({
          event_id: createdEvent.id,
          profile_id: user.id,
          role: "owner",
        });

      if (insertOwnerError) {
        // 失敗時はイベントをロールバック（可能なら）
        try {
          await supabase.from("event").delete().eq("id", createdEvent.id);
        } catch (rollbackErr) {
          console.warn("[CreateEventPage] rollback failed:", rollbackErr);
        }
        throw new Error(
          "参加者（オーナー）の設定に失敗しました。もう一度お試しください。",
        );
      }

      toast.success("イベントを登録しました。");
      router.replace(`/event/${createdEvent.slug}`);
    } catch (err: any) {
      setError(err?.message ?? "保存に失敗しました。");
      setIsSaving(false);
    }
  }

  const required = {
    eventName: Boolean(eventName.trim()),
    slug: Boolean(slug.trim()) && isSlugValid(slug) && slugTaken === false,
  };
  const allRequiredOk = Object.values(required).every(Boolean);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "イベント運営", href: "/org" },
          { label: "新規作成", current: true },
        ]}
      />

      {/* Sticky Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="mx-4 h-12 flex items-center justify-between text-sm">
          <ChecklistBadge
            required={required}
            slugState={{ slugChecking, slugTaken, value: slug }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredOk || isSaving}
            className="h-8"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                公開中…
              </span>
            ) : (
              "公開する"
            )}
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="animate-in fade-in duration-500 w-full">
        <div className="relative h-48 bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 to-cyan-400 overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/90 pointer-events-none">
              <div className="text-center">
                <ImageIcon className="w-7 h-7 mx-auto mb-1" />
                <p className="text-xs">バナー画像 – クリックでアップロード</p>
              </div>
            </div>
          )}

          {/* どこでもクリックで選択できるラベル（背面） */}
          <label
            htmlFor="banner-upload"
            className="absolute inset-0 cursor-pointer z-0"
            aria-label="バナー画像を選択"
          />

          {/* hidden file input（値リセット用にkeyを使用） */}
          <Input
            key={fileKey}
            id="banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />

          {/* キャンセルボタン（選択済みの時のみ表示、ラベルより前面） */}
          {bannerUrl && (
            <div className="absolute bottom-2 right-2 z-10">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // ラベルクリックへの伝搬を防止
                  cancelBanner();
                }}
              >
                キャンセル
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4 space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">
            {error}
          </div>
        )}

        {/* Event Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            イベント名 <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例）Hack the Japan 2025"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            URL スラッグ <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="hack-the-japan-2025"
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              {slugChecking ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : slug && isSlugValid(slug) ? (
                slugTaken === false ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : slugTaken === true ? (
                  <XCircle className="w-4 h-4 text-destructive" />
                ) : null
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            半角英数字とハイフンのみ。URL は{" "}
            <code>/event/{slug || "your-slug"}</code> になります。
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">説明</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="イベントの概要、対象、スケジュールなど…"
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="text-sm font-medium">公式サイト URL</label>
          <Input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        {/* End At */}
        <div className="space-y-2">
          <label className="text-sm font-medium">終了日時</label>
          <Input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
      </form>
    </>
  );
}

function ChecklistBadge({
  required,
  slugState,
}: {
  required: { eventName: boolean; slug: boolean };
  slugState: {
    slugChecking: boolean;
    slugTaken: boolean | null;
    value: string;
  };
}) {
  const items = [
    { key: "eventName", label: "イベント名", ok: required.eventName },
    { key: "slug", label: "URL スラッグ", ok: required.slug },
  ];
  return (
    <div className="hidden sm:flex items-center gap-2 text-xs">
      {items.map((it) => (
        <Badge
          variant="outline"
          key={it.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
            it.ok
              ? "text-emerald-700 border-emerald-300"
              : "text-amber-700 border-amber-300"
          }`}
        >
          {it.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          {it.label}
        </Badge>
      ))}
      {slugState.value && slugState.slugTaken === true && (
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-destructive border-destructive/40">
          <XCircle className="w-3.5 h-3.5" /> スラッグ重複
        </span>
      )}
    </div>
  );
}
