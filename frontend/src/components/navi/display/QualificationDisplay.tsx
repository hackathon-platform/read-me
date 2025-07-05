"use client";

import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Qualification } from "@/lib/types";

function formatDate(date: string) {
  if (!date) return "";
  const [year, month] = date.split("-");
  return `${year}年${month}月`;
}

export function QualificationDisplay({
  qualifications,
}: {
  qualifications: Qualification[];
}) {
  return (
    <div>
      {/* Heading */}
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5" />
        <h3 className="font-semibold">資格・免許</h3>
      </div>
      <Separator className="mt-1 mb-3" />

      {qualifications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Award className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">
            資格が登録されていません。
          </p>
        </div>
      ) : (
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {qualifications.map((qualification, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {qualification.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>取得日: {formatDate(qualification.acquisitionDate)}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
