"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, VideoIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/supabaseClient";

type Props = {
  /** DBに保存されている公開URL（なければ null） */
  value: string | null;
  /** アップロード完了時に公開URL（クリア時は null）を返す */
  onChange: (url: string | null) => void;
  bucketName: string;
  mediaType?: "image" | "video";

  /** 例: "推奨 16:9 / 2MB 以下" といったヒント文 */
  hintText?: string;
  className?: string;
};

export default function ThumbnailPicker({
  value,
  onChange,
  bucketName,
  mediaType = "image",
  hintText,
  className = "",
}: Props) {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasMedia = Boolean(value);
  const accept = mediaType === "image" ? "image/*" : "video/*";

  const pickFile = () => inputRef.current?.click();

  const handleFile = async (file: File | null) => {
    setErrMsg(null);
    if (!file) return;
    if (!file.type.startsWith(mediaType)) {
      setErrMsg(
        mediaType === "image"
          ? "画像ファイルを選択してください。"
          : "動画ファイルを選択してください。",
      );
      return;
    }
    try {
      setUploading(true);
      setProgress(10);
      const url = await uploadViaSupabaseBucket(bucketName, file, (p) =>
        setProgress(Math.max(5, Math.min(99, p))),
      );
      setProgress(100);
      onChange(url);
    } catch (e: any) {
      setErrMsg(e?.message || "アップロードに失敗しました。");
      console.error("[ThumbnailPicker] upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0] ?? null;
    void handleFile(f);
  };

  return (
    <div
      className={cn(
        "relative group rounded-sm overflow-hidden bg-muted/40 transition-[border-color,box-shadow] border-2 border-input",
        !hasMedia && "border-dashed hover:border-solid hover:border-ring",
        dragActive && "border-solid border-ring",
        className,
      )}
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
    >
      {/* プレビュー */}
      {hasMedia ? (
        mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value!}
            alt="thumbnail"
            className="h-full w-full object-contain bg-black/5"
          />
        ) : (
          <video
            src={value!}
            controls
            className="h-full w-full object-contain bg-black/5"
          />
        )
      ) : (
        <button
          type="button"
          onClick={pickFile}
          className="absolute inset-0 grid place-items-center text-muted-foreground"
          aria-label="サムネイルを選択"
        >
          <div className="text-center">
            {mediaType === "image" ? (
              <ImageIcon className="mx-auto mb-1 h-7 w-7" />
            ) : (
              <VideoIcon className="mx-auto mb-1 h-7 w-7" />
            )}
            <p className="text-xs">
              クリックまたはドラッグ＆ドロップで
              {mediaType === "image" ? "画像" : "動画"}を選択
            </p>
            {hintText && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {hintText}
              </p>
            )}
          </div>
        </button>
      )}

      {/* クリア（最小限のUI。Uploadボタンやポップアップは廃止） */}
      {hasMedia && (
        <div className="absolute right-2 top-2 z-10">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={() => onChange(null)}
            aria-label="クリア"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 非表示のfile input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {/* アップロード進捗＆エラー */}
      {uploading && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-background/80 p-2 backdrop-blur">
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
      {errMsg && (
        <div className="absolute inset-x-0 bottom-0 z-20 rounded-none border-t bg-destructive/10 p-2 text-xs text-destructive">
          {errMsg}
        </div>
      )}
    </div>
  );
}

/** Supabase Storage にアップロードして公開URLを返す */
async function uploadViaSupabaseBucket(
  bucketName: string,
  f: File,
  onProg?: (p: number) => void,
): Promise<string> {
  onProg?.(5);
  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2);
  const path = `project-assets/${new Date().toISOString().slice(0, 10)}/${uuid}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, f, {
      cacheControl: "3600",
      upsert: false,
      contentType: f.type || "application/octet-stream",
    });
  if (error) throw new Error(error.message || "Upload failed");
  onProg?.(95);

  const pub = supabase.storage.from(bucketName).getPublicUrl(data.path);
  if (!pub.data) throw new Error("Failed to get public URL");
  onProg?.(100);

  return pub.data.publicUrl;
}
