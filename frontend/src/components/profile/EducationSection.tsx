'use client';

import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  education: string;
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">最終学歴</h3>
      <div className="flex items-center gap-3">
        <div className="mt-0.5 p-2 bg-primary/10 rounded-md">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-foreground">{education || '学歴が設定されていません。'}</p>
        </div>
      </div>
    </div>
  );
}