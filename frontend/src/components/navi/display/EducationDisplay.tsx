import { Education } from "@/lib/types";
import { GraduationCap } from "lucide-react";

export function EducationDisplay({ educations }: { educations: Education[] }) {
  if (!educations.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">学歴</h3>
        <p className="text-sm text-muted-foreground">
          学歴が登録されていません。
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">学歴</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute md:left-5 left-4 top-2 bottom-2 md:w-[4px] w-[3px] bg-border" />

        <div className="space-y-8">
          {educations.map((edu) => (
            <div key={edu.id} className="flex items-start gap-6">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className="md:w-11 md:h-11 w-9 h-9 rounded-lg bg-card overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <GraduationCap className="md:h-5 md:w-5 h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium">{edu.institution}</h4>
                  <p className="text-sm text-muted-foreground">
                    {edu.degree && `${edu.degree}`}
                    {edu.fieldOfStudy && `（${edu.fieldOfStudy}）`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startMonth} 〜 {edu.endMonth ?? "現在"}
                  </p>
                </div>
                {edu.description && (
                  <p className="text-sm">{edu.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
