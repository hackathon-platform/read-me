"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Video, Loader2 } from "lucide-react";
import type { ProjectMedia } from "@/lib/types";

interface ProjectMediaProps {
  media: ProjectMedia;
  onRemove: () => void;
  isRemoving?: boolean;
}

export function ProjectMediaDisplay({ media, onRemove, isRemoving }: ProjectMediaProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-square bg-muted rounded-md overflow-hidden group">
      {media.type === 'image' && !imageError ? (
        <img
          src={media.url}
          alt={media.caption || "Media"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : media.type === 'video' ? (
        <div className="relative w-full h-full">
          <video
            src={media.url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 rounded-full p-2">
              <Video className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-muted">
          {imageError ? (
            <div className="text-center p-2">
              <X className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">画像を読み込めません</p>
            </div>
          ) : (
            <Video className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      )}
      
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}