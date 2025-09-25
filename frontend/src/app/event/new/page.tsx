"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";
import PageHeader from "@/components/Layout/PageHeader";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { createEventWithOwner } from "@/lib/supabase/insert/event";
import ThumbnailPicker from "@/components/media/ThumbnailPicker";
import ChecklistBadge from "@/components/common/ChecklistBadge";
import EventPreview from "@/components/event/EventPreview";
import MarkdownReadmeEditor from "@/components/markdown/MarkdownReadmeEditor";

const PROJECT_BUCKET = "event"; // Supabase Storage のバケット名
const isSlugValid = (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  const [eventName, setEventName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null); // dataURL（即時プレビュー）
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

  // 公開ロジック（Drawer からもフォーム submit からも使用）
  async function saveEvent() {
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
      const { slug: createdSlug } = await createEventWithOwner({
        name: eventName,
        slug,
        description,
        bannerUrl,
        websiteUrl,
        createdBy: user.id,
        endAt,
      });
      toast.success("イベントを登録しました。");
      router.replace(`/event/${createdSlug}`);
    } catch (err: any) {
      setError(err?.message ?? "保存に失敗しました。");
      setIsSaving(false);
    }
  }

  const items = [
    { key: "eventName", label: "イベント名", ok: Boolean(eventName.trim()) },
    {
      key: "slug",
      label: "URL スラッグ",
      ok: Boolean(slug.trim()) && isSlugValid(slug) && slugTaken === false,
    },
  ];
  const allRequiredOk = items.map((it) => it.ok).every(Boolean);

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
              items={items}
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
                    onClick={saveEvent}
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

      {/* Main Form */}
      <div className="animate-in fade-in duration-500 mt-1 lg:mt-2 px-3 mx-auto max-w-5xl w-full">
        {/* Banner（フォーム側の見出し用プレビュー） */}
        <ThumbnailPicker
          value={bannerUrl}
          onChange={setBannerUrl}
          bucketName={PROJECT_BUCKET}
          mediaType="image"
          hintText="推奨 1170 x 270px / 5MB 以下"
          className="aspect-[13/3] max-h-72 w-full"
        />

        {/* Form */}
        <div className="p-4 space-y-6">
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

          {/* End At */}
          <div className="space-y-2">
            <label className="text-sm font-medium">終了日時</label>
            <Input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
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

          {/* Editor（説明文） */}
          <label className="text-sm font-medium">説明</label>
          <MarkdownReadmeEditor
            showThumbnail={false}
            onContentChange={setDescription}
          />
        </div>
      </div>
    </>
  );
}
