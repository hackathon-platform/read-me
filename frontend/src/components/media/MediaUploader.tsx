"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/supabaseClient";
import { ImageIcon, VideoIcon, UploadCloud, Link2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  /** "image" | "video" */
  mediaType: "image" | "video";

  /**
   * If provided, the component will upload to this Supabase Storage bucket.
   * If omitted, you must provide `uploadFile`.
   */
  bucketName?: string;

  /**
   * Optional custom upload function (overrides bucketName approach).
   * Should return a public URL.
   */
  uploadFile?: (
    file: File,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;

  /** Called after user confirms (either uploaded or via URL). */
  onConfirm: (url: string) => void;

  /** Optional: hint text (e.g. size limit, recommended aspect, etc.) */
  hintText?: string;
};

export default function MediaUploader({
  open,
  onOpenChange,
  mediaType,
  bucketName,
  uploadFile,
  onConfirm,
  hintText,
}: Props) {
  const accept = mediaType === "image" ? "image/*" : "video/*";

  const [tab, setTab] = React.useState<"upload" | "url">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setUploading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset states when dialog closes
  React.useEffect(() => {
    if (!open) {
      cleanupPreview();
      setFile(null);
      setUrl("");
      setProgress(0);
      setUploading(false);
      setErrMsg(null);
      setDragActive(false);
      setTab("upload");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Preview URL lifecycle
  React.useEffect(() => {
    if (!file) {
      cleanupPreview();
      return;
    }
    const obj = URL.createObjectURL(file);
    setFilePreview(obj);
    return () => URL.revokeObjectURL(obj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  function cleanupPreview() {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  }

  function prettySize(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }

  function pickFile() {
    setErrMsg(null);
    inputRef.current?.click();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    if (!f.type.startsWith(mediaType)) {
      setErrMsg(
        mediaType === "image"
          ? "画像ファイルを選択してください。"
          : "動画ファイルを選択してください。",
      );
      return;
    }
    setFile(f);
  }

  async function uploadViaSupabaseBucket(
    f: File,
    onProg?: (p: number) => void,
  ): Promise<string> {
    if (!bucketName)
      throw new Error(
        "bucketName is required when uploadFile is not provided.",
      );
    onProg?.(5);
    const ext = (f.name.split(".").pop() || "bin").toLowerCase();
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2);
    const path = `project-assets/${new Date()
      .toISOString()
      .slice(0, 10)}/${uuid}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: f.type || "application/octet-stream",
      });

    if (error) throw new Error(error.message || "Upload failed");
    onProg?.(95);

    const { data: pub, error: pubErr } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (pubErr) throw new Error(pubErr.message || "Failed to get public URL");
    onProg?.(100);
    return pub.publicUrl;
  }

  async function doSave() {
    setErrMsg(null);
    try {
      if (tab === "url") {
        const clean = url.trim();
        if (!clean) return;
        onConfirm(clean);
        onOpenChange(false);
        return;
      }

      if (!file) return;
      setUploading(true);
      setProgress(10);

      const uploader = uploadFile ?? uploadViaSupabaseBucket;
      const publicUrl = await uploader(file, (pct) =>
        setProgress(Math.max(5, Math.min(99, pct))),
      );
      setProgress(100);
      onConfirm(publicUrl);
      onOpenChange(false);
    } catch (e: any) {
      const msg = e?.message || "アップロードに失敗しました。";
      setErrMsg(msg);
      console.error("[MediaUploader] upload error:", e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mediaType === "image" ? "サムネイル画像" : "サムネイル動画"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "url")}>
          <TabsList>
            <TabsTrigger value="upload">アップロード</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          {/* Upload tab */}
          <TabsContent value="upload" className="space-y-3">
            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pickFile();
                }
              }}
              onClick={pickFile}
              onDragEnter={(e) => {
                if (e.dataTransfer?.items?.length) setDragActive(true);
              }}
              onDragOver={(e) => {
                if (e.dataTransfer?.items?.length) {
                  e.preventDefault();
                  setDragActive(true);
                }
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={cn(
                "relative grid place-items-center rounded-md border-2 border-dotted p-6 text-sm transition-all",
                "bg-muted/40 hover:border-solid",
                dragActive && "border-solid ring-2 ring-ring ring-offset-2",
                "cursor-pointer select-none",
              )}
            >
              <div className="pointer-events-none text-center">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
                  {mediaType === "image" ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <VideoIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="font-medium">
                  クリックまたはドラッグ＆ドロップで
                  {mediaType === "image" ? "画像" : "動画"}を選択
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  対応:{" "}
                  <code>{mediaType === "image" ? "image/*" : "video/*"}</code>
                  {hintText ? <> ・ {hintText}</> : null}
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  setErrMsg(null);
                  const f = e.target.files?.[0] ?? null;
                  if (!f) return setFile(null);
                  if (!f.type.startsWith(mediaType)) {
                    setErrMsg(
                      mediaType === "image"
                        ? "画像ファイルを選択してください。"
                        : "動画ファイルを選択してください。",
                    );
                    return;
                  }
                  setFile(f);
                }}
              />
            </div>

            {/* Selected file summary */}
            {file && (
              <div className="rounded-md border bg-background p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-medium">選択中:</span>{" "}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {file.type || "unknown"} ・ {prettySize(file.size)}
                  </div>
                </div>
              </div>
            )}

            {/* Temporary preview (no upload yet) */}
            {filePreview && (
              <div className="grid place-items-center overflow-hidden rounded-md border bg-black/5">
                <div className="h-48 w-full">
                  {mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filePreview}
                      alt="preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <video
                      src={filePreview}
                      controls
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {isUploading && <Progress value={progress} className="h-2" />}
            {errMsg && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {errMsg}
              </div>
            )}
          </TabsContent>

          {/* URL tab */}
          <TabsContent value="url">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="media-url">
                {mediaType === "image" ? "画像 URL" : "動画 URL"}
              </label>
              <Input
                id="media-url"
                placeholder={`https://... (${mediaType})`}
                value={url}
                onChange={(e) => {
                  setErrMsg(null);
                  setUrl(e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                公開アクセス可能な URL を指定してください。
              </p>
            </div>

            {/* Quick live URL preview */}
            {url.trim() && (
              <div className="grid place-items-center overflow-hidden rounded-md border bg-black/5">
                <div className="h-48 w-full">
                  {mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt="preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <video
                      src={url}
                      controls
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {errMsg && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {errMsg}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UploadCloud className="h-4 w-4" />
            {mediaType === "image"
              ? "非トリミング表示（object-contain）"
              : "プレビューは object-contain で表示"}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              キャンセル
            </Button>
            <Button
              onClick={doSave}
              disabled={isUploading || (tab === "upload" ? !file : !url.trim())}
            >
              {isUploading ? "保存中…" : "保存"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
