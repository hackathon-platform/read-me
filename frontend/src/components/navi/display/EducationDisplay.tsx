import { TimelineDisplay } from "./TimelineDisplay";
import { GraduationCap } from "lucide-react";
import { Education } from "@/lib/types";

export function EducationDisplay({ educations }: { educations: Education[] }) {
  return (
    <TimelineDisplay<Education>
      items={educations}
      heading="学歴"
      icon={<GraduationCap className="h-4 w-4" />}
      getTitle={(e) => e.institution}
      getSubtitle={(e) => e.fieldOfStudy}
      getStart={(e) => e.startMonth}
      getEnd={(e) => e.endMonth}
      getDescription={(e) => e.description}
    />
  );
}
