"use client";

import * as React from "react";
import { Clock2Icon } from "lucide-react";
import { startOfToday } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/** Props: current value as "YYYY-MM-DDTHH:mm" (local), and onChange callback */
type Props = {
  value?: string; // e.g. "2025-09-19T12:00"
  onChange: (v: string) => void; // "" when cleared
};

/** Parse "YYYY-MM-DDTHH:mm[:ss]" into local Date + "HH:mm" */
function parseLocalDateTime(s?: string) {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);
  return { date: new Date(y, mo, d, hh, mm, 0, 0), time: `${m[4]}:${m[5]}` };
}

/** Combine local Date + "HH:mm" -> "YYYY-MM-DDTHH:mm" (no seconds) */
function combineLocalDateTime(date: Date, time: string) {
  const [hStr, mStr] = (time || "12:00").split(":");
  const hh = Number(hStr ?? 12);
  const mm = Number(mStr ?? 0);
  const d = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hh,
    mm,
    0,
    0,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function EventCalender({ value, onChange }: Props) {
  // hydrate from value if present
  const parsed = React.useMemo(() => parseLocalDateTime(value), [value]);
  const [date, setDate] = React.useState<Date | undefined>(
    parsed?.date ?? startOfToday(),
  );
  const [time, setTime] = React.useState<string>(parsed?.time ?? "12:30");

  // keep in sync if parent updates value
  React.useEffect(() => {
    if (!value) return;
    const p = parseLocalDateTime(value);
    if (p) {
      setDate(p.date);
      setTime(p.time);
    }
  }, [value]);

  const handleSave = () => {
    if (!date) return;
    onChange(combineLocalDateTime(date, time));
  };

  const handleClear = () => {
    setDate(undefined);
    setTime("12:30");
    onChange("");
  };

  return (
    <Card className="">
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="bg-transparent p-0"
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t px-4 !pt-4">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="time-to">End Time</Label>
          <div className="relative flex w-full items-center gap-2">
            <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
            <Input
              id="time-to"
              type="time"
              step={60} // minutes precision; use 1 if you want seconds
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2">
          {value && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              クリア
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={!date}>
            保存
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
