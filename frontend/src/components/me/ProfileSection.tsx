"use client";

import { useState } from "react";
import ProfileDisplay from "./display/ProfileDisplay";
import { ProfileEdit } from "./edit/ProfileEdit";
import { Profile } from "@/lib/types";
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

interface ProfileSectionProps {
  profile: Profile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [open, setOpen] = useState(false);
  const formId = "profile-edit-form";

  return (
    <div className="relative">
      <ProfileDisplay profile={profile} />

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="absolute top-2 right-2">
            <EditIcon size={16} />
          </button>
        </DrawerTrigger>

        <DrawerContent className="max-h-[90vh] lg:px-40">
          <DrawerHeader>
            <DrawerTitle>プロフィール編集</DrawerTitle>
            <DrawerDescription>
              基本情報やSNSリンクを編集できます
            </DrawerDescription>
          </DrawerHeader>

          {/* フォーム本体（スクロール領域） */}
          <div className="overflow-y-auto px-4 pb-2 max-h-[calc(90vh-120px)]">
            <ProfileEdit
              initialData={profile}
              onSave={() => setOpen(false)}
              onCancel={() => setOpen(false)}
              formId={formId}
              key={open ? "open" : "closed"} // 閉じたら初期値に戻したい場合に再マウント
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
    </div>
  );
}
