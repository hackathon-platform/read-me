"use client";

import { useState } from "react";
import ProfileDisplay from "./display/ProfileDisplay";
import { ProfileEdit } from "./edit/ProfileEdit";
import { Profile } from "@/lib/types";
import { EditIcon } from "lucide-react";

interface ProfileSectionProps {
  profile: Profile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [isEditingProfile, setEditingProfile] = useState(false);

  return (
    <div>
      {isEditingProfile ? (
        <ProfileEdit
          initialData={profile}
          onSave={() => setEditingProfile(false)}
          onCancel={() => setEditingProfile(false)}
        />
      ) : (
        <>
          <ProfileDisplay profile={profile} />
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
