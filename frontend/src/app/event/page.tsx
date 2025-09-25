import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Plus } from "lucide-react";
import PageHeader from "@/components/Layout/PageHeader";

export const revalidate = 120;

type EventRow = {
  id: string;
  name: string;
  slug: string;
  created_at?: string | null;
  banner_url?: string | null;
};

export default async function EventIndex() {
  const { data: events, count } = await supabase
    .from("event")
    .select("id,name,slug,created_at,banner_url", { count: "exact" })
    .order("created_at", { ascending: false, nullsFirst: false })
    .returns<EventRow[]>();

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "イベント", current: true }]} />
      <div className="mx-auto w-full max-w-6xl px-3 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">イベント一覧</h1>
            <p className="text-sm text-muted-foreground">
              全てのイベントを確認できます。
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/event/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規イベント作成
              </Button>
            </Link>
          </div>
        </div>

        {/* Count */}
        <div className="mb-3 text-xs text-muted-foreground">
          {typeof count === "number" ? `${count} 件のイベント` : "イベント"}
        </div>

        {/* Grid */}
        {events && events.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/event/${e.slug}`}
                  className={cn(
                    "group block overflow-hidden rounded-xl border bg-card transition-all",
                    "hover:shadow-md hover:border-foreground/20",
                  )}
                >
                  {/* Header: image if exists, else gradient */}
                  <div className="relative h-28 overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{ background: gradientFor(e.slug || e.name) }}
                      aria-hidden
                    />
                    {e.banner_url ? (
                      <Image
                        src={e.banner_url}
                        alt={`${e.name} banner`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={false}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.12))]" />
                    <div className="absolute right-3 top-3">
                      <Badge variant="secondary" className="rounded-full">
                        /event/{e.slug}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="line-clamp-2 text-base font-semibold leading-snug">
                        {e.name}
                      </h2>
                      {isNew(e.created_at) && (
                        <Badge className="shrink-0">NEW</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatJPDate(e.created_at) ?? "作成日 不明"}</span>
                    </div>

                    <div className="pt-1">
                      <div className="h-px w-full bg-border/60" />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-sm">
                      <span className="text-muted-foreground">
                        詳細ページへ
                      </span>
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

/* ---------------- helpers ---------------- */

function gradientFor(seed: string) {
  const h1 = ((hashCode(seed) % 360) + 360) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 60%) 0%, hsl(${h2} 70% 55%) 100%)`;
}
function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
function isNew(created?: string | null) {
  if (!created) return false;
  const d = new Date(created).getTime();
  if (Number.isNaN(d)) return false;
  return (Date.now() - d) / 86_400_000 <= 2; // 2 days
}
function formatJPDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}
function EmptyState() {
  return (
    <div className="mt-10 rounded-xl border p-10 text-center">
      <p className="text-sm text-muted-foreground">
        まだイベントがありません。
      </p>
      <div className="mt-4">
        <Link href="/event/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            イベントを作成
          </Button>
        </Link>
      </div>
    </div>
  );
}
