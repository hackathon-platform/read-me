// frontend/src/components/me/section/ProjectGallery.tsx
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
import { X } from "lucide-react";
import ProjectPreview from "@/components/project/ProjectPreview";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TECH_BY_KEY, type TechDisplay } from "@/lib/tech/catalog";
import { TechIcon } from "@/components/tech/TechChips";


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
            <div className="mx-auto w-full max-w-5xl  flex flex-col">
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

              <div className="flex-1 min-h-0 overflow-y-auto">
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
      (keys ?? [])
        .map((k) => TECH_BY_KEY[k])
        .filter(Boolean) as TechDisplay[],
    [keys],
  );

  if (!techs.length) return null;

  return (
    <div className={cn("mt-2 flex flex-wrap gap-2", className)}>
      {techs.map((t) => (
        <Badge key={t.key} variant="secondary" className="gap-1">
          <TechIcon kind={t.kind} keyName={t.key} alt={t.label} size={12}/>
          <span className="text-[12px] leading-none">{t.label}</span>
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
  const isTouch = typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left rounded-md border bg-card overflow-hidden",
        "transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="relative h-40 w-full bg-muted/40">
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-contain bg-black/5"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">
            No thumbnail
          </div>
        )}

        {project.summary && !isTouch && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "bg-gradient-to-b from-black/70 via-black/60 to-transparent",
              "backdrop-blur-[1px]",
            )}
          >
            <div className="absolute inset-x-0 top-0 p-3 text-white text-sm leading-relaxed
            line-clamp-3 break-words">
              {project.summary}
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="font-medium line-clamp-2">{project.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          更新日: {formatJPDate(project.updatedAt || project.createdAt || "")}
        </div>

        {/* touch devices: inline snippet instead of hover */}
        {project.summary && isTouch && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words">
            {project.summary}
          </div>
        )}

        <TechChips keys={project.techKeys} className="mt-2" />
      </div>
    </button>
  );
}

