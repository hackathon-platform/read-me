"use client";

import { useState } from "react";
import BasicDisplay from "../display/BasicDisplay";
import { ProfileEdit } from "../edit/ProfileEdit";
import { Basic } from "@/lib/types";
import { EditIcon } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCanEditProfile } from "@/hooks/useCanEdit";

interface BasicSectionProps {
  profileId: string;
  basic: Basic;
  /** Force mobile layout even on large screens */
  isCompact?: boolean;
}

export function BasicSection({ profileId, basic, isCompact = false }: BasicSectionProps) {
  const [open, setOpen] = useState(false);
  const formId = "profile-edit-form";
  const canEdit = useCanEditProfile(profileId);

  return (
    <div className="relative" data-compact={isCompact ? "true" : "false"}>
      <BasicDisplay profileId={profileId} basic={basic} isCompact={isCompact} />

      {canEdit && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              className={
                isCompact
                  ? "absolute top-2 right-2"
                  : "absolute top-2 right-2 md:top-4 md:right-4"
              }
              aria-label="プロフィール編集"
            >
              <EditIcon size={16} />
            </button>
          </DrawerTrigger>

          <DrawerContent
            className={`max-h-[90vh] ${isCompact ? "px-4" : "lg:px-40"}`}
          >
            <DrawerHeader>
              <DrawerTitle>プロフィール編集</DrawerTitle>
              <DrawerDescription>
                基本情報やSNSリンクを編集できます
              </DrawerDescription>
            </DrawerHeader>

            {/* フォーム本体（スクロール領域） */}
            <div className="overflow-y-auto px-4 pb-2 max-h-[calc(90vh-120px)]">
              <ProfileEdit
                profileId={profileId}
                initialData={basic}
                onSave={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                key={open ? "open" : "closed"}
              />
            </div>

            <DrawerFooter className="flex flex-row items-center justify-end gap-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </DrawerClose>

              {/* 外部からフォーム送信 */}
              <Button type="submit" form={formId}>
                保存
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
