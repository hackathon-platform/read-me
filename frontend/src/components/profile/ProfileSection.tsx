'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Instagram, Facebook, PencilIcon } from 'lucide-react';
import { Portfolio, Social } from '@/lib/types';
import Link from 'next/link';

interface ProfileSectionProps {
  portfolio: Portfolio;
}

export function ProfileSection({ portfolio }: ProfileSectionProps) {
  const initials = portfolio.firstName[0] + portfolio.lastName[0];

  const socialIcons = {
    github: <Github className="h-4 w-4" />,
    linkedin: <Linkedin className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
  };

  return (
    <div className="relative lg:mt-5">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={portfolio.imageUrl} alt={`${portfolio.lastName} ${portfolio.firstName}`} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="mb-4 space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground tracking-wider">
                  {portfolio.lastNameKana} {portfolio.firstNameKana}
                </p>
                <h2 className="text-3xl font-bold">
                  {portfolio.lastName} {portfolio.firstName}
                </h2>
              </div>
              
              <div className="flex gap-2">
                {portfolio.socials.map((social) => (
                  <a 
                    key={social.platform} 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      {socialIcons[social.platform]}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <Link href="/profile/edit">
            <Button variant="outline" className="gap-2">
              <PencilIcon className="h-4 w-4" />
              編集する
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}