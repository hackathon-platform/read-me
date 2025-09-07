"use client";

import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bookmark,
  Building2,
  Clock3,
  DollarSign,
  ExternalLink,
  Filter,
  Globe2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

// ---------- Types ----------
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote?: boolean;
  employmentType: "Full-time" | "Contract" | "Intern";
  salaryMin?: number;
  salaryMax?: number;
  currency?: "USD" | "CAD" | "JPY" | "EUR";
  logo?: string;
  postedAgo: string;
  applicants?: number;
  schoolConnections?: number;
  skills?: string[];
  matchCount?: number;
  matchTotal?: number;
  description: string; // JP
  contacts?: {
    name: string;
    title: string;
    relation: string;
    avatar?: string;
  }[];
};

// ---------- Mock Data (JP) ----------
const JOBS: Job[] = [
  {
    id: "1",
    title:
      "Associate Gameplay Software Engineer (Unreal Engine 5) - (7-month contract)",
    company: "Blackbird Interactive",
    location: "バンクーバー, BC",
    isRemote: true,
    employmentType: "Contract",
    salaryMin: 70000,
    salaryMax: 95000,
    currency: "CAD",
    postedAgo: "2週間前",
    applicants: 100,
    schoolConnections: 1,
    skills: ["Unreal", "C++", "Gameplay", "Perforce", "AI"],
    matchCount: 3,
    matchTotal: 10,
    description:
      "Blackbird Interactive は、クリエイティブかつ将来志向の独立系ゲームスタジオです。Unreal Engine 5 を用いたゲームプレイ機能の設計・実装・最適化を担当します。C++ による開発経験は必須で、ゲームAI／アニメーション／ネットワークのいずれかに強みがある方を歓迎します。期間は7か月の契約ポジションです。",
    contacts: [
      {
        name: "Johnwill Keating",
        title: "Programmer at Blackbird Interactive Inc",
        relation: "University of Waterloo の同窓生",
      },
    ],
  },
  {
    id: "2",
    title: "Full Stack Developer (UX/UI)",
    company: "DataAnnotation",
    location: "バンクーバー, BC",
    isRemote: true,
    employmentType: "Contract",
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "CAD",
    postedAgo: "1週間前",
    applicants: 60,
    schoolConnections: 13,
    skills: ["Next.js", "TypeScript", "Postgres", "Tailwind", "Figma"],
    matchCount: 6,
    matchTotal: 10,
    description:
      "大規模 LLM データプラットフォームの設計から実装までを担当します。Next.js／TypeScript による UI 実装、API 設計、計測・A/B テストの仕組みづくりまで幅広く関わります。開発速度とユーザー体験の両立を重視できる方を歓迎します。",
  },
  {
    id: "3",
    title: "Founding Builders Fellowship (Canada)",
    company: "Prompt.Build",
    location: "カナダ",
    isRemote: true,
    employmentType: "Intern",
    postedAgo: "3日前",
    applicants: 25,
    schoolConnections: 0,
    skills: ["AI", "Product", "Growth"],
    matchCount: 4,
    matchTotal: 8,
    description:
      "AI プロダクトの 0→1 を支援するフェローシップ。創業者と並走し、リサーチ、プロトタイピング、ユーザーインタビュー、グロース実験などを高速に回します。自走できるプロダクト志向の学生・若手を歓迎します。",
  },
  {
    id: "4",
    title: "Embedded Software Engineering Intern (September 2025)",
    company: "Kepler Communications Inc.",
    location: "トロント, ON",
    isRemote: true,
    employmentType: "Intern",
    postedAgo: "4日前",
    applicants: 47,
    schoolConnections: 7,
    skills: ["C", "RTOS", "Telemetry", "Python"],
    matchCount: 2,
    matchTotal: 10,
    description:
      "衛星通信向けの組み込みソフトウェア開発インターン。RTOS 上での C 言語開発、テレメトリ、デバッグ・テスト自動化の経験があると尚可。宇宙規模の通信網を実装レベルから支えるポジションです。",
  },
  {
    id: "5",
    title: "Associate Software Engineer (Payments)",
    company: "CraftStadium",
    location: "東京",
    isRemote: true,
    employmentType: "Full-time",
    salaryMin: 6000000,
    salaryMax: 9000000,
    currency: "JPY",
    postedAgo: "本日",
    applicants: 12,
    schoolConnections: 0,
    skills: ["Go", "PostgreSQL", "GCP", "Stripe"],
    matchCount: 5,
    matchTotal: 10,
    description:
      "インタラクティブな AI プロダクトの決済・メータリング基盤を担当します。Go + PostgreSQL によるマイクロサービス、Stripe 連携、従量課金（usage-based billing）の設計・運用に関心のある方を歓迎します。セキュアでスケーラブルな決済体験づくりをお任せします。",
  },
  {
    id: "6",
    title:
      "Associate Gameplay Software Engineer (Unreal Engine 5) - (7-month contract)",
    company: "Blackbird Interactive",
    location: "バンクーバー, BC",
    isRemote: true,
    employmentType: "Contract",
    salaryMin: 70000,
    salaryMax: 95000,
    currency: "CAD",
    postedAgo: "2週間前",
    applicants: 100,
    schoolConnections: 1,
    skills: ["Unreal", "C++", "Gameplay", "Perforce", "AI"],
    matchCount: 3,
    matchTotal: 10,
    description:
      "Blackbird Interactive は、クリエイティブかつ将来志向の独立系ゲームスタジオです。Unreal Engine 5 を用いたゲームプレイ機能の設計・実装・最適化を担当します。C++ による開発経験は必須で、ゲームAI／アニメーション／ネットワークのいずれかに強みがある方を歓迎します。期間は7か月の契約ポジションです。",
    contacts: [
      {
        name: "Johnwill Keating",
        title: "Programmer at Blackbird Interactive Inc",
        relation: "University of Waterloo の同窓生",
      },
    ],
  },
  {
    id: "7",
    title: "Full Stack Developer (UX/UI)",
    company: "DataAnnotation",
    location: "バンクーバー, BC",
    isRemote: true,
    employmentType: "Contract",
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "CAD",
    postedAgo: "1週間前",
    applicants: 60,
    schoolConnections: 13,
    skills: ["Next.js", "TypeScript", "Postgres", "Tailwind", "Figma"],
    matchCount: 6,
    matchTotal: 10,
    description:
      "大規模 LLM データプラットフォームの設計から実装までを担当します。Next.js／TypeScript による UI 実装、API 設計、計測・A/B テストの仕組みづくりまで幅広く関わります。開発速度とユーザー体験の両立を重視できる方を歓迎します。",
  },
  {
    id: "8",
    title: "Founding Builders Fellowship (Canada)",
    company: "Prompt.Build",
    location: "カナダ",
    isRemote: true,
    employmentType: "Intern",
    postedAgo: "3日前",
    applicants: 25,
    schoolConnections: 0,
    skills: ["AI", "Product", "Growth"],
    matchCount: 4,
    matchTotal: 8,
    description:
      "AI プロダクトの 0→1 を支援するフェローシップ。創業者と並走し、リサーチ、プロトタイピング、ユーザーインタビュー、グロース実験などを高速に回します。自走できるプロダクト志向の学生・若手を歓迎します。",
  },
  {
    id: "9",
    title: "Embedded Software Engineering Intern (September 2025)",
    company: "Kepler Communications Inc.",
    location: "トロント, ON",
    isRemote: true,
    employmentType: "Intern",
    postedAgo: "4日前",
    applicants: 47,
    schoolConnections: 7,
    skills: ["C", "RTOS", "Telemetry", "Python"],
    matchCount: 2,
    matchTotal: 10,
    description:
      "衛星通信向けの組み込みソフトウェア開発インターン。RTOS 上での C 言語開発、テレメトリ、デバッグ・テスト自動化の経験があると尚可。宇宙規模の通信網を実装レベルから支えるポジションです。",
  },
  {
    id: "10",
    title: "Associate Software Engineer (Payments)",
    company: "CraftStadium",
    location: "東京",
    isRemote: true,
    employmentType: "Full-time",
    salaryMin: 6000000,
    salaryMax: 9000000,
    currency: "JPY",
    postedAgo: "本日",
    applicants: 12,
    schoolConnections: 0,
    skills: ["Go", "PostgreSQL", "GCP", "Stripe"],
    matchCount: 5,
    matchTotal: 10,
    description:
      "インタラクティブな AI プロダクトの決済・メータリング基盤を担当します。Go + PostgreSQL によるマイクロサービス、Stripe 連携、従量課金（usage-based billing）の設計・運用に関心のある方を歓迎します。セキュアでスケーラブルな決済体験づくりをお任せします。",
  },
];

