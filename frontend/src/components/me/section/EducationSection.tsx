"use client";

import { useState } from "react";
import { EducationDisplay } from "../display/EducationDisplay";
import { EducationEdit } from "../edit/EducationEdit";
import { Education } from "@/lib/types";
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

interface Props {
  profileId: string;
  educations: Education[];
}

export function EducationSection({ profileId, educations }: Props) {
  const [open, setOpen] = useState(false);
  const formId = "education-edit-form";
  const canEdit = useCanEditProfile(profileId);

  return (
    <div className="relative">
      <EducationDisplay educations={educations} />
      {canEdit && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button className="absolute top-1 right-2">
              <EditIcon size={16} />
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh] lg:px-40">
            <DrawerHeader>
              <DrawerTitle>学歴編集</DrawerTitle>
              <DrawerDescription>学歴情報を編集できます</DrawerDescription>
            </DrawerHeader>

            {/* フォーム本体（スクロール領域） */}
            <div className="overflow-y-auto px-4 pb-2 max-h-[calc(90vh-120px)]">
              <EducationEdit
                profileId={profileId}
                initialData={educations}
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
                保存
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
