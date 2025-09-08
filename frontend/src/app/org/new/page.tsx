"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { uploadImage } from "@/lib/api/upload";
import { createEvent } from "@/lib/api/event";
import { supabase } from "@/lib/supabaseClient";
import {
  CalendarDays,
  Globe,
  Image as ImageIcon,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";

// ▼ 追加：shadcn datepicker (Calendar) + Popover + Input
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import EventCalender from "@/components/org/EventCalender";

// ------------------------------------------------------------
// Types & Utils
// ------------------------------------------------------------


type EventData = {
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  website: string;
  endAt: string;
  teamMax: number;
  submissionTemplate: string;
};

const DEFAULT_TEMPLATE = `# 提出テンプレート / Submission Template

## プロジェクト名 / Title

## 1. 概要 / Overview
- 何を解決？誰のため？

## 2. デモ / Demo
- デプロイURL: 
- 動画URL: 
- スライド: 

## 3. リポジトリ / Repository
- GitHub: 

## 4. 技術スタック / Tech Stack

## 5. 特筆事項 / Notes
`;

const sanitizeSlug = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, "");
const isSlugValid = (v: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const uid = () => Math.random().toString(36).slice(2, 9);

function formatDate(startAt: string, tz: string) {
  if (!startAt) return "";
  try {
    const fmt = new Intl.DateTimeFormat("ja-JP", {
      timeZone: tz || "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return fmt.format(new Date(startAt));
  } catch {
    return "";
  }
}

function formatDateRange(startAt: string, endAt: string, tz: string) {
  const s = formatDate(startAt, tz);
  const e = endAt ? formatDate(endAt, tz) : "";
  if (!s && !e) return "";
  if (s && !e) return `${s} -`;
  if (!s && e) return `- ${e}`;
  return `${s} - ${e}`;
}

// ------------------------------------------------------------
// contentEditable helper with robust placeholders
// ------------------------------------------------------------
function useEditableBinder(
  value: string,
  onChange: (v: string) => void,
  opts?: { placeholder?: string; singleLine?: boolean }
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if ((el.textContent ?? "") !== value) el.textContent = value;
    el.dataset.placeholder = opts?.placeholder ?? "";
    el.dataset.empty = String(!value.trim());
  }, [value, opts?.placeholder]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const v = e.currentTarget.textContent || "";
    e.currentTarget.dataset.empty = String(!v.trim());
    onChange(v);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (opts?.singleLine && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLDivElement).blur();
    }
  };

  return { ref, handleInput, handlePaste, handleKeyDown } as const;
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export default function CreateHackathonInline() {
  const router = useRouter();
  const { user } = useSupabaseAuth();

  const [data, setData] = useState<EventData>({
    name: "",
    slug: "",
    description: "",
    website: "",
    email: "",
    bannerUrl: "",
    iconUrl: "",
    startAt: "",
    endAt: "",
    timezone: "Asia/Tokyo",
    locationType: "online",
    locationName: "オンライン",
    locationAddress: "",
    registrationUrl: "",
    teamMin: 1,
    teamMax: 4,
    tracks: ["AI / 生成AI"],
    prizes: [{ id: uid(), title: "最優秀賞" }],
    faqs: [{ id: uid(), q: "個人参加でも大丈夫？", a: "はい、当日のチーム組成も可能です。" }],
    submissionTemplate: DEFAULT_TEMPLATE,
  });

  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [iconPreview, setIconPreview] = useState<string>("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // slug availability
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);

  const setField = <K extends keyof EventData>(key: K, value: EventData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  useEffect(() => {
    if (!data.slug && data.name) setData((p) => ({ ...p, slug: sanitizeSlug(data.name) }));
  }, [data.name]);

  const dateRangeText = useMemo(
    () => formatDateRange(data.startAt, data.endAt, data.timezone),
    [data.startAt, data.endAt, data.timezone]
  );

  async function checkSlugAvailability(slug: string) {
    if (!slug) return setSlugTaken(null);
    setSlugChecking(true);
    try {
      const { data: row } = await supabase
        .from("event")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      setSlugTaken(Boolean(row));
    } catch {
      setSlugTaken(null);
    } finally {
      setSlugChecking(false);
    }
  }

  const required = {
    name: Boolean(data.name.trim()),
    slug: Boolean(data.slug.trim()) && isSlugValid(data.slug) && slugTaken === false,
  };
  const allRequiredOk = Object.values(required).every(Boolean);

  const onBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      setBannerPreview(URL.createObjectURL(file));
      const publicUrl = await uploadImage(file, "banner", data.slug || uid());
      setField("bannerUrl", publicUrl);
    } catch (err) {
      console.error(err);
      toast.error("バナーのアップロードに失敗しました");
    } finally {
      setUploadingBanner(false);
    }
  };

  async function handlePublish() {
    if (!user) return toast.error("ログインが必要です");
    if (!allRequiredOk) return toast.error("必須項目を埋めてください");

    setSaving(true);
    try {
      const created = await createEvent({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        website: data.website || null,
        email: data.email || null,
        banner_url: data.bannerUrl || null,
        icon_url: data.iconUrl || null,
        created_by: user.id,
      });
      setDirty(false);
      toast.success("イベントを作成しました");
      router.push(`/events/${created.slug}`);
    } catch (e: any) {
      console.error(e);
      toast.error("イベントの作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: "運営", href: "/org", current: true }]} />

      {/* Sticky Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="mx-4 h-12 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {dirty ? (
              <span className="inline-flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" />未保存の変更</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" />すべて保存済み</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ChecklistBadge required={required} slugState={{ slugChecking, slugTaken, value: data.slug }} />
            <Button onClick={handlePublish} disabled={!allRequiredOk || saving} className="h-8">
              {saving ? <>公開中...</> : "公開する"}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mt-4 rounded-lg overflow-hidden border bg-card">
        <div className="relative h-48 bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 to-cyan-400">
          {bannerPreview || data.bannerUrl ? (
            <img src={bannerPreview || data.bannerUrl} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/90">
              <div className="text-center">
                <ImageIcon className="w-7 h-7 mx-auto mb-1" />
                <p className="text-xs">バナー画像 – クリックでアップロード</p>
              </div>
            </div>
          )}
          <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={onBannerUpload} />
          <label htmlFor="banner-upload" className="absolute inset-0 cursor-pointer" />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-8">
          <EditableH1
            value={data.name}
            onChange={(v) => setField("name", v)}
            placeholder="クリックしてイベント名（必須）"
          />

          {/* Slug */}
          <div className="mt-1 text-xs text-muted-foreground">
            <EditableInline
              value={data.slug}
              onChange={(v) => setField("slug", sanitizeSlug(v))}
              onBlur={() => checkSlugAvailability(data.slug)}
              placeholder="example（英小文字・数字・ハイフン）"
              prefix="#"
              invalid={Boolean(data.slug) && !isSlugValid(data.slug)}
            />
            <span className="ml-2">
              {data.slug ? `URL: yoursite.com/events/${data.slug}` : "例: yoursite.com/events/example"}
            </span>
            {slugChecking && <span className="ml-2 text-amber-600">（スラッグ確認中...）</span>}
            {slugTaken === true && <span className="ml-2 text-destructive">（このスラッグは使用済み）</span>}
            {slugTaken === false && !!data.slug && isSlugValid(data.slug) && (
              <span className="ml-2 text-emerald-600">（使用可能）</span>
            )}
          </div>

          {/* Meta Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* 終了日時（shadcn datepicker） */}
            <EndAtBadge
              value={data.endAt}
              tz={data.timezone}
              onChange={(v) => setField("endAt", v)}
            />

            {/* チーム人数 */}
            <Badge variant="secondary" className="px-2 py-1">
              <Users className="w-3.5 h-3.5 mr-1" />
              最大
              <EditableInline
                value={String(data.teamMax)}
                onChange={(v) => setField("teamMax", Number(v.replace(/\D/g, "")) || 4)}
                placeholder="4"
                compact
              />
              <span className="ml-1">人 / チーム</span>
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              <Globe className="w-3.5 h-3.5 mr-1" />
              <EditableInline
                value={data.website}
                onChange={(v) => setField("website", v)}
                placeholder="公式サイト URL"
                compact
              />
            </Badge>
          </div>

          {/* Description */}
          <SectionTitle>概要 / About</SectionTitle>
          <EditableP
            className="mt-1"
            value={data.description}
            onChange={(v) => setField("description", v)}
            placeholder="イベントの目的・対象・特色などを記載してください"
          />

          {/* Submission Template */}
          <SectionTitle>提出テンプレート（コピーして使える）</SectionTitle>
          <EditablePre
            value={data.submissionTemplate}
            onChange={(v) => setField("submissionTemplate", v)}
            placeholder={DEFAULT_TEMPLATE}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   終了日時ピッカー（分割コンポーネント）
   ============================================================ */

   function EndAtBadge({
    value,
    tz,
    onChange,
  }: {
    value: string;
    tz: string;
    onChange: (v: string) => void;
  }) {
    const [open, setOpen] = useState(false);
    const label = value ? `終了: ${formatDate(value, tz)}` : "終了日時を選択";
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Badge variant="secondary" className="px-3 py-2 cursor-pointer">
            <CalendarDays className="w-3.5 h-3.5 mr-1" />
            {label}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <EventCalender
            value={value}
            onChange={(v) => {
              onChange(v);      // sets parent endAt
              setOpen(false);   // close popover
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }


// 文字列 "YYYY-MM-DDTHH:mm" → { date(ローカル), time "HH:mm" }
function parseLocalDateTime(s: string | undefined) {
  if (!s) return null;
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);
  return { date: new Date(y, mo, d, hh, mm, 0, 0), time: `${m[4]}:${m[5]}` };
}

// Date(ローカル) + "HH:mm" → "YYYY-MM-DDTHH:mm"（タイムゾーン無しローカル表記）
function combineLocalDateTime(date: Date, time: string) {
  const [hh, mm] = (time || "12:00").split(":").map((n) => Number(n));
  const d = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    isNaN(hh) ? 12 : hh,
    isNaN(mm) ? 0 : mm,
    0,
    0
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/* ============================================================
   既存のインライン編集コンポーネント
   ============================================================ */

function EditableH1({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { ref, handleInput, handlePaste, handleKeyDown } = useEditableBinder(value, onChange, { placeholder, singleLine: true });
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className="text-2xl font-bold tracking-tight outline-none focus:ring-2 focus:ring-ring/40 rounded
                 data-[empty=true]:before:content-[attr(data-placeholder)]
                 data-[empty=true]:before:text-muted-foreground"
      role="textbox"
      aria-label="イベント名"
    />
  );
}

function EditableP({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const { ref, handleInput, handlePaste } = useEditableBinder(value, onChange, { placeholder });
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      className={`outline-none focus:ring-2 focus:ring-ring/40 rounded min-h-6
                  data-[empty=true]:before:content-[attr(data-placeholder)]
                  data-[empty=true]:before:text-muted-foreground ${className || ""}`}
      role="textbox"
      aria-label="テキスト"
    />
  );
}

function EditableInline({
  value,
  onChange,
  onBlur,
  placeholder,
  prefix,
  invalid,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  prefix?: React.ReactNode | string;
  invalid?: boolean;
  compact?: boolean;
}) {
  const { ref, handleInput, handlePaste, handleKeyDown } = useEditableBinder(value, onChange, { placeholder, singleLine: true });
  return (
    <span
      className={`group inline-flex items-center rounded border ${compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1.5 text-sm"}
                  ${invalid ? "border-destructive" : "border-border"} focus-within:ring-2 focus-within:ring-ring/40 bg-background`}
    >
      {typeof prefix === "string" ? <span className="text-muted-foreground mr-1">{prefix}</span> : prefix}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        className="flex-1 outline-none min-w-10
                   data-[empty=true]:before:content-[attr(data-placeholder)]
                   data-[empty=true]:before:text-muted-foreground"
        role="textbox"
        aria-label="inline"
      />
    </span>
  );
}

function EditablePre({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { ref, handleInput, handlePaste } = useEditableBinder(value, onChange, { placeholder });
  return (
    <pre
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput as any}
      onPaste={handlePaste as any}
      className="whitespace-pre-wrap rounded-md border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring/40
                 data-[empty=true]:before:content-[attr(data-placeholder)]
                 data-[empty=true]:before:text-muted-foreground"
      aria-label="提出テンプレート"
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-foreground/90">{children}</h3>;
}

function ChecklistBadge({
  required,
  slugState,
}: {
  required: { name: boolean; slug: boolean };
  slugState: { slugChecking: boolean; slugTaken: boolean | null; value: string };
}) {
  const items = [
    { key: "name", label: "イベント名", ok: required.name },
    { key: "slug", label: "URL スラッグ", ok: required.slug },
  ];
  return (
    <div className="hidden sm:flex items-center gap-2 text-xs">
      {items.map((it) => (
        <Badge
          variant="outline"
          key={it.key}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
            it.ok ? "text-emerald-700 border-emerald-300" : "text-amber-700 border-amber-300"
          }`}
        >
          {it.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {it.label}
        </Badge>
      ))}
      {slugState.value && slugState.slugTaken === true && (
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-destructive border-destructive/40">
          <XCircle className="w-3.5 h-3.5" /> スラッグ重複
        </span>
      )}
    </div>
  );
}
