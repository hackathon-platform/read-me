import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowCounts } from "@/components/follow/FollowCounts";
import { getSocialIcon } from "@/components/common/SocialIcon";
import type { Basic } from "@/lib/types";

interface BasicDisplayProps {
  profileId: string;
  basic: Basic;
  /** Force mobile layout even on large screens */
  isCompact?: boolean;
}

export default function BasicDisplay({
  profileId,
  basic,
  isCompact = false,
}: BasicDisplayProps) {
  const initials = (basic.lastName?.[0] ?? "") + (basic.firstName?.[0] ?? "");

  return (
    <div className="relative" data-compact={isCompact ? "true" : "false"}>
      {/* base: 横並び / lg↑: 縦並び（isCompact=true なら lg の変更を無効化） */}
      <div
        className={`flex items-start gap-4 ${
          isCompact ? "" : "lg:flex-col lg:items-center lg:pt-4"
        }`}
      >
        {/* Avatar */}
        <Avatar
          className={`h-24 w-24 shrink-0 border-2 border-accent ${
            isCompact ? "" : "lg:h-40 lg:w-40 lg:mx-auto"
          }`}
        >
          <AvatarImage
            src={basic.imageUrl || undefined}
            alt={`${basic.lastName} ${basic.firstName}`}
          />
          <AvatarFallback className="text-xl">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>

        {/* テキスト群（isCompact=true で中央寄せを抑止） */}
        <div className={`min-w-0 ${isCompact ? "" : "lg:mt-3 lg:text-center"}`}>
          <div className="mt-1 flex flex-col gap-1">
            {/* カナ */}
            <p className="text-xs tracking-wider text-muted-foreground">
              {basic.lastNameKana} {basic.firstNameKana}
            </p>
            {/* 氏名 */}
            <h2 className="text-2xl font-bold leading-tight">
              {basic.lastName} {basic.firstName}
            </h2>
          </div>

          {/* ユーザー名 + ソーシャル */}
          <div
            className={`mt-1 flex flex-wrap items-center gap-1 ${
              isCompact ? "" : "lg:justify-center"
            }`}
          >
            <span className="font-medium text-muted-foreground">
              @{basic.username}
            </span>

            {basic.socials?.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {getSocialIcon(social)}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 自己紹介 */}
      {basic.description && (
        <p className={`mt-3 whitespace-pre-wrap ${isCompact ? "" : "lg:text-center"}`}>
          {basic.description}
        </p>
      )}

      {/* フォロー / フォロワー */}
      <div className={`mt-3 ${isCompact ? "" : "lg:flex lg:justify-center"}`}>
        <FollowCounts profileId={profileId} />
      </div>
    </div>
  );
}
