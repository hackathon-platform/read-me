"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileContent } from "@/components/me/ProfileContent";
import type { Profile, Skill } from "@/lib/types";

type Props = { profileId?: string; username?: string };

export function ProfileLoader({ profileId, username }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    let active = true;

    async function fetchAll() {
      if (!profileId && !username) return;

      setLoading(true);
      try {
        // 1) Base profile
        const baseQ = supabase.from("profile").select().limit(1);

        const { data: profileRow, error: pErr } = profileId
          ? await baseQ.eq("id", profileId).single()
          : await baseQ.eq("username", username!).single();

        if (pErr || !profileRow) throw pErr || new Error("profile not found");
        const pid = profileRow.id as string;

        // 2) Parallel fetches
        const [
          { data: socialData },
          { data: educationData },
          { data: experienceData },
          { data: projectData },
          { data: qualificationData },
          { data: expSkillData = [] },
        ] = await Promise.all([
          supabase.from("social").select().eq("profile_id", pid),
          supabase.from("education").select().eq("profile_id", pid),
          supabase.from("experience").select().eq("profile_id", pid),
          supabase
            .from("project")
            .select(`*, project_media(*), project_skill(*)`)
            .eq("profile_id", pid)
            .order("created_at", { ascending: false }),
          supabase.from("qualification").select().eq("profile_id", pid),
          supabase
            .from("experience_skill")
            .select(`*, experience!inner(id, profile_id)`)
            .eq("experience.profile_id", pid),
        ]);

        // 3) Build skills map
        const skillsByExp: Record<string, Skill[]> = {};
        (expSkillData ?? []).forEach((row: any) => {
          if (!skillsByExp[row.experience_id])
            skillsByExp[row.experience_id] = [];
          skillsByExp[row.experience_id].push({
            name: row.name,
            type: row.type,
          });
        });

        // 4) Build Profile model
        const prof: Profile = {
          id: profileRow.id,
          username: profileRow.username,
          firstName: profileRow.first_name,
          lastName: profileRow.last_name,
          firstNameKana: profileRow.first_name_kana,
          lastNameKana: profileRow.last_name_kana,
          imageUrl: profileRow.image_url ?? "",
          description: profileRow.description,
          resumeUrl: profileRow.resume_url ?? "",
          socials: socialData ?? [],
          education: (educationData ?? []).map((edu: any) => ({
            id: edu.id,
            institution: edu.institution,
            fieldOfStudy: edu.field_of_study,
            startMonth: edu.start_month?.slice(0, 7),
            endMonth: edu.end_month?.slice(0, 7),
            description: edu.description,
          })),
          experiences: (experienceData ?? []).map((exp: any) => ({
            id: exp.id,
            title: exp.title,
            organization: exp.organization,
            startMonth: exp.start_month?.slice(0, 7),
            endMonth: exp.end_month?.slice(0, 7) ?? "現在",
            description: exp.description,
            iconUrl: exp.icon_url,
            url: exp.url,
            skills: skillsByExp[exp.id] ?? [],
          })),
          qualifications: (qualificationData ?? []).map((q: any) => ({
            id: q.id,
            name: q.name,
            acquisitionDate: q.acquisition_date?.slice(0, 7),
          })),
          projects: (projectData ?? []).map((proj: any) => ({
            id: proj.id,
            profileId: proj.profile_id,
            title: proj.title,
            description: proj.description,
            url: proj.url,
            media: proj.project_media || [],
            skills: proj.project_skill || [],
            createdAt: proj.created_at,
            updatedAt: proj.updated_at,
          })),
        };

        if (active) setProfile(prof);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      active = false;
    };
  }, [profileId, username]);

  if (!profileId && !username) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        対象のプロフィールが選択されていません。
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        プロフィールを読み込めませんでした。
      </div>
    );
  }

  return <ProfileContent profile={profile} />;
}
