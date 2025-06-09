import { Education } from "@/lib/types";

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
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">学歴</h3>
        </div>
      {educations.map((edu) => (
        <div key={edu.id}>
          <h3 className="font-semibold">{edu.institution}</h3>
          <p className="text-sm text-muted-foreground">
            {edu.start_date} – {edu.end_date ?? "現在"}
            {edu.degree && ` ・${edu.degree}`}
            {edu.field_of_study && `（${edu.field_of_study}）`}
          </p>
          {edu.description && (
            <p className="mt-1 text-sm leading-relaxed">{edu.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
