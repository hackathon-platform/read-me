import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getEventBasicBySlug,
  getParticipantsWithProfiles,
} from "@/lib/supabase/get/participants";
import { ParticipantsPane } from "@/components/event/ParticipantsPane";
import formatJPDate from "@/lib/utils/date";
import EventDeliverablesGallery from "@/components/event/EventDeliverablesGallery";
import MarkdownPreview from "@/components/markdown/MarkdownPreview";

// ISR
export const revalidate = 120;

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Next 15: params は await が必要
  const { slug } = await params;

  // 1) fetch event (server-side, cached by ISR)
  const event = await getEventBasicBySlug(supabase, slug);
  if (!event) return notFound();

  // 2) fetch participants + profiles
  const participants = await getParticipantsWithProfiles(supabase, event.id);

  const stats = {
    participants: participants.length,
    endAt: event.end_at ? formatJPDate(event.end_at) : null,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "イベント", href: "/event" },
          { label: event.slug, current: true },
        ]}
      />

      <div className="overflow-hidden border-b bg-card">
        {/* Banner */}
        {event.banner_url && (
          <div className="relative h-48">
            <img
              src={event.banner_url}
              alt={`${event.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta row under banner */}
        <div className="bg-popover px-4 py-3 border-b items-center">
          <h1 className="text-2xl font-semibold mr-auto">{event.name}</h1>
          <div className="flex flex-wrap gap-2 pt-2">
            {stats.endAt && (
              <Badge variant="secondary" className="gap-1">
                終了日: {stats.endAt}
              </Badge>
            )}
            <Badge variant="secondary">参加者 {stats.participants} 名</Badge>
            {event.website_url && (
              <Badge variant="outline" className="gap-1">
                <Link
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  公式サイト
                </Link>
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div>
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="sticky top-[56px] z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b rounded-none w-full justify-start px-2">
              <TabsTrigger value="about">概要</TabsTrigger>
              <TabsTrigger value="gallery">成果物ギャラリー</TabsTrigger>
              <TabsTrigger value="participant">参加者</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="p-4">
              {event.description || event.website_url || stats.endAt ? (
                <section className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="text-sm">
                      <div className="text-muted-foreground">終了日</div>
                      <div className="font-medium">
                        {stats.endAt ?? "未設定"}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">参加者</div>
                      <div className="font-medium">{stats.participants} 名</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">公式サイト</div>
                      <div className="font-medium">
                        {event.website_url ? (
                          <Link
                            className="underline underline-offset-4"
                            href={event.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.website_url}
                          </Link>
                        ) : (
                          "未設定"
                        )}
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <>
                      <MarkdownPreview content={event.description} />
                    </>
                  )}
                </section>
              ) : (
                <div className="text-sm text-muted-foreground py-6">
                  このイベントの概要情報はまだありません。
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="p-4">
              <div className="text-sm text-muted-foreground">
                <EventDeliverablesGallery
                  eventId={event.id}
                  eventSlug={event.slug}
                />
              </div>
              {/* TODO: gallery */}
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
        </div>
      </div>
    </div>
  );
}

// OGP / title
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await getEventBasicBySlug(supabase, slug);
  if (!data) return { title: "Event" };

  return {
    title: `${data.name} | Event`,
    description: data.description ?? undefined,
    openGraph: {
      title: data.name,
      description: data.description ?? undefined,
      images: data.banner_url ? [{ url: data.banner_url }] : undefined,
    },
  };
}
