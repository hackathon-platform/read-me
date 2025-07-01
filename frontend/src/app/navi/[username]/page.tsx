import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/navi/ProfileSection";
import { EducationSection } from "@/components/navi/EducationSection";
import { ExperienceSection } from "@/components/navi/ExperienceSection";
import { QualificationsSection } from "@/components/navi/QualificationsSection";
import { ResumeSection } from "@/components/navi/ResumeSection";
import { ProjectsSection } from "@/components/navi/ProjectsSection";
import type { Profile, Skill } from "@/lib/types";
import PageHeader from "@/components/layout/PageHeader";

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
    supabase.from("project").select().eq("profile_id", profileData.id),
    supabase.from("qualification").select().eq("profile_id", profileData.id),
    supabase.from("experience_skill").select().eq("profile_id", profileData.id),
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
    education: (educationData ?? []).map((e: any) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.field_of_study,
      startMonth: e.start_month.slice(0, 7),
      endMonth: e.end_month?.slice(0, 7),
      description: e.description,
    })),
    experiences: (experienceData ?? []).map((exp: any) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startMonth: exp.start_month.slice(0, 7),
      endMonth: exp.end_month?.slice(0, 7) ?? "現在",
      description: exp.description,
      iconUrl: exp.icon_url,
      url: exp.url,
      skills: skillsByExp[exp.id] ?? [],
    })),
    qualifications: qualificationData ?? [],
    projects: projectData ?? [],
  };

  const ProfileTabs = () => (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="profile">プロフィール</TabsTrigger>
        <TabsTrigger value="projects">プロジェクト</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <Card>
          <CardContent>
            <ExperienceSection
              profileId={profile.id}
              experiences={profile.experiences}
            />
            <Separator className="my-6" />
            <EducationSection
              profileId={profile.id}
              educations={profile.education}
            />
            <Separator className="my-6" />
            <QualificationsSection qualifications={profile.qualifications} />
            {profile.resumeUrl && (
              <>
                <Separator className="my-6" />
                <ResumeSection resumeUrl={profile.resumeUrl} />
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsSection projects={profile.projects} />
      </TabsContent>
    </Tabs>
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "プロファイル", href: "/navi" },
          { label: username, current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3">
        {/* Mobile */}
        <div className="lg:hidden">
          <ProfileSection profile={profile} />
          <ProfileTabs />
        </div>
        {/* Desktop */}
        <div className="hidden lg:flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <ProfileSection profile={profile} />
          </aside>
          <main className="flex-1">
            <ProfileTabs />
          </main>
        </div>
      </div>
    </div>
  );
}
