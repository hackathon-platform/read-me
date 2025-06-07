"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Link,
  PencilIcon,
} from "lucide-react";
import { Portfolio, Social } from "@/lib/types";
import NextLink from "next/link";

interface ProfileSectionProps {
  portfolio: Portfolio;
}

export function ProfileSection({ portfolio }: ProfileSectionProps) {
  const initials = portfolio.firstName[0] + portfolio.lastName[0];

  const getSocialIcon = (social: Social) => {
    switch (social.platform) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "other":
        return <Link className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden relative py-2.5">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage
                src={portfolio.imageUrl}
                alt={`${portfolio.lastName} ${portfolio.firstName}`}
              />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div className="flex flex-col gap-1 ml-1">
                <p className="text-sm text-muted-foreground tracking-wider">
                  {portfolio.lastNameKana} {portfolio.firstNameKana}
                </p>
                <h2 className="text-2xl font-bold">
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
                    title={
                      social.platform === "other"
                        ? social.label
                        : social.platform
                    }
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {getSocialIcon(social)}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full pt-2">
          <NextLink href="/profile/edit">
            <Button variant="outline" className="w-full gap-2">
              <PencilIcon className="h-4 w-4" />
              編集する
            </Button>
          </NextLink>
        </div>
      </div>

      {/* Desktop Layout (lg and up)*/}
      <div className="hidden lg:block max-w-sm">
        <div className="sticky top-4 bg-transparent">
          <div className="p-3">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Image */}
              <Avatar className="h-40 w-40 xl:h-44 xl:w-44 border-4 border-background">
                <AvatarImage
                  src={portfolio.imageUrl}
                  alt={`${portfolio.lastName} ${portfolio.firstName}`}
                />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground tracking-wider">
                  {portfolio.lastNameKana} {portfolio.firstNameKana}
                </p>
                <h2 className="text-2xl font-bold">
                  {portfolio.lastName} {portfolio.firstName}
                </h2>
              </div>

              {/* Social Icons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {portfolio.socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={
                      social.platform === "other"
                        ? social.label
                        : social.platform
                    }
                  >
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      {getSocialIcon(social)}
                    </Button>
                  </a>
                ))}
              </div>

              {/* Edit Button */}
              <div className="w-full pt-2">
                <NextLink href="/profile/edit">
                  <Button variant="outline" className="w-full gap-2">
                    <PencilIcon className="h-4 w-4" />
                    編集する
                  </Button>
                </NextLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
