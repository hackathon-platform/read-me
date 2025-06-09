"use client";

import { useState } from "react";
import { EducationDisplay } from "./display/EducationDisplay";
import { EducationEdit } from "./edit/EducationEdit";
import { Education } from "@/lib/types";
import { EditIcon } from "lucide-react";

interface Props {
  profileId: string;
  education: Education[];
}

export function EducationSection({ profileId, education }: Props) {
  const [isEditingProfile, setEditingProfile] = useState(false);

  return (
    <div className="relative">
      {isEditingProfile ? (
        <EducationEdit
          profileId={profileId}
          initialData={education}
          onSave={() => setEditingProfile(false)}
          onCancel={() => setEditingProfile(false)}
        />
      ) : (
        <>
          <EducationDisplay education={education} />
          <button
            className="absolute top-2 right-2"
            onClick={() => setEditingProfile(true)}
          >
            <EditIcon size={16} />
          </button>
        </>
      )}
    </div>
  );
}
