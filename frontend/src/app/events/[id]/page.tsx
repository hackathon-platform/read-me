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
  { user_id: "u1", profile: { full_name: "Alice", avatar_url: "https://i.pravatar.cc/40?img=1" } },
  { user_id: "u2", profile: { full_name: "Bob", avatar_url: "https://i.pravatar.cc/40?img=2" } },
  { user_id: "u3", profile: { full_name: "Carol", avatar_url: "https://i.pravatar.cc/40?img=3" } },
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

function EventBanner({ imageUrl, title, category, startDate, endDate, location, onShare }: EventBannerProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3">
      <div className="flex-shrink-0 w-full lg:w-1/2 aspect-[21/9] rounded-xl overflow-hidden bg-muted relative">
        <Image
          src={imageUrl}
          alt={title}
          className="object-cover"
          fill
        />
      </div>
      <div className="flex flex-col justify-center lg:w-3/4 gap-4">
        <h1 className="text-3xl font-bold leading-tight overflow-hidden line-clamp-2">{title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <Tag className="h-3 w-3" /> {category}
          </Badge>
          <Badge variant="outline">
            <Calendar className="h-3 w-3" /> {format(start, "yyyy-MM-dd")} – {format(end, "yyyy-MM-dd")}
          </Badge>
          <Badge variant="outline">
            <MapPin className="h-3 w-3" /> {location}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-max"
          onClick={onShare}
        >
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
  const isOrganizer = false;  // toggle to true to test organizer
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

      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3">
        {/* Banner + Info Side-by-Side */}
        <Card className="mb-8">
          <CardContent>
            <EventBanner
            imageUrl={event.image_url}
            title={event.title}
            category={event.category}
            startDate={event.start_date}
            endDate={event.end_date}
            location={event.location}
            onShare={() => navigator.clipboard.writeText(window.location.href)}
           />
          </CardContent>
        </Card>

        {/* Main Grid: Details and Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2">
            {/* Description */}
            <h2 className="text-xl font-semibold mb-4">About this event</h2>
            <p className="mb-8">{event.description}</p>

            {/* Attendees */}
            <h2 className="text-xl font-semibold mb-4">Attendees</h2>
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2 mr-3">
                {participants.map((p) => (
                  <Avatar key={p.user_id} className="border-2 border-background">
                    <AvatarImage src={p.profile.avatar_url} />
                    <AvatarFallback>
                      {p.profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span>{participantCount} attending</span>
            </div>
            <p className="mb-8">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Event is full"}
            </p>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-card">
              {/* Date & Time */}
              <div className="mb-4">
                <p className="font-medium">Date & Time</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <CalendarClock className="w-4 h-4" />
                  <span>
                    {format(new Date(event.start_date), "MMM d, yyyy h:mm a")} – {format(new Date(event.end_date), "h:mm a")}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <p className="font-medium">Location</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Organizer */}
              <div className="mb-4">
                <p className="font-medium">Organizer</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={organizer.avatar_url} />
                    <AvatarFallback>{organizer.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{organizer.full_name}</span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isAttending ? (
                  <Button className="w-full">You’re attending</Button>
                ) : isInterested ? (
                  <Button variant="outline" className="w-full">
                    Interested
                  </Button>
                ) : (
                  <Button className="w-full">Attend Event</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
