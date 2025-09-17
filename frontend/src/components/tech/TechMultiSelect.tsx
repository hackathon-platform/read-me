"use client";

import * as React from "react";
import Image from "next/image";
import type { TechKind } from "@/lib/types";
import { TECH_GROUPS, TECH_BY_KEY, TechDisplay } from "@/lib/tech/catalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** selected keys, e.g. ["c", "react"] */
  value: string[];
  onChange: (keys: string[]) => void;
  size?: "sm" | "default";
  buttonLabel?: string;
  className?: string;
};

export default function TechMultiSelect({
  value,
  onChange,
  size = "default",
  buttonLabel = "技術を選択",
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);

  // 選択済み（key → item）
  const selected: TechDisplay[] = React.useMemo(
    () => value.map((k) => TECH_BY_KEY[k]).filter(Boolean) as TechDisplay[],
    [value],
  );

  const toggle = (key: string, checked?: boolean) => {
    const isOn = checked ?? !value.includes(key);
    if (isOn) {
      if (!value.includes(key)) onChange([...value, key]);
    } else {
      onChange(value.filter((v) => v !== key));
    }
  };

  const clear = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Selected chips (inline) */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selected.map((t) => (
          <Badge key={t.key} variant="secondary" className="gap-1">
            <TechIcon kind={t.kind} keyName={t.key} alt={t.label} />
            {t.label}
            <button
              type="button"
              className="ml-1 -mr-1 rounded hover:bg-muted"
              onClick={() => toggle(t.key, false)}
              aria-label={`${t.label} を外す`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size={size} variant="outline">
            {buttonLabel}
            {selected.length ? `（${selected.length}）` : ""}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl w-[calc(100vw-2rem)] p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-base sm:text-lg">
              使用技術を選択
            </DialogTitle>
            <DialogDescription className="sr-only">
              仕事で使用したことのある技術を選択してください。
            </DialogDescription>
            <div className="gap-y-2">
              {selected.map((t) => (
                <Badge key={t.key} variant="secondary" className="mr-2">
                  <TechIcon kind={t.kind} keyName={t.key} alt={t.label} />
                  {t.label}
                  <button
                    type="button"
                    className="ml-1 -mr-1 rounded hover:bg-muted"
                    onClick={() => toggle(t.key, false)}
                    aria-label={`${t.label} を外す`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-8">
              {TECH_GROUPS.map(({ kind, title, items }) =>
                items.length ? (
                  <section key={kind}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="border-l-4 border-teal-400 pl-3 text-sm font-medium">
                          {title}
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({items.length})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          onChange(
                            value.filter(
                              (k) => !items.some((t) => t.key === k),
                            ),
                          )
                        }
                      >
                        解除
                      </Button>
                    </div>

                    <div className="mb-4 h-0.5 bg-teal-400/70 rounded" />

                    <div
                      className={cn(
                        "grid gap-3",
                        "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]",
                      )}
                    >
                      {items.map((t) => {
                        const checked = value.includes(t.key);
                        return (
                          <div
                            role="checkbox"
                            key={t.key}
                            aria-checked={checked}
                            tabIndex={0}
                            onClick={() => toggle(t.key)}
                            onKeyDown={(e) =>
                              (e.key === " " || e.key === "Enter") &&
                              toggle(t.key)
                            }
                            className={cn(
                              "group w-full rounded-lg border p-2 text-left transition",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              checked
                                ? "border-primary ring-2 ring-primary/40"
                                : "border-muted",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => toggle(t.key, !!v)}
                                className="pointer-events-none h-4 w-4"
                              />
                              <TechIcon
                                kind={t.kind}
                                keyName={t.key}
                                alt={t.label}
                                size={20}
                              />
                              <span className="text-sm">{t.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null,
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3 flex items-center justify-end">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={clear}>
                クリアしてキャンセル
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                完了
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TechIcon({
  kind,
  keyName,
  alt,
  size = 18,
}: {
  kind: TechKind;
  keyName: string;
  alt: string;
  size?: number;
}) {
  const src = `/skill/${kind}/${keyName}.svg`;
  const [img, setImg] = React.useState(src);
  return (
    <Image
      src={img}
      alt={alt}
      width={size}
      height={size}
      className="inline-block"
      loading="lazy"
      onError={() => setImg("/skill/_fallback.svg")}
    />
  );
}
