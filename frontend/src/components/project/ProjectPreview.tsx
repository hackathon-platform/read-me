"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MarkdownPreview from "../markdown/MarkdownPreview";
import formatJPDate from "@/lib/utils/date";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

export type ProjectPreviewData = {
  title: string;
  summary?: string | null;
  thumbnail_url?: string | null;
  content?: string | null;
  updated_at?: string;
};

export type OwnerLite = {
  id: string;
  username?: string | null;
  image_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
} | null;

const ProjectContentPreview = React.memo(function ProjectContentPreview({
  data,
  className,
  imageHeightClass = "h-56",
  imageFit: fit = "object-contain",
}: {
  data: ProjectPreviewData;
  className?: string;
  imageHeightClass?: string;
  imageFit?: "object-contain" | "object-cover";
}) {
  return (
    <div className={cn("px-4 pb-6", className)}>
      <div className={cn("grid items-start gap-3 grid-cols-2", className)}>
        {data.thumbnail_url && (
          <div className="pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.thumbnail_url as string}
              alt={data.title}
              loading="lazy"
              decoding="async"
              className={cn(
                "w-full bg-black/5 rounded-md border",
                imageHeightClass,
                fit,
              )}
            />
          </div>
        )}
        <div className="pb-2 text-sm text-muted-foreground whitespace-pre-wrap">
          {data.summary ? data.summary : "ここに概要が入ります"}
        </div>
      </div>

      {data.content && <MarkdownPreview content={data.content} />}
    </div>
  );
});

export const ProjectPreview = React.memo(function ProjectPreviewSection({
  data,
  className,
  headerClassName,
  contentClassName,
  showHeaderDivider = false,
}: {
  data: ProjectPreviewData;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showHeaderDivider?: boolean;
}) {
  return (
    <section className={cn("px-4 pb-6", className)}>
      <header
        className={cn(
          "mb-2",
          showHeaderDivider && "pb-3 border-b",
          headerClassName,
        )}
      >
        <h2 className="text-2xl font-bold">{data.title}</h2>
        {data.updated_at && (
          <p className="text-xs text-muted-foreground">
            更新日: {formatJPDate(data.updated_at)}
          </p>
        )}
      </header>

      <ProjectContentPreview data={data} className={cn(contentClassName)} />
    </section>
  );
});

export const ProjectAtEventPreview = React.memo(
  function ProjectAtEventPreviewComponent({
    data,
    className,
    contentClassName,
    owner,
  }: {
    data: ProjectPreviewData;
    className?: string;
    contentClassName?: string;
    owner?: OwnerLite;
  }) {
    const ownerName =
      owner?.username ||
      [owner?.first_name, owner?.last_name].filter(Boolean).join(" ") ||
      "匿名";

    return (
      <section className={cn("px-4 pb-6", className)}>
        <div className="flex items-start justify-between">
          <div className="pb-4">
            <h3 className="text-lg font-semibold leading-tight">
              {data.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {ownerName}
            </div>
          </div>

          {/* {owner?.id && (
          <Button asChild size="sm" variant="secondary">
            <Link href={`/u/${owner.id}`}>
              <ExternalLink className="mr-1 h-4 w-4" />
              View profile
            </Link>
          </Button>
        )} */}
        </div>

        <ProjectContentPreview
          data={data}
          className={cn("grid-cols-1", contentClassName)}
        />
      </section>
    );
  },
);

export default ProjectContentPreview;
