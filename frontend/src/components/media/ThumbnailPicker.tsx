"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon } from "lucide-react";
import MediaUploader from "./MediaUploader";
import { cn } from "@/lib/utils";

type Props = {
  /** Persisted URL from DB (or null). */
  value: string | null;
  /** Called with the final persisted URL (or null on clear). */
  onChange: (url: string | null) => void;

  /** Supabase bucket name to upload into. */
  bucketName: string;

  /** "image" | "video" (how to preview & accept) */
  mediaType?: "image" | "video";
};

export default function ThumbnailPicker({
  value,
  onChange,
  bucketName,
  mediaType = "image",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const hasMedia = Boolean(value);

  return (
    <div
      className={cn(
        // 高さは常に固定（h-40）。幅は親に合わせて伸縮。
        "relative group w-full h-full rounded-sm overflow-hidden bg-muted/40 transition-colors",
        hasMedia
          ? "border"
          : // 空状態のみドット罫線 → ホバーでソリッドに
            "border-2 border-dotted aspect-16/9 hover:border-solid",
      )}
    >
      {/* プレビュー（非トリミング・同じ高さ維持） */}
      {hasMedia ? (
        mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value as string}
            alt="thumbnail"
            className="h-full w-full object-contain bg-black/5"
          />
        ) : (
          <video
            src={value as string}
            controls
            className="h-full w-full object-contain bg-black/5"
          />
        )
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <div className="text-center">
            {mediaType === "image" ? (
              <ImageIcon className="mx-auto mb-1 h-7 w-7" />
            ) : (
              <VideoIcon className="mx-auto mb-1 h-7 w-7" />
            )}
            <p className="text-xs">
              サムネイル（{mediaType === "image" ? "画像" : "動画"}）–
              クリックでアップロード
            </p>
          </div>
        </div>
      )}

      {/* 右上アクション */}
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => setOpen(true)}
          className="shadow-sm"
        >
          {hasMedia ? "変更" : "アップロード"}
        </Button>
        {hasMedia && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange(null)}
            className="shadow-sm"
          >
            クリア
          </Button>
        )}
      </div>

      {/* 全面クリックで開く（ボタンより後に置くが、z-index でボタン優先） */}
      <button
        className="absolute inset-0 z-0 cursor-pointer appearance-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="サムネイルを選択"
        onClick={() => setOpen(true)}
      />

      {/* アップロードダイアログ（保存時のみDBにURLを渡す） */}
      <MediaUploader
        open={open}
        onOpenChange={setOpen}
        mediaType={mediaType}
        bucketName={bucketName}
        onConfirm={(url) => onChange(url)}
      />
    </div>
  );
}
