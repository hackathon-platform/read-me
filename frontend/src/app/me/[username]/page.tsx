import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Profile, Skill } from "@/lib/types";
import PageHeader from "@/components/layout/PageHeader";
import { ProfileContent } from "@/components/me/ProfileContent";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params;

  // Fetch profile row
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select()
    .eq("username", username)
    .single();
  if (profileError || !profileData) return notFound();

  // Fetch all related tables in parallel
  const [
    { data: socialData, error: socialError },
    { data: educationData, error: educationError },
    { data: experienceData, error: experienceError },
    { data: projectData, error: projectError },
    { data: qualificationData, error: qualificationError },
    { data: expSkillData = [], error: expSkillError },
  ] = await Promise.all([
    supabase.from("social").select().eq("profile_id", profileData.id),
    supabase.from("education").select().eq("profile_id", profileData.id),
    supabase.from("experience").select().eq("profile_id", profileData.id),
    supabase
      .from("project")
      .select(
        `
      *,
      project_media(*),
      project_skill(*)
    `,
      )
      .eq("profile_id", profileData.id)
      .order("created_at", { ascending: false }),
    supabase.from("qualification").select().eq("profile_id", profileData.id),
    supabase
      .from("experience_skill")
      .select(
        `
      *,
      experience!inner(id, profile_id)
    `,
      )
      .eq("experience.profile_id", profileData.id),
  ]);

  // (Optional) log any fetch errors
  [
    socialError,
    educationError,
    experienceError,
    projectError,
    qualificationError,
    expSkillError,
  ].forEach((err, i) => err && console.error(`Fetch error #${i}:`, err));

  // Group skills by experience_id
  const skillsByExp: Record<string, Skill[]> = {};
  (expSkillData ?? []).forEach((row: any) => {
    if (!skillsByExp[row.experience_id]) skillsByExp[row.experience_id] = [];
    skillsByExp[row.experience_id].push({
      name: row.name,
      type: row.type,
    });
  });

  // Build Profile model
  const profile: Profile = {
    id: profileData.id,
    username: profileData.username,
    firstName: profileData.first_name,
    lastName: profileData.last_name,
    firstNameKana: profileData.first_name_kana,
    lastNameKana: profileData.last_name_kana,
    imageUrl: profileData.image_url ?? "",
    description: profileData.description,
    resumeUrl: profileData.resume_url ?? "",
    socials: socialData ?? [],
    education: (educationData ?? []).map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      fieldOfStudy: edu.field_of_study,
      startMonth: edu.start_month.slice(0, 7),
      endMonth: edu.end_month?.slice(0, 7),
      description: edu.description,
    })),
    experiences: (experienceData ?? []).map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      organization: exp.organization,
      startMonth: exp.start_month.slice(0, 7),
      endMonth: exp.end_month?.slice(0, 7) ?? "現在",
      description: exp.description,
      iconUrl: exp.icon_url,
      url: exp.url,
      skills: skillsByExp[exp.id] ?? [],
    })),
    qualifications: (qualificationData ?? []).map((q: any) => ({
      id: q.id,
      name: q.name,
      acquisitionDate: q.acquisition_date.slice(0, 7),
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

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロフィール", href: "/me" },
          { label: username, current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 w-full">
        <div className="px-3 md:px-5">
          <ProfileContent profile={profile} />
        </div>
      </div>
    </>
  );
}
