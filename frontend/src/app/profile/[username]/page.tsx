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
import type { Portfolio } from "@/lib/types";

interface ProfileRow {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  first_name_kana: string;
  last_name_kana: string;
  image_url: string | null;
  education: string | null;
  socials: unknown; // JSONB
  experience: unknown; // JSONB
  qualifications: unknown; // JSONB
  projects: unknown; // JSONB
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params; // ← No need to await

  // 1) Query Supabase for a row with this username
  const { data: rawData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !rawData) {
    return notFound();
  }

  // 2) Cast rawData → ProfileRow
  const data = rawData as ProfileRow;

  // 3) Map to our Portfolio type
  const portfolio: Portfolio = {
    firstName: data.first_name,
    lastName: data.last_name,
    firstNameKana: data.first_name_kana,
    lastNameKana: data.last_name_kana,
    imageUrl: data.image_url || "",
    socials: Array.isArray(data.socials) ? data.socials : [],
    education: data.education || "",
    experience: Array.isArray(data.experience) ? data.experience : [],
    qualifications: Array.isArray(data.qualifications)
      ? data.qualifications
      : [],
    resumeUrl: data.resume_url || "",
    projects: Array.isArray(data.projects) ? data.projects : [],
  };

  // 4) Render the Portfolio
  return (
    <PageLayout>
      <div className="animate-in fade-in duration-500 2xl:mt-8 w-full pb-3 pt-2 max-w-5xl mx-auto">
        <div className="container mx-auto">
          <ProfileSection portfolio={portfolio} />
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">プロフィール</TabsTrigger>
              <TabsTrigger value="projects">プロジェクト</TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardContent>
                  <EducationSection education={portfolio.education} />
                  <Separator className="my-6" />
                  <ExperienceSection experience={portfolio.experience} />
                  <Separator className="my-6" />
                  <QualificationsSection
                    qualifications={portfolio.qualifications}
                  />
                  {portfolio.resumeUrl && (
                    <>
                      <Separator className="my-6" />
                      <ResumeSection resumeUrl={portfolio.resumeUrl} />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROJECTS TAB */}
            <TabsContent value="projects" className="mt-6">
              <ProjectsSection projects={portfolio.projects} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
