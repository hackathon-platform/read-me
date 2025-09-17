import { ParticipantsPane } from "@/components/event/participant/ParticipantsPane";
import EventDeliverablesGallery from "@/components/event/gallery/EventDeliverablesGallery";
import MarkdownPreview from "@/components/markdown/MarkdownPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event, ParticipantWithProfile } from "@/lib/types";

type EventBodyProps = {
  event: Event;
  participants: ParticipantWithProfile[];
};

export default function EventBody({ event, participants }: EventBodyProps) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-none w-full justify-start">
        <TabsTrigger value="about">概要</TabsTrigger>
        <TabsTrigger value="gallery">成果物ギャラリー</TabsTrigger>
        <TabsTrigger value="participant">参加者</TabsTrigger>
      </TabsList>

      <TabsContent value="about" className="p-4">
        {event.description ? (
          <MarkdownPreview content={event.description} />
        ) : (
          <div className="text-sm text-muted-foreground py-6">
            このイベントの概要情報はまだありません。
          </div>
        )}
      </TabsContent>

      <TabsContent value="gallery" className="p-4">
        <div className="text-sm text-muted-foreground">
          <EventDeliverablesGallery eventId={event.id} eventSlug={event.slug} />
        </div>
      </TabsContent>

      <TabsContent value="participant" className="p-0">
        {participants.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">
            参加者がまだいません
          </div>
        ) : (
          <ParticipantsPane participants={participants} />
        )}
      </TabsContent>
    </Tabs>
  );
}
