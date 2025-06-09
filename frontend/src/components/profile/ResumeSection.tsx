"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResumeSectionProps {
  resumeUrl: string;
}

export function ResumeSection({ resumeUrl }: ResumeSectionProps) {
  if (!resumeUrl) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">履歴書</h3>
      <div className="border rounded-lg p-6 flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-primary mb-4" />
        <h4 className="text-md font-medium mb-2">履歴書.pdf</h4>
        <div className="flex gap-3 mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                表示
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[100vw] h-[80vh]">
              <DialogHeader>
                <DialogTitle>履歴書</DialogTitle>
              </DialogHeader>
              <iframe
                src={resumeUrl}
                className="w-full h-full rounded-md"
                title="履歴書"
              />
            </DialogContent>
          </Dialog>
          <a href={resumeUrl} download="履歴書.pdf">
            <Button size="sm">ダウンロード</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
