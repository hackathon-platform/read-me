"use client";

import * as React from "react";
import {
  getProjectsByProfileId,
  type DbProject,
} from "@/lib/supabase/get/project-by-profile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarkdownPreview from "@/components/markdown/MarkdownPreview";
import formatJPDate from "@/lib/utils/date";

type Props = {
  profileId: string;
};

export default function ProjectGallery({ profileId }: Props) {
  const [items, setItems] = React.useState<DbProject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<DbProject | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await getProjectsByProfileId(profileId);
      if (mounted) setItems(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [profileId]);

  const onClickCard = (p: DbProject) => {
    setCurrent(p);
    setOpen(true);
  };

  if (loading && items.length === 0) {
    return <div className="text-sm text-muted-foreground">読み込み中…</div>;
  }
  if (!loading && items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        プロジェクトはまだありません。
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {items.map((p) => (
          <GalleryCard key={p.id} project={p} onClick={() => onClickCard(p)} />
        ))}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-0">
          {current && (
            <div className="mx-auto w-full max-w-5xl h-[85vh] max-h-[90vh] flex flex-col">
              {/* 固定ヘッダー */}
              <DrawerHeader className="shrink-0">
                <DrawerTitle className="text-xl">{current.title}</DrawerTitle>
                <p className="text-xs text-muted-foreground">
                  更新日: {formatJPDate(current.updated_at)}
                </p>
              </DrawerHeader>

              {/* スクロールコンテンツ */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Media + Summary */}
                <div className="grid items-start gap-3 md:grid-cols-2 px-4">
                  {current.thumbnail_url && (
                    <div className="pb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.thumbnail_url}
                        alt={current.title}
                        className="w-full h-56 object-contain bg-black/5 rounded-md border"
                      />
                    </div>
                  )}

                  {current.summary && (
                    <div className="pb-2 text-sm text-muted-foreground">
                      {current.summary}
                    </div>
                  )}
                </div>

                <div className="px-4 pb-6">
                  {/* Content (Markdown) */}
                  {current.content && (
                    <MarkdownPreview content={current.content} />
                  )}
                  <DrawerClose asChild>
                    <Button className="w-full mt-2">閉じる</Button>
                  </DrawerClose>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function GalleryCard({
  project,
  onClick,
}: {
  project: DbProject;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left rounded-md border bg-card overflow-hidden",
        "transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="relative h-40 w-full bg-muted/40">
        {project.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="h-full w-full object-contain bg-black/5"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">
            No thumbnail
          </div>
        )}

        {/* Hover summary overlay */}
        {project.summary && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/80 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity",
            )}
          >
            <div className="absolute top-0 p-3 text-white text-sm">
              {project.summary}
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="font-medium line-clamp-2">{project.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          更新日: {formatJPDate(project.updated_at)}
        </div>
      </div>
    </button>
  );
}
