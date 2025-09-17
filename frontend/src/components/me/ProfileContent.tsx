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
    <div className="w-full">
      {/* Mobile: 1 col (stacks); Desktop: 12-col grid */}
      <div className="grid lg:grid-cols-12">
        {/* Left column (md: span 4) — Basic + Follow */}
        <div className="space-y-4 lg:col-span-4 m-4">
          <BasicSection profileId={profile.id} basic={profile.basic} />
          <FollowRail />
        </div>

        {/* Right column (md: span 8) — Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">プロジェクト</TabsTrigger>
              <TabsTrigger value="profile">プロフィール</TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <div className="space-y-4 pt-2">
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
      </div>
    </div>
  );
}
