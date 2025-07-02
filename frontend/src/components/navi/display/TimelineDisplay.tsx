import React from "react";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";

/**
 * Generic display for timeline-like data (e.g. education, work)
 */
export interface TimelineDisplayProps<T> {
  items: T[];
  heading: string;
  icon: React.ReactNode;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getStart: (item: T) => string;
  getEnd: (item: T) => string | undefined;
  getDescription?: (item: T) => string | null;
}

export function TimelineDisplay<T>({
  items,
  heading,
  icon,
  getTitle,
  getSubtitle,
  getStart,
  getEnd,
  getDescription,
}: TimelineDisplayProps<T>) {
  // Parses bullet-style text into array, else returns null
  const parseDescription = (description: string) => {
    const lines = description
      .split(/[,\n\r]+|(?=•)|(?=\*)|(?=-)/)
      .filter(line => line.trim());
    const isBulletList = lines.some(line => /^[•\-*]/.test(line.trim()));
    if (isBulletList) {
      return lines
        .map(line => line.replace(/^[•\-*]\s*/, '').trim())
        .filter(Boolean);
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold">{heading}</h3>
      </div>
      <Separator className="my-2" />

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          {icon}
          <p className="text-sm text-muted-foreground mt-3">
            {heading}が登録されていません。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, idx) => {
            const rawDesc = getDescription?.(item);
            const bulletPoints = rawDesc ? parseDescription(rawDesc) : null;
            return (
              <div key={idx} className="relative flex gap-6">
                <div className="flex-1">
                  <div className="space-y-1">
                    {/* Title and dates */}
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-lg leading-tight">
                        {getTitle(item)}
                      </h4>
                      <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {getStart(item)} – {getEnd(item) ?? "現在"}
                        </span>
                      </div>
                    </div>

                    {/* Subtitle if any */}
                    {getSubtitle && (
                      <p className="text-sm italic">{getSubtitle(item)}</p>
                    )}

                    {/* Description */}
                    {rawDesc &&
                      (bulletPoints ? (
                        <ul className="text-sm pt-0.5 list-disc list-inside">
                          {bulletPoints.map((pt, i) => (
                            <li key={i} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm pt-0.5 leading-relaxed">
                          {rawDesc}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}