"use client";

import React from 'react';
import Link from 'next/link';
import { format, isBefore, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventCard({ event }: { event: any }) {
  const {
    id,
    title,
    location,
    start_date,
    end_date,
    category,
    image_url,
    max_participants,
  } = event;

  const startDate = new Date(start_date);
  const endDate = end_date ? new Date(end_date) : null;
  const now = new Date();

  // Determine status
  let status: keyof typeof statusColors = "upcoming";
  if (isAfter(now, startDate)) status = "open";
  if (endDate && isAfter(now, endDate)) status = "closed";

  // Accent color per status
  const statusColors = {
    upcoming: {
      base: "bg-orange-600",
      hover: "border-l-orange-600 hover:border-orange-600",
    },
    open: {
      base: "bg-green-500",
      hover: "hover:border-green-500",
    },
    closed: {
      base: "bg-gray-500",
      hover: "hover:border-gray-500",
    }
  };

  const { base, hover } = statusColors[status];
  return (
    <Link href={`/events/${id}`}>
      <div className="group h-44 relative bg-background flex overflow-visible">
        <div
          className={cn(
            "relativ h-full p-6 rounded shadow transition-shadow w-full",
            "border border-l-4 border-gray-200", // hover:border-r-12
            "group-hover:shadow-md", hover
          )}
        >
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-gray-600">{location}</p>
        </div>
      </div>
    </Link>

  );
}