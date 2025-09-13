import PageHeader from '@/components/layout/PageHeader';
import EventsHeroCarousel from '@/components/event/EventsHeroCarousel'; // ← クライアントのカルーセル
import { supabase } from '@/lib/supabase/supabaseClient';
import Link from 'next/link';
import { ImageOff } from "lucide-react";
export const revalidate = 120;

type EventRow = {
  id: string | number;
  name: string | null;
  slug: string;
  banner_url: string | null;
};

type ProjectRow = {
  id: string | number;
  title: string | null;
  summary: string | null;
  thumbnail_url: string | null;
  event_slug: string | null;
  updated_at: string | null;
};

export default async function Page() {
  // 2テーブルを同時に取得
  const [
    { data: eventRows, error: eventsError },
    { data: projectRows, error: projectsError },
  ] = await Promise.all([
    supabase
      .from('event')
      .select('id, name, slug, banner_url')
      .order('id', { ascending: true }) // created_at が無い環境でも安全
      .limit(6),
    supabase
      .from('project')
      .select('id, title, summary, thumbnail_url, event_slug, updated_at')
      .order('updated_at', { ascending: false })
      .limit(6),
  ]);

  if (eventsError || projectsError) {
    console.error('[fetch error]', { eventsError, projectsError });
  }

  // カルーセル用スライド（画像のみ）
  const slides =
    (eventRows as EventRow[] | null)?.filter((e) => !!e.banner_url).map((e) => ({
      id: e.id,
      src: e.banner_url as string,
      alt: e.name ?? '',
      slug: e.slug,
      name: e.name ?? '',
    })) ?? [];

  const projects =
    (projectRows as ProjectRow[] | null)?.map((p) => ({
      id: p.id,
      title: p.title ?? '無題プロジェクト',
      subtitle: p.summary ?? '',
      // サムネが無ければプレースホルダー
      image: p.thumbnail_url,
      // プロジェクト詳細ページのURL（例：/project/:id）
      href: `/project/${p.id}`,
      // イベントページへ飛ばしたいなら: href: `/event/${p.event_slug}`
    })) ?? [];

  return (
    <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 w-full">
      {/* イベントのカルーセル */}
      <div className="relative max-w-7xl mx-auto w-full pb-3 pl-1">
        <h1 className="font-bold md:text-2xl">現在開催中のイベント</h1>
      </div>
      <EventsHeroCarousel
        slides={slides.map((s) => ({ id: s.id, src: s.src, alt: s.alt, name:s.name, slug:s.slug }))}
      />

      {/* プロジェクト 3×2 */}
      <div className="relative max-w-7xl mx-auto w-full pb-3 pl-1">
        <h1 className="font-bold py-3 md:text-2xl">
          プロジェクト
        </h1>
      </div>
      <section className="md:mx-auto max-w-7xl">
        <div className="-mx-3 flex flex-wrap">
          {projects.map((p) => (
            <div key={p.id} className=" px-3 mb-6 md:w-1/2 lg:w-1/3">
              <Link href={p.href} className="block h-48 mx-8 md:mx-auto md:h-auto">
                <article className="h-full flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md transition">
                    {p.image?(
                      <div className="aspect-[16/9] overflow-hidden rounded-t-xl">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ):(
                      <div className="h-full w-full place-items-center text-muted-foreground">
                        <ImageOff className="w-6 h-6" />
                      </div>
                    )}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold leading-tight">{p.title}</h3>
                    {p.subtitle && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {p.subtitle}
                      </p>
                    )}

                    <div className="mt-auto pt-3 text-right text-xs text-muted-foreground">
                      詳細を見る →
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
