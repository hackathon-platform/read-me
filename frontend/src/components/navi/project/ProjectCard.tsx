"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Globe, 
  Video,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, isOwner, onEdit, onDelete }: Props) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Reset media index when project changes
  useEffect(() => {
    setCurrentMediaIndex(0);
    setImageError({});
  }, [project.id, project.media]);

  const handleImageError = (url: string) => {
    setImageError(prev => ({ ...prev, [url]: true }));
  };

  const nextMedia = () => {
    if (project.media && project.media.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % project.media.length);
    }
  };

  const prevMedia = () => {
    if (project.media && project.media.length > 1) {
      setCurrentMediaIndex((prev) => (prev - 1 + project.media.length) % project.media.length);
    }
  };

  const hasMedia = project.media && project.media.length > 0;
  const hasMultipleMedia = project.media && project.media.length > 1;
  const currentMedia = hasMedia ? project.media[currentMediaIndex] : null;

  return (
    <Card className="rounded-none pt-0 gap-2">
      {/* Media Section - Top of card */}
      {hasMedia && currentMedia && (
        <div className="relative aspect-video bg-muted overflow-hidden">
          {currentMedia.type === 'image' && !imageError[currentMedia.url] ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.caption || `${project.title} media`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(currentMedia.url)}
            />
          ) : currentMedia.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                src={currentMedia.url}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster={currentMedia.url + '#t=0.1'}
              />
              <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                <Video className="h-4 w-4 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center">
                <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">メディアを読み込めません</p>
              </div>
            </div>
          )}
          
          {/* Navigation arrows for multiple media */}
          {hasMultipleMedia && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={prevMedia}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={nextMedia}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Media indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {project.media.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentMediaIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Header with title and edit button */}
      <CardHeader className="px-3 pt-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold leading-tight flex-1 pr-2">
            {project.title}
          </h4>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Description */}
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
          {project.description}
        </p>

        {/* Footer with link and date */}
        <div className="flex justify-between items-center">
          {/* Project URL */}
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span>プロジェクトを見る</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <div /> // Empty div to maintain spacing
          )}

          {/* Updated date */}
          {project.updatedAt && (
            <span className="text-xs text-muted-foreground">
              更新日: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}