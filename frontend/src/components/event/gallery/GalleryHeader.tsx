"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function GalleryHeader({
  query,
  onQueryChange,
  totalCount,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="検索：タイトル、概要、作成者…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{totalCount} 件</Badge>
      </div>
    </div>
  );
}
