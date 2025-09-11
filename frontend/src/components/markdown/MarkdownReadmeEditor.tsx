"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Eye, FileDown } from "lucide-react";

import EditorToolbar from "./EditorToolbar";
import TextareaEditor from "./TextareaEditor";
import MarkdownPreview from "./MarkdownPreview";
import MediaUploader from "@/components/media/MediaUploader";
import ThumbnailPicker from "@/components/media/ThumbnailPicker";

import { type Item } from "@/lib/markdown-items";
import {
  LS_KEY,
  normalizeForMarkdown,
  handleListOnEnter,
  applyTextActionOrInsert,
  insertWithCursorMarker,
} from "@/lib/md-utils";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
type EditorProps = {
  /** Show the top thumbnail picker here. If you want to manage it at the page, pass false. */
  showThumbnail?: boolean;
  /** Called whenever normalized markdown changes (useful for saving at page level). */
  onContentChange?: (markdown: string) => void;
  /** Bucket name used for inline media (images/videos) uploaded from the editor toolbar. */
  mediaBucketName?: string;
};

function downloadFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DEFAULT_MD = [
  "## タイトル",
  "",
  "テキストを入力",
  "",
  "- 箇条書き",
  "1. 番号付き",
  "",
  "`インライン コード`",
  "",
].join("\n");

