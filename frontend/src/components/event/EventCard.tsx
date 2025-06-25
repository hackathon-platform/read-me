import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Code,
  Sparkles,
  Timer,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Event } from "@/lib/mockData";

export default function EventCard({ event }: { event: Event }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 text-white";
      case "open":
        return "bg-green-500  text-white";
      case "ended":
        return "bg-gray-500  text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "開催予定";
      case "open":
        return "募集中";
      case "ended":
        return "受付終了";
      default:
        return status;
    }
  };

  const getLocationIcon = (location: string) => {
    return location === "online" ? (
      <Code className="w-4 h-4" />
    ) : (
      <MapPin className="w-4 h-4" />
    );
  };

  const getLocationText = (location: string) => {
    return location === "online" ? "オンライン" : "会場開催";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysInfo = () => {
    const days = getDaysUntil(event.startDate);
    if (days > 0 && days <= 3) {
      return {
        text: `あと${days}日`,
        color: "bg-gradient-to-r from-red-500 to-orange-500",
        icon: <AlertCircle size={14} />,
      };
    } else if (days > 3 && days <= 7) {
      return {
        text: `あと${days}日`,
        color: "bg-gradient-to-r from-orange-500 to-yellow-500",
        icon: <Timer size={14} />,
      };
    } else if (days > 7) {
      return {
        text: `あと${days}日`,
        color: "bg-gradient-to-r from-blue-500 to-cyan-500",
        icon: <Clock size={14} />,
      };
    } else if (days === 0) {
      return {
        text: "本日開催",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: <Sparkles size={14} />,
      };
    } else {
      return {
        text: `${Math.abs(days)}日前`,
        color: "bg-gradient-to-r from-gray-400 to-gray-500",
        icon: <Clock size={14} />,
      };
    }
  };

  const daysInfo = getDaysInfo();

  return (
    <Card className="p-0 rounded-none group relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Days Badge - 常に表示 */}
      <div className="absolute top-3 left-3 z-20">
        <div className={`${daysInfo.color} text-white px-3 py-1 rounded-full shadow-lg`}>
          <div className="flex items-center gap-1">
            {daysInfo.icon}
            <span className="font-bold text-xs">
              {daysInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="relative w-full h-44 overflow-hidden">
          <Image
            src={event.image}
            alt={event.titleJa}
            fill
            style={{ objectFit: "cover" }}
          />
          
          {/* Bookmark button */}
          <Button
            onClick={handleBookmark}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200"
            aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-700 hover:text-yellow-600 transition-colors" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Status & Date */}
          <div className="flex justify-between items-center mb-2">
            <Badge className={`${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(event.startDate)}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {event.titleJa}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Organizer & Footer */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t">
            <span className="text-sm font-medium">{event.organizerJa}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
              <Users size={16} />
              <span>{event.participants.current}/{event.participants.max}</span>
            </div>
            <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
              {getLocationIcon(event.location)}
              <span>{getLocationText(event.location)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}