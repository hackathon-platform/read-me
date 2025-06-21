"use client";

import { Award } from "lucide-react";
import { Qualification } from "@/lib/types";

interface QualificationsSectionProps {
  qualifications?: Qualification[];
}

function formatDate(date: string) {
  const [year, month] = date.split("-");
  return `${year}年${month}月`;
}

export function QualificationsSection({
  qualifications = [],
}: QualificationsSectionProps) {
  if (!qualifications.length) {
    return (
      <p className="text-muted-foreground text-sm">
        資格が設定されていません。
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {qualifications.map((q, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-primary/10 rounded-md">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{q.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(q.acquisitionDate)}
              {q.score && ` - ${q.score}`}
            </p>
            {q.description && <p className="text-sm mt-1">{q.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
