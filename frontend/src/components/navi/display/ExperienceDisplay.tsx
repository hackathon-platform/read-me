import { TimelineDisplay } from "./TimelineDisplay";
import { Briefcase } from "lucide-react";
import { Experience } from "@/lib/types";

export function ExperienceDisplay({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <TimelineDisplay<Experience>
      items={experiences}
      heading="職歴"
      icon={<Briefcase className="h-4 w-4" />}
      getTitle={(w) => w.title}
      getSubtitle={(w) => w.organization}
      getStart={(w) => w.startMonth}
      getEnd={(w) => w.endMonth}
      getDescription={(w) => w.description}
    />
  );
}
