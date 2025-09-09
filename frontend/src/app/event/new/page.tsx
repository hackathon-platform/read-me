"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createEvent } from "@/lib/api/event";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Hash,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const DEFAULT_TEMPLATE = `# 提出テンプレート / Submission Template\n\n## タイトル\n## 概要\n## デモURL / スライド / リポジトリ\n`;

const sanitizeSlug = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, "");
const isSlugValid = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export default function NewEventMinimal() {
  const router = useRouter();
  const { user } = useSupabaseAuth();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("イベントの説明（任意）");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [iconPreview, setIconPreview] = useState<string>("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);

  const [slugChecking, setSlugChecking] = useState(false);
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug && name) setSlug(sanitizeSlug(name));
  }, [name]);

  async function checkSlugAvailability(value: string) {
    if (!value) return setSlugTaken(null);
    setSlugChecking(true);
    const { data } = await supabase
      .from("event")
      .select("id")
      .eq("slug", value)
      .maybeSingle();
    setSlugTaken(Boolean(data));
    setSlugChecking(false);
  }

  async function publish() {
    if (!user) return toast.error("ログインが必要です");
    if (!name || !slug || !isSlugValid(slug) || slugTaken)
      return toast.error("名前とスラッグを正しく入力してください");

    setSaving(true);
    try {
      const created = await createEvent({
        name,
        slug,
        description,
        banner_url: bannerPreview || null,
        icon_url: iconPreview || null,
        created_by: user.id,
      });
      toast.success("イベントを作成しました");
      router.push(`/events/${created.slug}`);
    } catch (e) {
      toast.error("イベント作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        新しいイベント（Devpost-Lite）
      </h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              イベント名（必須）
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: GeeseHacks Tokyo 2025"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              スラッグ（必須）
            </div>
            <Input
              value={slug}
              onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
              onBlur={() => checkSlugAvailability(slug)}
              placeholder="geesehacks-tokyo"
            />
            <div className="text-xs mt-1">
              {slug ? (
                <span className="text-muted-foreground">
                  URL: yoursite.com/events/{slug}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  例: yoursite.com/events/geesehacks-tokyo
                </span>
              )}
              {slugChecking && (
                <span className="ml-2 text-amber-600 inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  確認中
                </span>
              )}
              {slugTaken === true && (
                <span className="ml-2 text-destructive inline-flex items-center gap-1">
                  使用済み
                </span>
              )}
              {slugTaken === false && isSlugValid(slug) && (
                <span className="ml-2 text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  使用可
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">
              説明（任意）
            </div>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">
              提出テンプレート（参加者がコピペ）
            </div>
            <Textarea
              rows={8}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={publish}
              disabled={
                saving || !name || !slug || !!slugTaken || !isSlugValid(slug)
              }
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  作成中
                </>
              ) : (
                "公開する"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
