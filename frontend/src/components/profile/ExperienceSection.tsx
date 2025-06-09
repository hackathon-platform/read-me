"use client";

import { Building2 } from "lucide-react";
import { Experience } from "@/lib/types";
import Image from "next/image";

interface ExperienceSectionProps {
  experiences: Experience[];
}

function formatDate(date: string | undefined | null) {
  if (!date) return "";
  if (date === "present") return "現在";
  const [year, month] = date.split("-");
  return `${year}年${month}月`;
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">過去の経験</h3>
      {experiences.length > 0 ? (
        <div className="relative">
          <div className="absolute left-6 top-2 bottom-2 w-[2px] bg-border" />
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-4 border-background bg-card overflow-hidden">
                    {exp.iconUrl ? (
                      <Image
                        src={exp.iconUrl}
                        alt={exp.company}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">{exp.company}</h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.position}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(exp.startDate)} 〜 {formatDate(exp.endDate)}
                  </p>
                  <p className="text-sm">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          経験が設定されていません。
        </p>
      )}
    </div>
  );
}
