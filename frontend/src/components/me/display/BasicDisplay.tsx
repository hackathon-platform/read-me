import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowCounts } from "@/components/follow/FollowCounts";
import { getSocialIcon } from "@/components/common/SocialIcon";
import { Basic } from "@/lib/types";

interface BasicDisplayProps {
  profileId: string;
  basic: Basic;
}

export default function BasicDisplay({ profileId, basic }: BasicDisplayProps) {
  const initials = basic.lastName[0];

  return (
    <div className="relative py-2.5">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Avatar className="h-23 w-23 border-2 border-accent">
            <AvatarImage
              src={basic.imageUrl}
              alt={`${basic.lastName} ${basic.firstName}`}
            />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground tracking-wider">
                {basic.lastNameKana} {basic.firstNameKana}
              </p>
              <h2 className="text-2xl font-bold">
                {basic.lastName} {basic.firstName}
              </h2>
            </div>
            <div className="flex gap-1 items-center">
              <p className="font-semibold text-muted-foreground">
                @{basic.username}
              </p>
              {basic.socials.map((social, index) => (
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
        <FollowCounts profileId={profileId} />
      </div>
      {basic.description && (
        <p className="mt-2 px-1 text-sm whitespace-pre-wrap">
          {basic.description}
        </p>
      )}
    </div>
  );
}
