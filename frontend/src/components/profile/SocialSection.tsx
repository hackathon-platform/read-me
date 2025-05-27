'use client';

import { Github, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Social } from '@/lib/types';
import { JSX } from 'react';

interface SocialSectionProps {
  socials: Social[];
}

export function SocialSection({ socials }: SocialSectionProps) {
  const socialIcons: Record<string, JSX.Element | null> = {
    github: <Github className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    other: null,
  };

  const socialNames: Record<string, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    facebook: 'Facebook',
    other: 'その他',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">ソーシャルメディア</h3>
      <div className="flex flex-wrap gap-2">
        {socials.map((social) => (
          <a 
            key={social.platform} 
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="transition-all hover:scale-105"
            >
              {socialIcons[social.platform]}
              <span className="ml-2">{socialNames[social.platform] || 'その他'}</span>
            </Button>
          </a>
        ))}
        {socials.length === 0 && (
          <p className="text-muted-foreground text-sm">ソーシャルメディアが設定されていません。</p>
        )}
      </div>
    </div>
  );
}