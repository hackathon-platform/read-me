"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Separator } from "@/components/ui/separator";
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

  /* ---------------- Inline media upload (no dialog / no URL) ------------------- */
  const inputImgRef = useRef<HTMLInputElement>(null);
  const inputVidRef = useRef<HTMLInputElement>(null);
  const [uploding, setUploading] = useState(false);
  const [uplProg, setUplProg] = useState(0);
  const [uplErr, setUplErr] = useState<string | null>(null);

  async function uploadFile(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    onProgress?.(10);
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const key = `editor-assets/${new Date().toISOString().slice(0, 10)}/${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2)
    }.${ext}`;

    const { data, error } = await supabase.storage
      .from(mediaBucketName)
      .upload(key, file, {
        upsert: false,
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
      });
    if (error) throw error;
    onProgress?.(95);

    const { data: pub, error: pubErr } = supabase.storage
      .from(mediaBucketName)
      .getPublicUrl(data.path);
    if (pubErr) throw pubErr as any;

    onProgress?.(100);
    return pub.publicUrl;
  }

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

  // Toolbar actions
  const onToolbarAction = (item: Item) => {
    const ta = taRef.current;
    if (!ta) return;

    if (item.value === "img") {
      // 直接ファイル選択（ダイアログなし）
      inputImgRef.current?.click();
      return;
    }
    if (item.value === "video") {
      inputVidRef.current?.click();
      return;
    }

    // テキスト系
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

  // Drag & paste upload support
  async function handleFiles(files: File[]) {
    for (const f of files) {
      try {
        setUplErr(null);
        setUploading(true);
        setUplProg(10);
        const url = await uploadFile(f, (p) =>
          setUplProg(Math.max(5, Math.min(99, p))),
        );
        setUplProg(100);
        if (f.type.startsWith("image/")) {
          insertAtCaret(`![](${url})\n\n`);
        } else if (f.type.startsWith("video/")) {
          insertAtCaret(`<video controls src="${url}"></video>\n\n`);
        }
      } catch (err: any) {
        console.error("upload failed", err);
        setUplErr(err?.message || "アップロードに失敗しました。");
      } finally {
        setUploading(false);
      }
    }
  }

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = ""; // allow the same file to be picked again
    if (f) void handleFiles([f]);
  };
  const handlePickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (f) void handleFiles([f]);
  };

  const handleDownload = () => downloadFile("README.md", normalized);

  return (
    <>
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

      {/* Optional page-level thumbnail picker */}
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

            {/* Hidden pickers for direct choose */}
            <input
              ref={inputImgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
            <input
              ref={inputVidRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handlePickVideo}
            />

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
                    "relative min-h-[60vh] p-3",
                    mode === "split" ? "md:border-r" : "border-0",
                  )}
                >
                  {/* upload overlay (progress / error) */}
                  {(uploding || uplErr) && (
                    <div className="absolute inset-x-3 bottom-3 z-10 rounded-md border bg-background/90 p-2 backdrop-blur">
                      {uploding && (
                        <Progress value={uplProg} className="h-1.5" />
                      )}
                      {uplErr && (
                        <div className="mt-2 text-xs text-destructive">
                          {uplErr}
                        </div>
                      )}
                    </div>
                  )}

                  <TextareaEditor
                    ref={taRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onListEnter={(e) =>
                      handleListOnEnter(e, content, setContent)
                    }
                    onFiles={handleFiles}
                    placeholder="ここにMarkdownを入力…（画像/動画はドラッグ＆ドロップやペースト、またはツールバーから直接選択できます）"
                  />
                </div>
              )}

              {/* Desktop preview */}
              {mode !== "edit" && mounted && (
                <div className="hidden md:block">
                  <MarkdownPreview content={normalized} />
                </div>
              )}
            </div>

            {/* Mobile Drawer preview */}
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
        </CardContent>
      </Card>
    </>
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
