'use client';
import PageLayout from "@/components/layout/pageLayout";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { PortfolioEditForm } from '@/components/profile/PortfolioEditForm';
import { Portfolio } from '@/lib/types';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  // Local state for loading/fetched profile
  const [initialPortfolio, setInitialPortfolio] = useState<Portfolio | null>(null);
  const [initialUsername, setInitialUsername] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1) If there’s no user (or still loading), redirect to /login or show a spinner
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login'); // or wherever your login page lives
    }
  }, [user, isLoading, router]);

  // 2) Once we have user, fetch their existing profile row (if any)
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row yet -> leave initialPortfolio as null, we’ll start with defaults
        setInitialPortfolio(null);
      } else if (error) {
        console.error('Error fetching profile:', error);
        setFetchError('プロフィールの読み込み中にエラーが発生しました。');
      } else if (data) {
        // Map to our Portfolio type
        const mapped: Portfolio = {
          firstName: data.first_name,
          lastName: data.last_name,
          firstNameKana: data.first_name_kana,
          lastNameKana: data.last_name_kana,
          imageUrl: data.image_url || '',
          socials: Array.isArray(data.socials) ? data.socials : [],
          education: data.education || '',
          experience: Array.isArray(data.experience) ? data.experience : [],
          qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
          resumeUrl: data.resume_url || '',
          projects: Array.isArray(data.projects) ? data.projects : [],
        };
        setInitialPortfolio(mapped);
        setInitialUsername(data.username);
      }
    }

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // 3) While fetching profile or user, show a loading state
  if (isLoading || (!initialPortfolio && user // we only know “no row” after fetching
  )) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中…</p>
        </div>
      </PageLayout>
    );
  }

  // 4) If there was an error fetching, show it
  if (fetchError) {
    return <div className="text-red-600 text-center py-20">{fetchError}</div>;
  }

  // 5) Render the edit form, passing down the “initialPortfolio” and “initialUsername” so the form is pre-filled
  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-4 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-12 w-12" />
              </Button>
            </Link>
            <h1 className="md:text-2xl text-lg font-bold tracking-tight">プロフィールを編集</h1>
          </div>
        </div>
        
        <PortfolioEditForm
          initialPortfolio={initialPortfolio}
          initialUsername={initialUsername}
          userId={user!.id}
        />
      </div>
    </PageLayout>
  );
}
