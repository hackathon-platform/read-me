import PageLayout from "@/components/layout/pageLayout";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { QualificationsSection } from "@/components/profile/QualificationsSection";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { ProjectsSection } from "@/components/profile/ProjectsSection";
import type { Profile } from "@/lib/types";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params;

  // Fetch the profile
  const { data: profileData, error: profileDataError } = await supabase
    .from("profile")
    .select()
    .eq("username", username)
    .single();

  if (profileDataError || !profileData) {
    console.error("Profile fetch error:", profileDataError);
    return notFound();
  }

  const { data: eduData, error: eduError } = await supabase
    .from("education")
    .select()

  // Fetch socials, educations, experience, etc
  const [
    { data: socialData, error: socialError },
    { data: educationData, error: educationError },
    { data: experienceData, error: experienceError },
    { data: projectData, error: projectError },
    { data: qualificationData, error: qualificationError },
  ] = await Promise.all([
    supabase.from("social").select().eq("profile_id", profileData.id),
    supabase.from("education").select().eq("profile_id", profileData.id),
    supabase.from("experience").select().eq("profile_id", profileData.id),
    supabase.from("project").select().eq("profile_id", profileData.id),
    supabase.from("qualification").select().eq("profile_id", profileData.id),
  ]);
  console.log('profile.id', profileData.id)
  console.log('eduData', eduData);

  // check fetch error
  if (socialError) console.error("Socials fetch error:", socialError);
  if (educationError) console.error("Educations fetch error:", educationError);
  if (experienceError)
    console.error("Experience fetch error:", experienceError);
  if (projectError) console.error("Projects fetch error:", projectError);
  if (qualificationError)
    console.error("Qualifications fetch error:", qualificationError);

  // Build Profile object
  const profile: Profile = {
    id: profileData.id,
    username: profileData.username,
    firstName: profileData.first_name,
    lastName: profileData.last_name,
    firstNameKana: profileData.first_name_kana,
    lastNameKana: profileData.last_name_kana,
    imageUrl: profileData.image_url ?? "",
    description: profileData.description,
    socials: socialData ?? [],
    educations: educationData ?? [],
    experiences: experienceData ?? [],
    qualifications: qualificationData ?? [],
    resumeUrl: profileData.resume_url ?? "",
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
            <ExperienceSection experiences={profile.experiences} />
            <Separator className="my-6" />
            <EducationSection
              profileId={profile.id}
              educations={profile.educations}
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
    <PageLayout>
      <div className="animate-in fade-in duration-500 lg:mt-6 md:mt-2 max-w-7xl mx-auto w-full pb-3">
        {/* Mobile View */}
        <div className="lg:hidden">
          <ProfileSection profile={profile} />
          <div className="mt-4">
            <ProfileTabs />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <ProfileSection profile={profile} />
          </aside>
          <main className="flex-1">
            <ProfileTabs />
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
