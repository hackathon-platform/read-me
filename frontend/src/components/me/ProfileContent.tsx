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

type Props = {
  profile: Profile;
  /** Force mobile layout even on large screens */
  isCompact?: boolean;
};

export function ProfileContent({ profile, isCompact = false }: Props) {
  if (!profile) return notFound();

  const gridClasses = isCompact ? "grid grid-cols-1" : "grid lg:grid-cols-12";
  const leftColClasses = isCompact
    ? "col-span-12 space-y-4 p-4"
    : "space-y-4 lg:col-span-4 m-4";
  const rightColClasses = isCompact ? "col-span-12" : "lg:col-span-8";

  return (
    <div className="w-full" data-compact={isCompact ? "true" : "false"}>
      <div className={gridClasses}>
        {/* Left column — Basic + Follow */}
        <div className={leftColClasses}>
          <BasicSection profileId={profile.id} basic={profile.basic} isCompact={isCompact} />
          {!isCompact && <FollowRail />}
        </div>

        {/* Right column — Tabs */}
        <div className={rightColClasses}>
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
