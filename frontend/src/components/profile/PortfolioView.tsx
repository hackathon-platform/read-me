'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { QualificationsSection } from '@/components/profile/QualificationsSection';
import { ResumeSection } from '@/components/profile/ResumeSection';
import { ProjectsSection } from '@/components/profile/ProjectsSection';
import { usePortfolioStore } from '@/lib/store';

export function PortfolioView() {
  const [mounted, setMounted] = useState(false);
  const { portfolio } = usePortfolioStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <ProfileSection portfolio={portfolio} />
      
      <div className="container max-w-6xl mx-auto py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardContent>
                <EducationSection education={portfolio?.education} />
                
                <Separator className="my-6" />
                
                <ExperienceSection experience={portfolio?.experience} />
                
                <Separator className="my-6" />
                
                <QualificationsSection qualifications={portfolio?.qualifications} />
                
                {portfolio?.resumeUrl && (
                  <>
                    <Separator className="my-6" />
                    <ResumeSection resumeUrl={portfolio.resumeUrl} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            <ProjectsSection projects={portfolio?.projects} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}