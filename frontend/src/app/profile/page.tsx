import PageLayout from "@/components/layout/pageLayout";
import { PortfolioView } from '@/components/profile/PortfolioView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';

export default function Home() {
  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <PortfolioView />
      </div>
      </PageLayout>
  );
}