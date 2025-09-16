"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GalleryGrid from "./GalleryGrid";
import ErrorState from "./ErrorState";
import GallerySkeleton from "./GallerySkeleton";
import ParticipantsList from "./ParticipantsList";
import { ProjectAtEventPreview } from "@/components/project/ProjectPreview";
import type { ProjectWithPeople } from "@/lib/types";
import type { ParticipantWithProfile } from "@/lib/types";

export default function DesktopGalleryLayout({
  items,
  loading,
  error,
  selected,
  onSelect,
  page,
  totalPages,
  setPage,
  tab,
  setTab,
  participants,
}: {
  items: ProjectWithPeople[];
  loading: boolean;
  error: string | null;
  selected: ProjectWithPeople | null;
  onSelect: (p: ProjectWithPeople) => void;
  page: number;
  totalPages: number;
  setPage: (n: number) => void;
  tab: "preview" | "participants";
  setTab: (t: "preview" | "participants") => void;
  participants: ParticipantWithProfile[];
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-lg border bg-card"
    >
      <ResizablePanel defaultSize={40} minSize={30} className="p-4">
        {loading ? (
          <GallerySkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <GalleryGrid items={items} onClick={onSelect} />
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              次へ
            </Button>
          </div>
        )}
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={60}
        minSize={50}
        className="border-l bg-background"
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="flex h-full flex-col"
        >
          <TabsList className="sticky top-0 z-10 -mb-px w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
            <TabsTrigger value="participants">開発メンバー</TabsTrigger>
          </TabsList>

          <TabsContent
            value="preview"
            className="m-0 min-h-0 flex-1 overflow-y-auto p-4"
          >
            {!selected ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  左のギャラリーからアイテムを選択してください
                </p>
              </div>
            ) : (
              <ProjectAtEventPreview
                data={selected}
                owner={selected.owner || undefined}
              />
            )}
          </TabsContent>

          <TabsContent
            value="participants"
            className="m-0 flex-1 overflow-auto p-4"
          >
            <ParticipantsList participants={participants} />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
