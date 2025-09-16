"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import GalleryGrid from "./GalleryGrid";
import ErrorState from "./ErrorState";
import GallerySkeleton from "./GallerySkeleton";
import { ProjectAtEventPreview } from "@/components/project/ProjectPreview";
import type { ProjectWithPeople } from "@/lib/types";

export default function MobileGalleryLayout({
  items,
  loading,
  error,
  selected,
  onSelect,
  openDrawer,
  setOpenDrawer,
}: {
  items: ProjectWithPeople[];
  loading: boolean;
  error: string | null;
  selected: ProjectWithPeople | null;
  onSelect: (p: ProjectWithPeople) => void;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
}) {
  return (
    <>
      {loading ? (
        <GallerySkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <GalleryGrid items={items} onClick={onSelect} />
      )}

      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="p-0">
          <div className="mx-auto flex h-[85vh] max-h-[90vh] w-full max-w-5xl flex-col">
            <DrawerHeader className="px-4 pt-4">
              <DrawerTitle>プレビュー</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="閉じる"
                  className={cn("absolute right-2.5 top-2.5")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {selected && (
                <ProjectAtEventPreview
                  data={selected}
                  owner={selected.owner || undefined}
                />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
