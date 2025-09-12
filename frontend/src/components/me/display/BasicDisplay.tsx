import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowCounts } from "@/components/follow/FollowCounts";
import { Github, Linkedin, Instagram, Facebook, Link } from "lucide-react";
import { Profile, Social } from "@/lib/types";
interface BasicDisplayProps {
  profile: Profile;
}

export default function BasicDisplay({ profile }: BasicDisplayProps) {
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
    <div className="relative py-2.5">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Avatar className="h-23 w-23 border-2 border-accent">
            <AvatarImage
              src={profile.imageUrl}
              alt={`${profile.lastName} ${profile.firstName}`}
            />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground tracking-wider">
                {profile.lastNameKana} {profile.firstNameKana}
              </p>
              <h2 className="text-2xl font-bold">
                {profile.lastName} {profile.firstName}
              </h2>
            </div>
            <div className="flex gap-1 items-center">
              <p className="font-semibold text-muted-foreground">
                @{profile.username}
              </p>
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
      {/* フォロー / フォロワー カウント（クリックでポップアップ） */}
      <div className="mt-2 px-1">
        <FollowCounts profileId={profile.id} />
      </div>
      {profile.description && (
        <p className="mt-2 px-1 text-sm whitespace-pre-wrap">
          {profile.description}
        </p>
      )}
    </div>
  );
}
