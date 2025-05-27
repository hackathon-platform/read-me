'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Instagram, Facebook, Link, PencilIcon } from 'lucide-react';
import { Portfolio, Social } from '@/lib/types';
import NextLink from 'next/link';

interface ProfileSectionProps {
  portfolio: Portfolio;
}

export function ProfileSection({ portfolio }: ProfileSectionProps) {
  const initials = portfolio.firstName[0] + portfolio.lastName[0];

  const getSocialIcon = (social: Social) => {
    switch (social.platform) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'other': return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-end justify-between">
          <div className="flex items-end md:gap-6 gap-4">
            <Avatar className="md:h-32 md:w-32 h-28 w-28 border-4 border-background">
              <AvatarImage src={portfolio.imageUrl} alt={`${portfolio.lastName} ${portfolio.firstName}`} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="md:mb-2 space-y-4">
              <div className="flex flex-col gap-1 ml-1">
                <p className="text-sm text-muted-foreground tracking-wider">
                  {portfolio.lastNameKana} {portfolio.firstNameKana}
                </p>
                <h2 className="md:text-3xl text-2xl font-bold">
                  {portfolio.lastName} {portfolio.firstName}
                </h2>
              </div>
              
              <div className="flex gap-2">
                {portfolio.socials.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform === 'other' ? social.label : social.platform}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      {getSocialIcon(social)}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className='hidden lg:block'>
            <NextLink href="/profile/edit">
              <Button variant="outline" className="gap-2">
                <PencilIcon className="h-4 w-4" />
                編集する
              </Button>
            </NextLink>
          </div>
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <NextLink href="/profile/edit">
              <Button variant="default" className="gap-2">
                <PencilIcon className="h-4 w-4" />
                編集する
              </Button>
            </NextLink>
          </div>
        </div>
      </div>
    </div>
  );
}