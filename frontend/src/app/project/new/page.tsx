"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ThumbnailPicker from "@/components/media/ThumbnailPicker";
import MarkdownReadmeEditor from "@/components/markdown/MarkdownReadmeEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ChecklistBadge from "@/components/common/ChecklistBadge";
import { ProjectPreview } from "@/components/project/ProjectPreview";
import { supabase } from "@/lib/supabase/supabaseClient";
import {
  addProjectMembers,
  createProjectWithOwner,
  deleteProjectCascade,
  SUMMARY_LIMIT,
} from "@/lib/supabase/insert/project";
import {
  MemberPicker,
  type ProfileMini,
} from "@/components/project/MemberPicker";
import TwoLineTitle from "@/components/project/TwoLineTitle";

const PROJECT_BUCKET = "project";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [members, setMembers] = useState<ProfileMini[]>([]);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const authId = userData?.user?.id;
      if (!authId) return;
      const { data: prof } = await supabase
        .from("profile")
        .select("id")
        .eq("auth_id", authId)
        .single();
      if (prof?.id) setMyProfileId(prof.id);
    })();
  }, []);

  const summaryLen = summary.length;
  const summaryTooLong = summaryLen > SUMMARY_LIMIT;
  const canSave =
    !isSaving && !!title.trim() && !!summary.trim() && !summaryTooLong;

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
      setIsSaving(true);
      setError("");

      // 1) project + owner
      const { data, error } = await createProjectWithOwner(supabase, {
        title,
        summary,
        eventSlug,
        thumbnailUrl,
        content: markdown || null,
      });

      if (error || !data) {
        setError(error ?? "保存に失敗しました。");
        toast.error(error ?? "保存に失敗しました。");
        return;
      }

      const createdProjectId = data.id;

      // 2) 選択メンバー追加（失敗したらロールバック＝project 削除）
      const memberIds = members
        .map((m) => m.id)
        .filter((id) => id && id !== myProfileId);

      if (memberIds.length > 0) {
        const { error: addErr } = await addProjectMembers(
          supabase,
          createdProjectId,
          memberIds,
          "contributor",
        );

        if (addErr) {
          // ★ ロールバック実行
          await deleteProjectCascade(supabase, createdProjectId);

          const msg =
            "メンバー追加に失敗したため、作成したプロジェクトを取り消しました。";
          console.warn("[CreateProjectPage] addProjectMembers failed:", addErr);
          setError(msg);
          toast.error(msg);
          return;
        }
      }

      toast.success("プロジェクトを保存しました。");
      router.push(`/project/${data.slug}`);
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました。");
      toast.error("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  const items = [
    { key: "title", label: "プロジェクト名", ok: Boolean(title.trim()) },
    { key: "summary", label: "概要", ok: Boolean(summary.trim()) },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロジェクト", href: "/project" },
          { label: "新規作成", current: true },
        ]}
      />

      {/* Sticky Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="space-y-2 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <ChecklistBadge items={items} />
            </div>

            {/* Preview */}
            <Drawer open={previewOpen} onOpenChange={setPreviewOpen}>
              <DrawerTrigger asChild>
                <Button className="h-8 shrink-0" variant="default">
                  プレビュー
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="mx-auto w-full max-w-5xl">
                  <DrawerTitle>プレビュー</DrawerTitle>
                </DrawerHeader>

                <div className="overflow-auto px-4 pb-2">
                  <ProjectPreview
                    data={{
                      title,
                      summary,
                      thumbnail_url: thumbnailUrl,
                      content: markdown,
                      updated_at: new Date().toISOString(),
                    }}
                  />
                </div>

                <DrawerFooter className="mx-auto w-full max-w-5xl">
                  {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <DrawerClose asChild>
                      <Button variant="outline">戻る</Button>
                    </DrawerClose>
                    <Button onClick={saveProject} disabled={!canSave}>
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

          {/* row2: sticky error (optional) */}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-1 w-full max-w-4xl animate-in fade-in px-3 lg:mt-2">
        {/* Title & Thumbnail */}
        <div className="grid items-start gap-3 md:grid-cols-2">
          <div className="mx-2 min-w-0">
            <TwoLineTitle value={title} onChange={setTitle} />
          </div>
          <ThumbnailPicker
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            bucketName={PROJECT_BUCKET}
            mediaType="image"
            hintText="推奨 16:9 / 5MB 以下"
            className="aspect-[16/9] w-full"
          />
        </div>

        {/* Summary */}
        <div className="mt-4">
          <label className="text-sm font-medium">
            概要（必須・{SUMMARY_LIMIT}字以内）
          </label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            maxLength={SUMMARY_LIMIT}
            placeholder={`プロジェクトの概要を簡潔に記載してください（最大 ${SUMMARY_LIMIT} 文字）`}
          />
          <div
            className={cn(
              "text-right text-xs",
              summaryTooLong ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {summaryLen}/{SUMMARY_LIMIT} 文字
          </div>
        </div>

        {/* Member picker (コンパクト) — 概要の直下に配置 */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            メンバー（ユーザー名で検索・任意）
          </label>
          <MemberPicker
            excludeIds={myProfileId ? [myProfileId] : []}
            selected={members}
            onAdd={(p) =>
              setMembers((prev) =>
                prev.some((m) => m.id === p.id) ? prev : [...prev, p],
              )
            }
            onRemove={(id) =>
              setMembers((prev) => prev.filter((m) => m.id !== id))
            }
          />
        </div>

        {/* Editor */}
        <div className="mt-6">
          <MarkdownReadmeEditor
            showThumbnail={false}
            onContentChange={setMarkdown}
          />
        </div>
      </div>
    </>
  );
}
