'use client';

import PageLayout from "@/components/layout/pageLayout";
import { PortfolioEditForm } from '@/components/profile/PortfolioEditForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EditPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">ポートフォリオを編集</h1>
          </div>
        </div>
        
        <PortfolioEditForm />
      </div>
    </PageLayout>
  );
}