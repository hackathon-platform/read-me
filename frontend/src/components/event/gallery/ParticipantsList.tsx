"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import type { ParticipantWithProfile } from "@/lib/types";

export default function ParticipantsList({
  participants,
}: {
  participants: ParticipantWithProfile[];
}) {
  if (!participants || participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">参加者情報がありません。</p>
    );
  }
  return (
    <div className="space-y-2">
      {participants.map((p) => {
        const prof = p.profile;
        const name =
          prof.username ||
          `${prof.firstName ?? ""} ${prof.lastName ?? ""}`.trim() ||
          "匿名";
        const initials =
          (prof.lastName?.[0] ?? "") + (prof.firstName?.[0] ?? "");
        return (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-lg border p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={prof.imageUrl ?? undefined}
                alt={prof.username ?? ""}
              />
              <AvatarFallback>
                {(initials || name.slice(0, 2)).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{p.role}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={
                  prof.username ? `/u/${prof.username}` : `/profiles/${prof.id}`
                }
                aria-label={`${name}を開く`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
