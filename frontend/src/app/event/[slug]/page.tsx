// frontend/src/app/event/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Globe2, Mail, ExternalLink } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// ISR（必要なければ削除）
export const revalidate = 120;

type EventRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  website: string | null;
  email: string | null;
  created_at: string | null;
  end_at: string | null;
};

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data, error } = await supabase
    .from("event")
    .select(
      "id,name,slug,description,banner_url,website,email,created_at,end_at"
    )
    .eq("slug", slug)
    .single<EventRow>();
  
  console.log('event id', data?.id)
  if (error || !data) return notFound();

  const { data: participantData, error: participantError } = await supabase
    .from("participant")
    .select(
      "profile_id,event_id,role"
    )
    .eq("event_id", data.id);

  const endAtJP =
    data.end_at
      ? new Date(data.end_at).toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo",
          hour12: false,
        })
      : null;

  console.log('participantData', participantData)
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "イベント", href: "/event" },
          { label: data.name, current: true },
        ]}
      />

      {/* Hero */}
      <div className="overflow-hidden border bg-card">
        <div className="relative h-48">
          {data.banner_url ? (
            <img
              src={data.banner_url}
              alt={`${data.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
          )}

          {/* タイトルオーバーレイ */}
          <div className="absolute bottom-3 left-4 right-4">
            <h1 className="text-2xl font-semibold ">
              {data.name}
            </h1>
            {/* <p className="text-xs text-muted-foreground">/event/{data.slug}</p> */}
            {data.website && (
              <Badge variant="outline" className="gap-1">
                <Globe2 className="w-3.5 h-3.5" />
                <Link
                  href={data.website}
                  target="_blank"
                >
                  公式サイト
                </Link>
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div>
          {/* メタ情報 */}
          {/* <div className="flex flex-wrap items-center gap-2">
            {endAtJP && (
              <Badge variant="secondary" className="gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                受付終了: {endAtJP}
              </Badge>
            )}
          </div> */}

          <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">概要</TabsTrigger>
            <TabsTrigger value="gallary">成果物ギャラリー</TabsTrigger>
            <TabsTrigger value="participant">参加者</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            {/* 概要 */}
            {data.description && (
              <section className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="mb-2">概要</h2>
                <p className="whitespace-pre-wrap">{data.description}</p>
              </section>
            )}
          </TabsContent>
          <TabsContent value="gallary">
          </TabsContent>
          <TabsContent value="participant">
            {participantData?.[0]?.profile_id ?? "No profile"}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}

// （任意）OGP/タイトル
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { data } = await supabase
    .from("event")
    .select("name,description,banner_url")
    .eq("slug", params.slug)
    .single();

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
