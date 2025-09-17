"use client";

import type { TechDisplay } from "@/lib/tech/catalog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function TechChips({ techs }: { techs: TechDisplay[] }) {
  if (!techs?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {techs.map((t) => (
        <Badge key={t.key} variant="secondary" className="gap-1">
          <Image
            src={`/skill/${t.kind}/${t.key}.svg`}
            alt={t.label}
            width={16}
            height={16}
          />
          {t.label}
        </Badge>
      ))}
    </div>
  );
}
