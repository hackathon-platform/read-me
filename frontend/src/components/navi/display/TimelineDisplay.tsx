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
  getSubtitle?: (item: T) => string | undefined;
  getStart: (item: T) => string;
  getEnd: (item: T) => string | undefined;
  getDescription?: (item: T) => string | null | undefined;
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
  // Parse bullet-style text into array, else return null
  const parseDescription = (description: string) => {
    const lines = description
      .split(/[\n\r]+|(?=•)|(?=\*)|(?=-)/)
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
    <div>
      {/* Heading */}
      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-500">
        {icon}
        <h3 className="font-semibold">{heading}</h3>
      </div>
      <Separator className="mt-1 mb-3" />

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
            const rawDesc = getDescription?.(item) ?? null;
            const bulletPoints = rawDesc ? parseDescription(rawDesc) : null;
            const subtitle = getSubtitle?.(item);

            return (
              <div key={idx} className="relative flex gap-6">
                <div className="flex-1">
                  <div className="space-y-1">
                    {/* Title and dates */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold leading-tight">
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
                    {subtitle && (
                      <p className="text-sm italic">{subtitle}</p>
                    )}

                    {/* Description */}
                    {rawDesc &&
                      (bulletPoints ? (
                        <ul className="text-sm text-muted-foreground pt-0.5 list-disc list-inside">
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