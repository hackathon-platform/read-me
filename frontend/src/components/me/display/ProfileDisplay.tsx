import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Github, Linkedin, Instagram, Facebook, Link } from "lucide-react";
import { Profile, Social } from "@/lib/types";
interface ProfileSectionProps {
  profile: Profile;
}

export default function ProfileDisplay({ profile }: ProfileSectionProps) {
  const initials = profile.lastName[0];
  console.log("profile", profile);
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
        <div className="flex justify-between">
          <div className="flex gap-6">
            <Avatar className="h-32 w-32 border-2 border-accent">
              <AvatarImage
                src={profile.imageUrl}
                alt={`${profile.lastName} ${profile.firstName}`}
              />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="mt-1 flex flex-col gap-0.5">
                <p className="text-sm text-muted-foreground tracking-wider">
                  {profile.lastNameKana} {profile.firstNameKana}
                </p>
                <h2 className="text-2xl font-bold">
                  {profile.lastName} {profile.firstName}
                </h2>
              </div>
              <div className="font-semibold text-muted-foreground">
                {profile.username}
              </div>
              <div className="flex gap-1">
                {profile.socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
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
        {profile.description && (
          <p className="mt-2 px-1 text-sm leading-relaxed break-words">
            {profile.description}
          </p>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-sm">
        <div className="flex flex-col p-3 text-center items-center space-y-2">
          <Avatar className="h-44 w-44 border-2 border-accent">
            <AvatarImage
              src={profile.imageUrl}
              alt={`${profile.lastName} ${profile.firstName}`}
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground tracking-wider">
              {profile.lastNameKana} {profile.firstNameKana}
            </p>
            <h2 className="text-2xl font-bold">
              {profile.lastName} {profile.firstName}
            </h2>
          </div>
          <div className="font-semibold text-muted-foreground">
            {profile.username}
          </div>
          <div className="gap-2">
            {profile.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {getSocialIcon(social)}
                </Button>
              </a>
            ))}
          </div>
          {profile.description && (
            <p className="px-1 text-sm leading-relaxed break-words">
              {profile.description}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
