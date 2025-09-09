"use client";

import { useState } from "react";
import { QualificationEdit } from "../edit/QualificationEdit";
import { QualificationDisplay } from "../display/QualificationDisplay";
import { Qualification } from "@/lib/types";
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
  qualifications: Qualification[];
}

export function QualificationSection({ profileId, qualifications }: Props) {
  const [open, setOpen] = useState(false);
  const formId = "qualification-edit-form";

  return (
    <div className="relative">
      <QualificationDisplay qualifications={qualifications} />
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="absolute top-1 right-2">
            <EditIcon size={16} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] lg:px-40">
          <DrawerHeader>
            <DrawerTitle>資格・免許編集</DrawerTitle>
            <DrawerDescription>資格・免許情報を編集できます</DrawerDescription>
          </DrawerHeader>

          {/* フォーム本体（スクロール領域） */}
          <div className="overflow-y-auto px-4 pb-2 max-h-[calc(90vh-120px)]">
            <QualificationEdit
              profileId={profileId}
              initialData={qualifications}
              onSave={() => setOpen(false)}
              onCancel={() => setOpen(false)}
              formId={formId}
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
    </div>
  );
}
