"use client";

import { useState } from "react";
import { EducationDisplay } from "./display/EducationDisplay";
import { EducationEdit } from "./edit/EducationEdit";
import { Education } from "@/lib/types";
import { EditIcon } from "lucide-react";

interface Props {
  profileId: string;
  educations: Education[];
}

export function EducationSection({ profileId, educations }: Props) {
  const [isEditingProfile, setEditingProfile] = useState(false);

  return (
    <div className="relative">
      {isEditingProfile ? (
        <EducationEdit
          profileId={profileId}
          initialData={educations}
          onSave={() => setEditingProfile(false)}
          onCancel={() => setEditingProfile(false)}
        />
      ) : (
        <>
          <EducationDisplay educations={educations} />
          <button
            className="absolute top-0.5 right-2"
            onClick={() => setEditingProfile(true)}
          >
            <EditIcon size={16} />
          </button>
        </>
      )}
    </div>
  );
}
