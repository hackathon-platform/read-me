"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import formatJPDate from "@/lib/utils/date";
import ProjectPreview from "@/components/project/ProjectPreview";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TECH_BY_KEY, type TechDisplay } from "@/lib/tech/catalog";
import { TechIcon } from "@/components/tech/TechChips";
import { X, Image as ImageIcon } from "lucide-react";

type Props = {
  projects: Project[];
};

export default function ProjectGallery({ projects }: Props) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Project | null>(null);

  const onClickCard = (p: Project) => {
    setCurrent(p);
    setOpen(true);
  };

  if (projects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        プロジェクトはまだありません。
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {projects.map((p) => (
          <GalleryCard key={p.id} project={p} onClick={() => onClickCard(p)} />
        ))}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="">
          {current && (
            <div className="h-[85vh] max-h-[90vh] mx-auto w-full max-w-5xl flex flex-col">
              <DrawerHeader className="sticky top-0 z-10 pr-12">
                <DrawerTitle className="text-xl">{current.title}</DrawerTitle>
                <p className="text-xs text-muted-foreground">
                  更新日:{" "}
                  {formatJPDate(current.updatedAt || current.createdAt || "")}
                </p>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="閉じる"
                    className={cn("absolute top-2.5 right-2.5")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>

              <div className="min-h-0 overflow-y-auto">
                {/* ProjectPreview expects snake_case keys; map as needed */}
                <ProjectPreview
                  data={{
                    title: current.title,
                    summary: current.summary,
                    thumbnail_url: current.thumbnailUrl ?? null,
                    content: current.content ?? null,
                    updated_at: current.updatedAt ?? current.createdAt ?? "",
                    techKeys: current.techKeys ?? [], // ← pass chips to preview
                  }}
                />
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

const TechChips = React.memo(function TechChips({
  keys,
  className,
}: {
  keys?: string[];
  className?: string;
}) {
  const techs = React.useMemo(
    () =>
      (keys ?? []).map((k) => TECH_BY_KEY[k]).filter(Boolean) as TechDisplay[],
    [keys],
  );

  if (!techs.length) return null;

  return (
    <div className={cn("py-2 flex flex-wrap gap-1", className)}>
      {techs.map((t) => (
        <Badge key={t.key} variant="secondary">
          <TechIcon kind={t.kind} keyName={t.key} alt={t.label} size={12} />
          <span className="text-xs leading-none">{t.label}</span>
        </Badge>
      ))}
    </div>
  );
});

function GalleryCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const isTouch =
    typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left rounded-md border bg-card overflow-hidden",
        // ↓ make the whole card a vertical flex container
        "flex h-full flex-col",
        "transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* media stays at the very top */}
      <div className="relative w-full aspect-[16/9] bg-muted/40">
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-contain object-top bg-black/5"
          />
        ) : (
          <NoThumb />
        )}

        {project.summary && !isTouch && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "bg-gradient-to-b from-black/90 via-black/80 to-black/60",
              "backdrop-blur-[1px]",
            )}
          >
            <div className="absolute h-full p-3 text-white text-sm leading-relaxed">
              {project.summary}
            </div>
          </div>
        )}
      </div>

      {/* content grows and any leftover space sits beneath it */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="font-medium line-clamp-2">{project.title}</div>
        {/* touch devices: inline snippet instead of hover */}
        {project.summary && isTouch && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words">
            {project.summary}
          </div>
        )}

        {/* put chips near the bottom; mt-auto pushes them down if there's extra height */}
        <TechChips keys={project.techKeys} className="mt-2 md:mt-auto" />

        <div className="text-xs text-muted-foreground mt-1">
          更新日: {formatJPDate(project.updatedAt || project.createdAt || "")}
        </div>
      </div>
    </button>
  );
}

// 3) add this helper component (below GalleryCard in the same file is fine)
function NoThumb() {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center rounded-none",
        "bg-gradient-to-b from-muted/60 to-muted",
      )}
      aria-label="No thumbnail"
    >
      <div className="flex items-center gap-2 text-muted-foreground/80">
        <ImageIcon className="h-4 w-4" />
        <span className="text-xs">No thumbnail</span>
      </div>
    </div>
  );
}
