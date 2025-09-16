"use client";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicSection } from "./section/BasicSection";
import { EducationSection } from "./section/EducationSection";
import { ExperienceSection } from "./section/ExperienceSection";
import { QualificationSection } from "./section/QualificationSection";
import ProjectGallery from "@/components/me/section/ProjectGallery";
import { FollowRail } from "@/components/follow/FollowRail";
import { Profile } from "@/lib/types";

export function ProfileContent({ profile }: { profile: Profile }) {
  if (!profile) return notFound();

  return (
    <div className="space-y-4">
      <BasicSection profileId={profile.id} basic={profile.basic} />
      <div className="block lg:hidden mx-2">
        <FollowRail />
      </div>

      <Tabs defaultValue="projects" className="w-full pb-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="pt-2 space-y-4">
            <ProjectGallery projects={profile.projects} />
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
