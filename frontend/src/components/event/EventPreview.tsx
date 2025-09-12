import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import formatJPDate from "@/lib/utils/date";
import Link from "next/link";
import MarkdownPreview from "../markdown/MarkdownPreview";

export default function EventPreview(props: {
  name: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  websiteUrl: string | null;
  endAt: string | null; // datetime-local の文字列 or null
  participantsCount: number;
}) {
  const endAtJP = props.endAt ? formatJPDate(props.endAt) : null;

  return (
    <div className="overflow-hidden border bg-card rounded-md">
      {/* Banner */}
      {props.bannerUrl && (
        <div className="relative h-48">
          <img
            src={props.bannerUrl}
            alt={`${props.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Meta row under banner */}
      <div className="px-4 py-3 border-b">
        <h1 className="text-2xl font-semibold mr-auto">{props.name}</h1>
        <div className="flex flex-wrap gap-2 pt-2">
          {endAtJP && (
            <Badge variant="secondary" className="gap-1">
              終了日: {endAtJP}
            </Badge>
          )}
          <Badge variant="secondary">参加者 {props.participantsCount} 名</Badge>
          {props.websiteUrl && (
            <Badge variant="outline" className="gap-1">
              <Link
                href={props.websiteUrl}
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
          <TabsList className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b rounded-none w-full justify-start px-2">
            <TabsTrigger value="about">概要</TabsTrigger>
            <TabsTrigger value="gallery" disabled>
              成果物ギャラリー
            </TabsTrigger>
            <TabsTrigger value="participant" disabled>
              参加者
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="p-4">
            {props.description || props.websiteUrl || endAtJP ? (
              <section className="prose prose-sm dark:prose-invert max-w-none">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">終了日</div>
                    <div className="font-medium">{endAtJP ?? "未設定"}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">参加者</div>
                    <div className="font-medium">
                      {props.participantsCount} 名
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">公式サイト</div>
                    <div className="font-medium">
                      {props.websiteUrl ? (
                        <Link
                          className="underline underline-offset-4"
                          href={props.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {props.websiteUrl}
                        </Link>
                      ) : (
                        "未設定"
                      )}
                    </div>
                  </div>
                </div>

                {props.description && (
                  <>
                    <MarkdownPreview content={props.description} />
                  </>
                )}
              </section>
            ) : (
              <div className="text-sm text-muted-foreground py-6">
                このイベントの概要情報はまだありません。
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="p-4" />
          <TabsContent value="participant" className="p-4" />
        </Tabs>
      </div>
    </div>
  );
}
