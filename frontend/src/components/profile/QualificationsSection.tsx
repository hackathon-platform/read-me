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
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">資格・スキル</h3>
      {qualifications.length > 0 ? (
        <div className="space-y-4">
          {qualifications.map((qualification, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-md">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{qualification.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(qualification.acquisitionDate)}
                  {qualification.score && ` - ${qualification.score}`}
                </p>
                {qualification.description && (
                  <p className="text-sm mt-1">{qualification.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          資格が設定されていません。
        </p>
      )}
    </div>
  );
}
