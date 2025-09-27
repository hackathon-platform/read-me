import Link from "next/link";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import formatJPDateLocal from "@/lib/utils/date";

type EventHeaderProps = {
  event: Event;
  numOfParticipants: number;
};

export default function EventHeader({
  event,
  numOfParticipants,
}: EventHeaderProps) {
  return (
    <>
      {/* Banner */}
      {event.bannerUrl && (
        <img
          src={event.bannerUrl}
          alt={`${event.name} banner`}
          className="aspect-[13/3] object-cover w-full max-h-80"
        />
      )}

      {/* Meta row under banner */}
      <div className="bg-popover px-4 py-3 border-b items-center">
        <h1 className="text-2xl font-semibold mr-auto">{event.name}</h1>
        <div className="flex flex-wrap gap-2 pt-2">
          {event.endAt && (
            <Badge variant="secondary" className="gap-1">
              終了日時: {formatJPDateLocal(event.endAt)}
            </Badge>
          )}
          <Badge variant="secondary">参加者 {numOfParticipants} 名</Badge>
          {event.websiteUrl && (
            <Badge variant="outline" className="gap-1">
              <Link
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                公式サイト
              </Link>
            </Badge>
          )}
        </div>
      </div>
    </>
  );
}