export default function MarkdownReadmeEditor({
  showThumbnail = true,
  onContentChange,
  mediaBucketName = "project",
}: EditorProps) {
  const [content, setContent] = useState<string>(DEFAULT_MD);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // avoid hydration mismatch for preview
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved content once on mount
  useEffect(() => {
    setMounted(true);
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (saved != null) setContent(saved);
  }, []);

  // Autosave
  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(LS_KEY, content), 300);
    return () => clearTimeout(id);
  }, [content]);

  const normalized = useMemo(() => normalizeForMarkdown(content), [content]);

  // Bubble normalized content up to the page (if requested)
  useEffect(() => {
    onContentChange?.(normalized);
  }, [normalized, onContentChange]);

  /* ---------------- Thumbnail (cover) shown above the editor (optional) -------- */
  const [cover, setCover] = useState<string | null>(null);

  /* ---------------- Editor media upload (images/videos) ------------------------ */
  async function uploadFile(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    // Supabase example. Ensure your bucket (mediaBucketName) policy allows uploads for the current user.
    onProgress?.(10);
    const ext = file.name.split(".").pop() || "bin";
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(mediaBucketName)
      .upload(key, file, {
        upsert: false,
      });
    if (error) throw error;

    const pub = supabase.storage
      .from(mediaBucketName)
      .getPublicUrl(data.path);
    if (!pub.data) throw new Error("Failed to retrieve public URL");

    onProgress?.(100);
    return pub.data.publicUrl;
  }

  const [mediaOpen, setMediaOpen] = useState<false | "image" | "video">(false);

  const onToolbarAction = (item: Item) => {
    const ta = taRef.current;
    if (!ta) return;

    // Open media dialogs for 画像/動画
    if (item.value === "img") {
      setMediaOpen("image");
      return;
    }
    if (item.value === "video") {
      setMediaOpen("video");
      return;
    }

    // Other actions
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (item.group === "テキスト") {
      const { next, caretStart, caretEnd } = applyTextActionOrInsert(
        item,
        content,
        start,
        end,
      );
      setContent(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caretStart, caretEnd);
      });
      return;
    }

    const { next, caretStart } = insertWithCursorMarker(
      content,
      item.md,
      start,
      end,
    );
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caretStart, caretStart);
    });
  };

  function insertAtCaret(md: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + md + content.slice(end);
    const caret = start + md.length;
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  }

  function handleInsertMedia(url: string) {
    if (mediaOpen === "image") {
      // No alt text required
      insertAtCaret(`![](${url})\n\n`);
    } else if (mediaOpen === "video") {
      insertAtCaret(`<video controls src="${url}"></video>\n\n`);
    }
  }

  // Drag & paste upload support
  async function handleFiles(files: File[]) {
    for (const f of files) {
      try {
        const url = await uploadFile(f);
        if (f.type.startsWith("image/")) {
          insertAtCaret(`![](${url})\n\n`);
        } else if (f.type.startsWith("video/")) {
          insertAtCaret(`<video controls src="${url}"></video>\n\n`);
        }
      } catch (err) {
        console.error("upload failed", err);
      }
    }
  }

  const handleDownload = () => downloadFile("README.md", normalized);

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="hidden md:flex items-center rounded-md border">
          <ToolbarButton
            className="rounded-l-md"
            active={mode === "edit"}
            onClick={() => setMode("edit")}
          >
            編集
          </ToolbarButton>
          <ToolbarButton
            active={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            プレビュー
          </ToolbarButton>
          <ToolbarButton
            className="rounded-r-md"
            active={mode === "split"}
            onClick={() => setMode("split")}
          >
            分割
          </ToolbarButton>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <FileDown className="mr-2 h-4 w-4" />
          Export README.md
        </Button>
      </div>

      {/* Optional page-level thumbnail picker (use showThumbnail={false} to hide) */}
      {showThumbnail && (
        <div className="mb-3">
          <ThumbnailPicker
            value={cover}
            onChange={setCover}
            bucketName={mediaBucketName}
            mediaType="image"
          />
        </div>
      )}

      {/* Editor Card */}
      <Card className="pt-0">
        <CardContent className="p-0">
          <Drawer open={previewOpen} onOpenChange={setPreviewOpen}>
            {/* Toolbar with DrawerTrigger for mobile preview */}
            <EditorToolbar
              onAction={onToolbarAction}
              previewTrigger={
                <DrawerTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    プレビュー
                  </Button>
                </DrawerTrigger>
              }
            />
            <Separator />

            {/* Body */}
            <div
              className={cn(
                "grid gap-0",
                mode === "split" ? "md:grid-cols-2" : "grid-cols-1",
              )}
            >
              {/* Editor: hide on desktop when in preview mode */}
              {mode !== "preview" && (
                <div
                  className={cn(
                    "min-h-[60vh] p-3",
                    mode === "split" ? "md:border-r" : "border-0",
                  )}
                >
                  <TextareaEditor
                    ref={taRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onListEnter={(e) =>
                      handleListOnEnter(e, content, setContent)
                    }
                    onFiles={handleFiles}
                    placeholder="ここにMarkdownを入力…"
                  />
                </div>
              )}

              {/* Desktop preview: shown in split & preview (mount-gated for hydration safety) */}
              {mode !== "edit" && mounted && (
                <div className="hidden md:block">
                  <MarkdownPreview content={normalized} />
                </div>
              )}
            </div>

            {/* Mobile Drawer preview (mount-gated) */}
            <DrawerContent className="p-0">
              <div className="flex h-[85vh] max-h-[85vh] flex-col">
                <DrawerHeader className="shrink-0 text-left">
                  <DrawerTitle>プレビュー</DrawerTitle>
                </DrawerHeader>

                <div className="h-0 w-full grow overflow-y-auto px-3">
                  <div className="max-w-full pb-5">
                    {mounted && <MarkdownPreview content={normalized} />}
                  </div>
                </div>

                <div className="shrink-0 p-3">
                  <DrawerClose asChild>
                    <Button className="w-full">閉じる</Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Media Uploader dialog (画像/動画) — no alt text */}
          <MediaUploader
            open={Boolean(mediaOpen)}
            onOpenChange={(v) => setMediaOpen(v ? mediaOpen : false)}
            mediaType={mediaOpen === "video" ? "video" : "image"}
            uploadFile={uploadFile}
            onConfirm={handleInsertMedia}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI helper                                                     */
/* ------------------------------------------------------------------ */
function ToolbarButton({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-sm",
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
        className,
      )}
      type="button"
    >
      {children}
    </button>
  );
}
