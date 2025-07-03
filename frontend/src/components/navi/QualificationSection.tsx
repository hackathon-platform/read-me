"use client";

import { useState } from "react";
import { QualificationEdit } from "./edit/QualificationEdit";
import { QualificationDisplay } from "./display/QualificationDisplay";
import { Qualification } from "@/lib/types";
import { EditIcon } from "lucide-react";

interface Props {
  profileId: string;
  qualifications: Qualification[];
}

export function QualificationSection({ profileId, qualifications }: Props) {
  const [isEditingProfile, setEditingProfile] = useState(false);

  return (
    <div className="relative">
      {isEditingProfile ? (
        <QualificationEdit
          profileId={profileId}
          initialData={qualifications}
          onSave={() => setEditingProfile(false)}
          onCancel={() => setEditingProfile(false)}
        />
      ) : (
        <>
          <QualificationDisplay qualifications={qualifications} />
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