'use client';

import { Briefcase } from 'lucide-react';

interface ExperienceSectionProps {
  experience: string[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">過去の経験</h3>
      {experience.length > 0 ? (
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="mt-0,5 p-2 bg-primary/10 rounded-md">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground">{exp}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">経験が設定されていません。</p>
      )}
    </div>
  );
}