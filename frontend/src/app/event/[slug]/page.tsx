import { notFound } from "next/navigation";
import PageHeader from "@/components/Layout/PageHeader";
import { supabase } from "@/lib/supabase/supabaseClient";
import {
  getEventBySlug,
  getParticipantsWithProfiles,
} from "@/lib/supabase/get/event";
import EventHeader from "@/components/event/EventHeader";
import EventBody from "@/components/event/EventBody";

// ISR
export const revalidate = 120;

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // fetch event
  const { data: eventData, error: eventError } = await getEventBySlug(
    supabase,
    slug,
  );
  if (eventError || !eventData) return notFound();

  // fetch participants + profiles
  const { data: participantData } = await getParticipantsWithProfiles(
    supabase,
    eventData.id,
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "イベント", href: "/event" },
          { label: eventData.slug, current: true },
        ]}
      />

      <div className="animate-in fade-in duration-500 md:mb-10 w-full">
        <EventHeader
          event={eventData}
          numOfParticipants={participantData.length}
        />
        <EventBody event={eventData} participants={participantData} />
      </div>
    </>
  );
}
