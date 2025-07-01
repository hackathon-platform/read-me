"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  MapPin,
  Share,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/layout/PageHeader";
import EventPage from "@/components/event/EventPage";

// --- Mock Data Definitions ---
const mockEvent = {
  id: "evt1",
  title: "Healthcare AI Hackathon 2025",
  description:
    "Build AI solutions that transform patient care and medical workflows in this 48-hour hackathon.",
  start_date: "2025-10-05T09:00:00Z",
  end_date: "2025-10-07T18:00:00Z",
  category: "Healthcare & AI",
  location: "Online",
  image_url:
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
  max_participants: 50,
};

const mockOrganizer = {
  id: "org1",
  full_name: "MedTech Innovation",
  avatar_url:
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80",
};

const mockParticipants = [
  {
    user_id: "u1",
    profile: {
      full_name: "Alice",
      avatar_url: "https://i.pravatar.cc/40?img=1",
    },
  },
  {
    user_id: "u2",
    profile: { full_name: "Bob", avatar_url: "https://i.pravatar.cc/40?img=2" },
  },
  {
    user_id: "u3",
    profile: {
      full_name: "Carol",
      avatar_url: "https://i.pravatar.cc/40?img=3",
    },
  },
];

const mockUserParticipation = { status: "interested" as const };

// --- Banner Component ---
interface EventBannerProps {
  imageUrl: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  onShare: () => void;
}

function EventBanner({
  imageUrl,
  title,
  category,
  startDate,
  endDate,
  location,
  onShare,
}: EventBannerProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3">
      <div className="flex-shrink-0 w-full lg:w-1/2 aspect-[21/9] rounded-xl overflow-hidden bg-muted relative">
        <Image src={imageUrl} alt={title} className="object-cover" fill />
      </div>
      <div className="flex flex-col justify-center lg:w-3/4 gap-4">
        <h1 className="text-3xl font-bold leading-tight overflow-hidden line-clamp-2">
          {title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <Tag className="h-3 w-3" /> {category}
          </Badge>
          <Badge variant="outline">
            <Calendar className="h-3 w-3" /> {format(start, "yyyy-MM-dd")} –{" "}
            {format(end, "yyyy-MM-dd")}
          </Badge>
          <Badge variant="outline">
            <MapPin className="h-3 w-3" /> {location}
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="w-max" onClick={onShare}>
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
}

export default function EventDetailPageMock() {
  const router = useRouter();

  // Initialize with mocks
  const [event] = useState(mockEvent);
  const [organizer] = useState(mockOrganizer);
  const [participants] = useState(mockParticipants);
  const [participantCount] = useState(participants.length);
  const [userParticipation] = useState(mockUserParticipation);

  // Derived states
  const isOrganizer = false; // toggle to true to test organizer
  const isAttending = userParticipation.status === "attending";
  const isInterested = userParticipation.status === "interested";
  const spotsLeft = event.max_participants - participantCount;

  return (
    <div>
      {/* Breadcrumbs */}
      <PageHeader
        breadcrumbs={[
          { label: "イベント一覧", href: "/events" },
          { label: event.title, current: true },
        ]}
      />

      {/* <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3"> */}
      <EventPage />
    </div>
  );
}
