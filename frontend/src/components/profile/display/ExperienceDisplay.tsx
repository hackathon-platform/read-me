import { Experience } from "@/lib/types";
import { Briefcase } from "lucide-react";

export function ExperienceDisplay({ experiences }: { experiences: Experience[] }) {
  if (!experiences.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">職歴</h3>
        <p className="text-sm text-muted-foreground">職歴が登録されていません。</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">職歴</h3>
      <div className="relative">
        <div className="absolute md:left-5 left-4 top-2 bottom-2 md:w-[4px] w-[3px] bg-border" />
        <div className="space-y-8">
          {experiences.map((exp, idx) => (
            <div key={idx} className="flex items-start gap-6">
              <div className="relative z-10 flex-shrink-0">
                <div className="md:w-11 md:h-11 w-9 h-9 rounded-lg bg-card overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Briefcase className="md:h-5 md:w-5 h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium">
                    {exp.company} — {exp.position}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.startMonth} 〜 {exp.endMonth ?? "現在"}
                  </p>
                </div>
                {exp.description && <p className="text-sm">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
