"use client";

import { useState } from "react";
import type { TechDisplay } from "@/lib/tech/catalog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { TechKind } from "@/lib/types";

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

export function TechIcon({
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
  const [img, setImg] = useState(src);
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
