"use client";

import React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { ImageBlock, VideoBlock } from "./types";

type Props = {
  kind: "image" | "video";
  src?: string;
  caption?: string;
  onPick: (file: File) => void; // parent sets preview URL or uploads
  onChange: (p: Partial<ImageBlock & VideoBlock>) => void; // { src: undefined } clears, { caption } updates
  onFocus: () => void;

  // Options
  ratio?: number; // used when height is not provided; default 16/9
  height?: number; // fixed px height; if set, overrides ratio mode
  maxImageMB?: number; // default 1
  maxVideoMB?: number; // no limit by default
  showCaption?: boolean; // default true
  disabled?: boolean; // default false
  className?: string;
};

export default function MediaEditor({
  kind,
  src,
  caption,
  onPick,
  onChange,
  onFocus,
  ratio = 16 / 9,
  height, // <-- NEW: pass e.g. 240
  maxImageMB = 1,
  maxVideoMB,
  showCaption = true,
  disabled = false,
  className,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = React.useState(0);
  const [dragDepth, setDragDepth] = React.useState(0);
  const inputId = React.useId();

  const accept = kind === "image" ? "image/*" : "video/*";
  const dragOver = dragDepth > 0;

  function resetPicker() {
    setFileKey((k) => k + 1);
  }

  function overLimit(file: File) {
    const sizeMB = file.size / 1024 / 1024;
    if (kind === "image" && sizeMB > maxImageMB) {
      toast.error(`画像は${maxImageMB}MB以下にしてください。`);
      return true;
    }
    if (
      kind === "video" &&
      typeof maxVideoMB === "number" &&
      sizeMB > maxVideoMB
    ) {
      toast.error(`動画は${maxVideoMB}MB以下にしてください。`);
      return true;
    }
    return false;
  }

  async function handlePicked(file?: File | null) {
    if (!file) return;
    if (overLimit(file)) {
      resetPicker();
      return;
    }
    onPick(file);
  }

  const onDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragDepth((d) => d + 1);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragDepth((d) => Math.max(0, d - 1));
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragDepth(0);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePicked(file);
  };

  // --- shared inner content (preview/placeholder + label + actions) ---
  const Inner = (
    <>
      {/* Preview / Placeholder */}
      {src ? (
        kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="media"
            className={cn(
              "absolute inset-0 h-full w-full",
              height ? "object-contain bg-muted/20" : "object-cover",
            )}
          />
        ) : (
          <video
            src={src}
            controls
            className={cn(
              "absolute inset-0 h-full w-full",
              height ? "object-contain bg-muted/20" : "object-cover",
            )}
          />
        )
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/90 pointer-events-none select-none">
          <div className="text-center">
            <UploadCloud className="w-7 h-7 mx-auto mb-1" />
            <p className="text-xs">
              {kind === "image"
                ? "画像 – クリックまたはドロップでアップロード"
                : "動画 – クリックまたはドロップでアップロード"}
            </p>
            {kind === "image" && (
              <p className="mt-1 text-[10px] opacity-80">
                推奨: 横長、{maxImageMB}MB以下
              </p>
            )}
          </div>
        </div>
      )}

      {/* Click-anywhere label */}
      {!disabled && (
        <label
          htmlFor={inputId}
          className="absolute inset-0 cursor-pointer z-0"
          aria-label={kind === "image" ? "画像を選択" : "動画を選択"}
          onClick={onFocus}
        />
      )}

      {/* Actions */}
      {src && !disabled && (
        <div className="absolute bottom-2 right-2 z-10 flex gap-2">
          <button
            type="button"
            className="h-8 rounded-md bg-background/90 px-3 text-sm shadow hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange({ src: undefined });
              resetPicker();
            }}
          >
            {kind === "image" ? "画像を削除" : "動画を削除"}
          </button>
          <button
            type="button"
            className="h-8 rounded-md bg-secondary/90 px-3 text-sm shadow hover:bg-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            変更
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className={cn("space-y-2", className)} onClick={onFocus}>
      <div
        className={cn(
          "relative overflow-hidden rounded-md border",
          src ? "p-0" : "border-dashed bg-muted/30",
          dragOver && "ring-2 ring-primary/60",
          disabled && "opacity-60",
        )}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={height ? { height } : undefined} // <-- fixed height when provided
      >
        {height ? (
          // Fixed-height mode (letterboxes horizontally using object-contain)
          <div className="absolute inset-0">{Inner}</div>
        ) : (
          // Ratio mode (original behavior)
          <AspectRatio ratio={ratio} className="relative">
            {Inner}
          </AspectRatio>
        )}

        {/* Hidden input */}
        <input
          key={fileKey}
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handlePicked(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Caption (optional) */}
      {showCaption && (
        <input
          value={caption ?? ""}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="キャプション（任意）"
          className="min-w-[200px] h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          disabled={disabled}
        />
      )}
    </div>
  );
}
