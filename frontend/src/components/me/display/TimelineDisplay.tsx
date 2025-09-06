import React from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
      .filter((line) => line.trim());
    const isBulletList = lines.some((line) => /^[•\-*]/.test(line.trim()));
    if (isBulletList) {
      return lines
        .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
        .filter(Boolean);
    }
    return null;
  };

  // Format date for display (convert YYYY-MM to readable format)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    const monthNames = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
    return `${year}年${monthNames[parseInt(month) - 1]}`;
  };

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-semibold text-base">{heading}</h3>
      </div>
      <Separator className="mb-3" />

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          <div className="opacity-30 mb-2">{icon}</div>
          <p className="text-sm">{heading}が登録されていません。</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => {
            const rawDesc = getDescription?.(item) ?? null;
            const bulletPoints = rawDesc ? parseDescription(rawDesc) : null;
            const subtitle = getSubtitle?.(item);

            return (
              <div
                key={idx}
                className="py-2.5 border px-3 bg-card text-card-foreground rounded-none"
              >
                <div className="group">
                  {/* Header: Institution and Date */}
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-sm text-foreground leading-tight">
                      {getTitle(item)}
                    </h4>
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(getStart(item))} –{" "}
                      {getEnd(item) ? formatDate(getEnd(item)!) : "現在"}
                    </div>
                  </div>

                  {/* Subtitle (field of study/position) */}
                  {subtitle && (
                    <div className="mb-1">
                      <span className="text-sm text-muted-foreground font-medium italic">
                        {subtitle}
                      </span>
                    </div>
                  )}

                  {/* Description with better visual separation */}
                  {rawDesc && (
                    <div className="ml-3 border-l-2 border-border/30 pl-3">
                      {bulletPoints ? (
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {bulletPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-0.5 font-bold">•</span>
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rawDesc}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
