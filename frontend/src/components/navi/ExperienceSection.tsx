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
  const [isEditing, setEditing] = useState(false);

  return (
    <div className="relative">
      {isEditing ? (
        <ExperienceEdit
          profileId={profileId}
          initialData={experiences}
          onSave={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <ExperienceDisplay experiences={experiences} />
          <button
            className="absolute top-2 right-2"
            onClick={() => setEditing(true)}
          >
            <EditIcon size={16} />
          </button>
        </>
      )}
    </div>
  );
}
