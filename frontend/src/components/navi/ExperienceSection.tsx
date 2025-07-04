"use client";

import { useState } from "react";
import { ExperienceDisplay } from "./display/ExperienceDisplay";
import { ExperienceEdit } from "./edit/ExperienceEdit";
import { Experience } from "@/lib/types";
import { EditIcon } from "lucide-react";

interface Props {
  profileId: string;
  experiences: Experience[];
}

export function ExperienceSection({ profileId, experiences }: Props) {
  const [isEditingExperience, setEditingExperience] = useState(false);

  return (
    <div className="relative">
      {isEditingExperience ? (
        <ExperienceEdit
          profileId={profileId}
          initialData={experiences}
          onSave={() => setEditingExperience(false)}
          onCancel={() => setEditingExperience(false)}
        />
      ) : (
        <>
          <ExperienceDisplay experiences={experiences} />
          <button
            className="absolute top-0.5 right-2"
            onClick={() => setEditingExperience(true)}
          >
            <EditIcon size={16} />
          </button>
        </>
      )}
    </div>
  );
}
