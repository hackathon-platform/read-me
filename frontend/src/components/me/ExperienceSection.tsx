"use client";

import { useState } from "react";
import { ExperienceDisplay } from "./display/ExperienceDisplay";
import { ExperienceEdit } from "./edit/ExperienceEdit";
import { Experience } from "@/lib/types";
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

interface Props {
  profileId: string;
  experiences: Experience[];
}

export function ExperienceSection({ profileId, experiences }: Props) {
  const [open, setOpen] = useState(false);
  const formId = "experience-edit-form";

  return (
    <div className="relative">
      <ExperienceDisplay experiences={experiences} />

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="absolute top-1 right-2">
            <EditIcon size={16} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] lg:px-40">
          <DrawerHeader>
            <DrawerTitle>職歴編集</DrawerTitle>
            <DrawerDescription>職歴情報を編集できます</DrawerDescription>
          </DrawerHeader>

          {/* フォーム本体（スクロール領域） */}
          <div className="overflow-y-auto px-4 pb-2 max-h-[calc(90vh-120px)]">
            <ExperienceEdit
              profileId={profileId}
              initialData={experiences}
              onSave={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>

          <DrawerFooter className="flex flex-row items-center justify-end gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </DrawerClose>
            <Button type="submit" form={formId}>
              保存する
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
