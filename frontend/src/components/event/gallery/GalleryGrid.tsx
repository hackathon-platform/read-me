"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import type { ProjectWithPeople } from "@/lib/types";

export default function GalleryGrid({
  items,
  onClick,
}: {
  items: ProjectWithPeople[];
  onClick: (d: ProjectWithPeople) => void;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">提出された成果物はまだありません。</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {items.map((d) => (
        <button
          key={d.id}
          onClick={() => onClick(d)}
          className="group overflow-hidden rounded-xl border text-left transition hover:shadow-md"
        >
          <div className="relative aspect-video w-full bg-muted">
            {d.thumbnailUrl ? (
              <Image
                src={d.thumbnailUrl}
                alt={d.title}
                fill
                className="object-cover"
                sizes="(min-width:1024px) 50vw, 100vw"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-white opacity-0 transition group-hover:opacity-100">
              <p className="line-clamp-1 text-sm font-medium">{d.title}</p>
              <p className="line-clamp-1 text-xs opacity-80">
                {d.owner?.username ||
                  `${d.owner?.firstName ?? ""} ${d.owner?.lastName ?? ""}`}
              </p>
            </div>
          </div>
          <div className="space-y-2 p-3">
            <p className="line-clamp-1 font-medium">{d.title}</p>
            {d.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {d.summary}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
