"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const isSlugValid = (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  const [eventName, setEventName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [bannerUrl, setBannerUrl] = useState(""); // dataURL（即時プレビュー）
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0); // <input type=file> のリセット用

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [endAt, setEndAt] = useState(""); // "YYYY-MM-DDTHH:mm"
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [slugChecking, setSlugChecking] = useState(false);
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);

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
    const filePath = `${userId}/${slug || "event"}/${filename}`;
    const { error: uploadError } = await supabase.storage
      .from("event")
      .upload(filePath, file, { upsert: false, cacheControl: "0" });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from("event").getPublicUrl(filePath);
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
      setFileKey((k) => k + 1);
      return;
    }
    const dataUrl = await readAsDataURL(file);
    setBannerUrl(dataUrl); // 即時反映
    setSelectedFile(file); // 保存時にアップロード
  }

  // キャンセル → バナー設定をリセット
  function cancelBanner() {
    setBannerUrl("");
    setSelectedFile(null);
    setFileKey((k) => k + 1);
  }

  // 公開ロジック（Drawer からもフォーム submit からも使用）
  async function publish() {
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
      // 1) 画像アップロード（任意）
      let uploadedImageUrl: string | null = null;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToSupabase(selectedFile, user.id);
      }

      // 2) イベント作成（id 取得）
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

      // 3) オーナー参加者の作成
      const { error: insertOwnerError } = await supabase
        .from("participant")
        .insert({
          event_id: createdEvent.id,
          profile_id: user.id,
          role: "owner",
        });

      if (insertOwnerError) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 旧 submit は使わず、Drawer 内の「公開する」で publish() 実行
    setPreviewOpen(true);
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
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="px-4 py-2 flex items-center gap-2 text-sm">
          <div className="flex-1 min-w-0">
            <ChecklistBadge
              required={required}
              slugState={{ slugChecking, slugTaken, value: slug }}
            />
          </div>

          {/* プレビューを開く */}
          <Drawer open={previewOpen} onOpenChange={setPreviewOpen}>
            <DrawerTrigger asChild>
              <Button className="h-8 shrink-0" variant="default">
                プレビュー
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="max-w-5xl mx-auto w-full">
                <DrawerTitle>プレビュー</DrawerTitle>
              </DrawerHeader>

              <div className="overflow-auto px-4 pb-2">
                <div className="max-w-5xl mx-auto w-full">
                  <EventPreview
                    name={eventName || "イベント名"}
                    slug={slug || "your-slug"}
                    description={description || ""}
                    bannerUrl={bannerUrl || null}
                    websiteUrl={websiteUrl || null}
                    endAt={endAt || null}
                    participantsCount={0}
                  />
                </div>
              </div>

              <DrawerFooter className="max-w-5xl mx-auto w-full">
                {/* エラー表示（プレビュー下部にも出す） */}
                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive p-3 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline">戻る</Button>
                  </DrawerClose>
                  <Button
                    onClick={publish}
                    disabled={isSaving || !allRequiredOk}
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
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Banner（フォーム側の見出し用プレビュー） */}
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

          {/* キャンセルボタン */}
          {bannerUrl && (
            <div className="absolute bottom-2 right-2 z-10">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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

/* ------------------------------ UI helpers ------------------------------ */

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
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-1">
      {items.map((it) => (
        <Badge
          variant="outline"
          key={it.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
            it.ok
              ? "text-emerald-700 border-emerald-300"
              : "text-amber-700 border-amber-300"
          }`}
          title={it.label}
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

function formatJPDateLocal(s?: string | null) {
  if (!s) return null;
  try {
    return new Date(s).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour12: false,
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

/**
 * Drawer 内のプレビュー
 * 本番の EventPage と同等のレイアウトをローカル state から描画
 */
function EventPreview(props: {
  name: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  websiteUrl: string | null;
  endAt: string | null; // datetime-local の文字列 or null
  participantsCount: number;
}) {
  const endAtJP = props.endAt ? formatJPDateLocal(props.endAt) : null;

  return (
    <div className="overflow-hidden border bg-card rounded-md">
      {/* Banner */}
      {props.bannerUrl && (
        <div className="relative h-48">
          <img
            src={props.bannerUrl}
            alt={`${props.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Meta row under banner */}
      <div className="px-4 py-3 border-b">
        <h1 className="text-2xl font-semibold mr-auto">{props.name}</h1>
        <div className="flex flex-wrap gap-2 pt-2">
          {props.websiteUrl && (
            <Badge variant="outline" className="gap-1">
              <Link
                href={props.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                公式サイト
              </Link>
            </Badge>
          )}
          {endAtJP && (
            <Badge variant="secondary" className="gap-1">
              終了日: {endAtJP}
            </Badge>
          )}
          <Badge variant="secondary">参加者 {props.participantsCount} 名</Badge>
        </div>
      </div>

      {/* Body */}
      <div>
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b rounded-none w-full justify-start px-2">
            <TabsTrigger value="about">概要</TabsTrigger>
            <TabsTrigger value="gallery" disabled>
              成果物ギャラリー
            </TabsTrigger>
            <TabsTrigger value="participant" disabled>
              参加者
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="p-4">
            {props.description || props.websiteUrl || endAtJP ? (
              <section className="prose prose-sm dark:prose-invert max-w-none">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">終了日</div>
                    <div className="font-medium">{endAtJP ?? "未設定"}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">公式サイト</div>
                    <div className="font-medium">
                      {props.websiteUrl ? (
                        <Link
                          className="underline underline-offset-4"
                          href={props.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {props.websiteUrl}
                        </Link>
                      ) : (
                        "未設定"
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">参加者</div>
                    <div className="font-medium">
                      {props.participantsCount} 名
                    </div>
                  </div>
                </div>

                {props.description && (
                  <>
                    <h2 className="text-muted-foreground mt-2">概要</h2>
                    <p className="whitespace-pre-wrap">{props.description}</p>
                  </>
                )}
              </section>
            ) : (
              <div className="text-sm text-muted-foreground py-6">
                このイベントの概要情報はまだありません。
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="p-4" />
          <TabsContent value="participant" className="p-4" />
        </Tabs>
      </div>
    </div>
  );
}
