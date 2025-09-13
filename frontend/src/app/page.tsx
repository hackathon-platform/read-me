"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Rocket, Users, Eye, ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <div className="relative">
      {/* ===== Background ornaments ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-purple-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/25 to-emerald-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-[40rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,.15),transparent_60%)]" />
      </div>

      {/* ===== Hero ===== */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 md:px-10 pt-10 pb-16 md:pt-10 md:pb-24">
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-4 w-4" />
              新しい成果物プラットフォーム
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
            <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              つくったものが、
              <br />
              ちゃんと見つかる。
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-pretty text-base text-muted-foreground md:text-lg">
            ReadMEは、個人やイベントでの成果物を通じて、あなたのキャリアを支援します。
            <br />
            あなたの「つくる」を、もっと広く。
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/signin" className="inline-flex items-center">
                今すぐはじめる
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg">
              <Link href="/events">作品を探す</Link>
            </Button> */}
            <div className="text-sm text-muted-foreground">
              登録は無料・数分で公開できます
            </div>
          </div>

          {/* Hero showcase */}
          {/* <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-muted/60">
                <div className="aspect-video w-full bg-[linear-gradient(135deg,rgba(99,102,241,.22),rgba(16,185,129,.15))] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">
                    サンプルプロジェクト {i + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  16:9 サムネイルで美しく表示。Markdownで詳細もリッチに。
                </CardContent>
              </Card>
            ))}
          </div> */}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="relative border-t">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-8">
            <Badge variant="outline">主な特徴</Badge>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              公開・つながる・広がる
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              プロジェクト公開、フォロー機能、イベント出展。
              成果物の魅力を最大限に引き出し、次の一歩へ。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-muted/60">
              <CardHeader className="space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>作品を美しく公開</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                サムネ・要約・READMEで魅力を伝達。6桁スラッグによるシンプルなURLでシェアも簡単。
              </CardContent>
            </Card>

            <Card className="border-muted/60">
              <CardHeader className="space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>フォローでつながる</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                気になるクリエイターをフォロー。更新やイベント参加をキャッチアップ。
              </CardContent>
            </Card>

            <Card className="border-muted/60">
              <CardHeader className="space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>イベントで発見される</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                オンライン/オフラインのイベントに紐づけて展示。見てもらう機会を最大化。
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== How it works / CTA ===== */}
      <section className="relative border-t">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <Badge variant="secondary">3ステップで公開</Badge>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                かんたんセットアップ
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground md:text-base">
                <li>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </span>
                  アカウント作成（メール認証）
                </li>
                <li>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </span>
                  プロフィールを整える（SNS/経歴の登録）
                </li>
                <li>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </span>
                  プロジェクトを投稿（サムネ・概要・README）
                </li>
              </ol>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href="/auth/signin">無料で始める</Link>
                </Button>
              </div>

              {/* Optional: simple email capture (non-functional) */}
              <form
                className="mt-6 flex max-w-md gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  type="email"
                  placeholder="最新情報をメールで受け取る（任意）"
                  className="bg-background"
                  aria-label="メールアドレス"
                />
                <Button type="submit" variant="secondary">
                  登録
                </Button>
              </form>
            </div>

            <div className="relative">
              <div className="aspect-video w-full rounded-xl border bg-gradient-to-br from-primary/10 via-transparent to-emerald-200/20 p-1">
                <div className="flex h-full items-center justify-center rounded-lg bg-background/60 text-sm text-muted-foreground">
                  デモ領域（スクリーンショットを配置可）
                </div>
              </div>
              <div className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-cyan-200/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} ReadME</div>
        </div>
      </footer>
    </div>
  );
}
