"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ITEMS,
  GROUP_ORDER,
  groupItems,
  type Item,
} from "@/lib/markdown-items";
import { Plus, Pilcrow } from "lucide-react";

type Props = {
  onAction: (item: Item) => void;
  previewTrigger?: React.ReactNode;
};

export default function EditorToolbar({ onAction, previewTrigger }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tgValue, setTgValue] = useState<Record<string, string | undefined>>(
    {},
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (plusBtnRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const itemsByGroup = useMemo(() => groupItems(ITEMS), []);

  return (
    <div className="flex items-start justify-between px-3 py-2 flex-wrap gap-2">
      {/* モバイル：追加メニュー & プレビューTrigger */}
      <div className="relative md:hidden flex items-center gap-2">
        <Button
          ref={plusBtnRef}
          className="rounded-full"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <Plus className="h-4 w-4" />
          追加
        </Button>
        {previewTrigger}

        {menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute z-50 mt-2 w-[360px] max-h-[70vh] overflow-auto rounded-md border bg-popover p-2 shadow-md"
          >
            {GROUP_ORDER.map((g, gi) => (
              <div key={g} className="mb-2">
                <div className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {g}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {itemsByGroup[g].map((it) => (
                    <Button
                      key={it.value}
                      variant="secondary"
                      className="justify-start"
                      onClick={() => {
                        onAction(it);
                        setMenuOpen(false);
                      }}
                    >
                      {it.label}
                    </Button>
                  ))}
                </div>
                {gi !== GROUP_ORDER.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* デスクトップ：トグル群（Tooltip付き） */}
      <div className="hidden md:block">
        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-2">
            {GROUP_ORDER.map((g) => (
              <ToggleGroup
                key={g}
                type="single"
                value={tgValue[g]}
                onValueChange={(v) => {
                  if (!v) return;
                  const it = itemsByGroup[g].find((x) => x.value === v);
                  if (it) onAction(it);
                  setTgValue((prev) => ({ ...prev, [g]: undefined }));
                }}
                className="flex items-center gap-1 rounded-md border"
              >
                {itemsByGroup[g].map((it) => (
                  <Tooltip key={it.value}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={it.value}
                        aria-label={it.label}
                        className="h-8 w-8"
                      >
                        {it.icon ? (
                          <it.icon className="h-4 w-4" />
                        ) : (
                          <Pilcrow className="h-4 w-4" />
                        )}
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{it.label}</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
