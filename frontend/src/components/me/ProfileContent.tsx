"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicSection } from "./section/BasicSection";
import { EducationSection } from "./section/EducationSection";
import { ExperienceSection } from "./section/ExperienceSection";
import { QualificationSection } from "./section/QualificationSection";
import { ResumeSection } from "./ResumeSection";
import { ProjectsSection } from "./section/ProjectsSection";
import type { Profile } from "@/lib/types";

export function ProfileContent({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      <BasicSection profile={profile} />

      <Tabs defaultValue="projects" className="w-full pb-2">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="pt-2 space-y-4">
            <ProjectsSection
              profileId={profile.id}
              projects={profile.projects}
            />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="space-y-4">
            <ExperienceSection
              profileId={profile.id}
              experiences={profile.experiences}
            />
            <EducationSection
              profileId={profile.id}
              educations={profile.education}
            />
            <QualificationSection
              profileId={profile.id}
              qualifications={profile.qualifications}
            />
            {profile.resumeUrl && (
              <>
                <Separator className="my-6" />
                <ResumeSection resumeUrl={profile.resumeUrl} />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