// ---------- Utilities ----------
function fmtSalary(min?: number, max?: number, c: Job["currency"] = "USD") {
  if (!min || !max) return undefined;
  const unit =
    c === "JPY" ? "¥" : c === "CAD" ? "CA$" : c === "EUR" ? "€" : "$";
  const format = (n: number) => Math.round(n).toLocaleString();
  return `${unit}${format(min)} /年 - ${unit}${format(max)} /年`;
}

// ---------- Page Component ----------
export default function JobsBoardPage() {
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(JOBS[0]?.id ?? "");
  const [onlyRemote, setOnlyRemote] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((j) => {
      const hay =
        `${j.title} ${j.company} ${j.location} ${j.skills?.join(" ")}`.toLowerCase();
      const okQ = q ? hay.includes(q) : true;
      const okRemote = onlyRemote ? !!j.isRemote : true;
      return okQ && okRemote;
    });
  }, [query, onlyRemote]);

  const selected = React.useMemo(
    () => filtered.find((j) => j.id === selectedId) ?? filtered[0],
    [filtered, selectedId],
  );

  React.useEffect(() => {
    if (!selected && filtered[0]) setSelectedId(filtered[0].id);
  }, [filtered, selected]);

  return (
    // Fit INSIDE SidebarInset: same height, normal flow (not fixed), no overlay
    <div className="relative h-[calc(100vh-5.5rem)] overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left: Details */}
        <ResizablePanel
          minSize={40}
          defaultSize={66}
          className="overflow-hidden m-3 rounded-lg border"
        >
          <div className="flex h-full min-h-0 flex-col">
            {selected ? (
              <JobDetails job={selected} />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <p>求人を選択してください</p>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Job list */}
        <ResizablePanel
          minSize={28}
          defaultSize={34}
          className="min-w-[320px] overflow-hidden"
        >
          <div className="flex h-full min-h-0 flex-col">
            <ListHeader
              count={filtered.length}
              query={query}
              setQuery={setQuery}
              onlyRemote={onlyRemote}
              setOnlyRemote={setOnlyRemote}
            />
            <Separator />
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="divide-y">
                {filtered.map((job) => (
                  <li key={job.id}>
                    <JobRow
                      job={job}
                      active={selected?.id === job.id}
                      onClick={() => setSelectedId(job.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// ---------- Subcomponents ----------
function ListHeader(props: {
  count: number;
  query: string;
  setQuery: (v: string) => void;
  onlyRemote: boolean;
  setOnlyRemote: (v: boolean) => void;
}) {
  const { count, query, setQuery, onlyRemote, setOnlyRemote } = props;
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-muted-foreground">求人を検索</div>
        <Badge variant="secondary" className="rounded-full">
          {count}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="職種・会社名・スキルで検索"
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" title="フィルター">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={onlyRemote}
            onChange={(e) => setOnlyRemote(e.target.checked)}
            className="h-4 w-4 rounded border-muted-foreground"
          />
          リモートのみ
        </label>
      </div>
    </div>
  );
}

function JobRow({
  job,
  active,
  onClick,
}: {
  job: Job;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch gap-3 px-3 py-3 text-left transition hover:bg-muted/60 data-[active=true]:bg-muted"
      data-active={active}
    >
      <Avatar className="mt-1 h-10 w-10 rounded-md">
        {job.logo ? (
          <AvatarImage src={job.logo} alt={job.company} />
        ) : (
          <AvatarFallback className="rounded-md">
            {job.company[0]}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-[15px] font-medium">{job.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {job.company}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
          {job.isRemote && (
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              リモート
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {fmtSalary(job.salaryMin, job.salaryMax, job.currency) && (
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {fmtSalary(job.salaryMin, job.salaryMax, job.currency)}
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            {job.employmentType}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {job.postedAgo}
          </span>
          {typeof job.applicants === "number" && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.applicants}+ 応募
            </span>
          )}
          {typeof job.schoolConnections === "number" &&
            job.schoolConnections > 0 && (
              <span className="inline-flex items-center gap-1">
                <UserCircle2 className="h-3.5 w-3.5" />
                学校の同窓生 {job.schoolConnections}人
              </span>
            )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 transition group-hover:opacity-100"
        title="保存"
      >
        <Bookmark className="h-4 w-4" />
      </Button>
    </button>
  );
}

function JobDetails({ job }: { job: Job }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-snug">{job.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            {job.isRemote && (
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-3.5 w-3.5" />
                リモート
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {fmtSalary(job.salaryMin, job.salaryMax, job.currency) && (
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {fmtSalary(job.salaryMin, job.salaryMax, job.currency)}
              </Badge>
            )}
            <Badge variant="outline">{job.employmentType}</Badge>
            {typeof job.matchCount === "number" && (
              <Badge variant="secondary">
                {job.matchCount}/{job.matchTotal} 件のスキルマッチ
              </Badge>
            )}
          </div>
        </div>
        <Button className="gap-1">
          応募 <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {job.contacts && job.contacts.length > 0 && (
        <>
          <div className="p-4">
            <div className="text-sm font-medium">リーチ可能なメンバー</div>
            <div className="mt-3 flex flex-col gap-3">
              {job.contacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {c.avatar ? (
                        <AvatarImage src={c.avatar} alt={c.name} />
                      ) : (
                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium leading-tight">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.title} ・ {c.relation}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageCircle className="h-4 w-4" />
                    メッセージ
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="prose prose-sm max-w-none p-4 dark:prose-invert">
          <h3>この求人について</h3>
          <p>{job.description}</p>

          {job.skills && job.skills.length > 0 && (
            <div className="not-prose mt-4 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="mt-6">応募情報</h3>
          <ul>
            <li>掲載: {job.postedAgo}</li>
            {typeof job.applicants === "number" && (
              <li>応募者: {job.applicants}+ 名</li>
            )}
            <li>雇用形態: {job.employmentType}</li>
            {fmtSalary(job.salaryMin, job.salaryMax, job.currency) && (
              <li>
                給与レンジ:{" "}
                {fmtSalary(job.salaryMin, job.salaryMax, job.currency)}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
