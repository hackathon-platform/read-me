"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Code,
  Filter,
  Search,
  ExternalLink,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  titleJa: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: "online" | "in-person";
  venue?: string;
  venueJa?: string;
  status: "upcoming" | "open" | "ended";
  participants: {
    current: number;
    max: number;
  };
  prizes: string;
  theme: string;
  themeJa: string;
  organizer: string;
  organizerJa: string;
  image: string;
  tags: string[];
  featured?: boolean;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Virtual Innovation Hackathon 2025",
    titleJa: "渦潮ハッカソン2025 ～バーチャル空間で描く鳴門市の未来～",
    description:
      "Design the future of smart cities in virtual space. Join developers, designers, and innovators in a 48-hour coding marathon.",
    startDate: "2025-09-15",
    endDate: "2025-09-17",
    registrationDeadline: "2025-09-01",
    location: "online",
    venue: "Virtual Naruto City Hall",
    venueJa: "バーチャル鳴門市役所",
    status: "upcoming",
    participants: { current: 32, max: 40 },
    prizes: "¥900,000",
    theme: "Smart Cities & Social Impact",
    themeJa: "スマートシティ・社会課題解決",
    organizer: "TechHub Japan",
    organizerJa: "テックハブ・ジャパン",
    image:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["AI/ML", "IoT", "スマートシティ", "社会課題"],
    featured: true,
  },
  {
    id: "2",
    title: "Tokyo FinTech Challenge",
    titleJa: "東京フィンテック・チャレンジ2025",
    description:
      "Revolutionary financial technology solutions for the next generation. Build the future of digital payments and blockchain.",
    startDate: "2025-08-20",
    endDate: "2025-08-22",
    registrationDeadline: "2025-08-10",
    location: "in-person",
    venue: "Tokyo Tech Center, Shibuya",
    venueJa: "東京テックセンター（渋谷）",
    status: "open",
    participants: { current: 45, max: 60 },
    prizes: "¥1,500,000",
    theme: "Financial Technology",
    themeJa: "フィンテック・金融技術",
    organizer: "FinTech Tokyo",
    organizerJa: "フィンテック東京",
    image:
      "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["ブロックチェーン", "フィンテック", "決済", "DeFi"],
  },
  {
    id: "3",
    title: "Green Tech Innovation Summit",
    titleJa: "グリーンテック・イノベーション・サミット",
    description:
      "Sustainable technology solutions for environmental challenges. Create impactful solutions for climate change.",
    startDate: "2025-07-10",
    endDate: "2025-07-12",
    registrationDeadline: "2025-06-30",
    location: "in-person",
    venue: "Osaka Innovation Hub",
    venueJa: "大阪イノベーションハブ",
    status: "ended",
    participants: { current: 38, max: 40 },
    prizes: "¥800,000",
    theme: "Environmental Technology",
    themeJa: "環境技術・持続可能性",
    organizer: "GreenTech Alliance",
    organizerJa: "グリーンテック・アライアンス",
    image:
      "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["持続可能性", "クリーンテック", "環境", "エネルギー"],
  },
  {
    id: "4",
    title: "Healthcare AI Hackathon",
    titleJa: "ヘルスケアAIハッカソン2025",
    description:
      "Artificial intelligence solutions for modern healthcare challenges. Build tools that save lives and improve patient care.",
    startDate: "2025-10-05",
    endDate: "2025-10-07",
    registrationDeadline: "2025-09-25",
    location: "online",
    venue: "Virtual Medical Center",
    venueJa: "バーチャル医療センター",
    status: "upcoming",
    participants: { current: 28, max: 50 },
    prizes: "¥1,200,000",
    theme: "Healthcare & AI",
    themeJa: "ヘルスケア・人工知能",
    organizer: "MedTech Innovation",
    organizerJa: "メドテック・イノベーション",
    image:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["ヘルスケア", "AI/ML", "医療", "イノベーション"],
    featured: true,
  },
  {
    id: "5",
    title: "Gaming & VR Experience Jam",
    titleJa: "ゲーミング・VR体験ジャム",
    description:
      "Create immersive gaming experiences and virtual reality applications. Push the boundaries of interactive entertainment.",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    registrationDeadline: "2025-07-20",
    location: "in-person",
    venue: "Gaming Arena Tokyo",
    venueJa: "ゲーミングアリーナ東京",
    status: "open",
    participants: { current: 52, max: 80 },
    prizes: "¥600,000",
    theme: "Gaming & Virtual Reality",
    themeJa: "ゲーミング・バーチャルリアリティ",
    organizer: "GameDev Tokyo",
    organizerJa: "ゲームデブ東京",
    image:
      "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["ゲーミング", "VR/AR", "Unity", "エンターテイメント"],
  },
  {
    id: "6",
    title: "EdTech Learning Revolution",
    titleJa: "エドテック学習革命ハッカソン",
    description:
      "Transform education through technology. Build platforms and tools that make learning accessible and engaging for everyone.",
    startDate: "2025-06-15",
    endDate: "2025-06-17",
    registrationDeadline: "2025-06-05",
    location: "online",
    venue: "Virtual Education Hub",
    venueJa: "バーチャル教育ハブ",
    status: "ended",
    participants: { current: 35, max: 40 },
    prizes: "¥700,000",
    theme: "Educational Technology",
    themeJa: "教育技術・EdTech",
    organizer: "EduTech Japan",
    organizerJa: "エドテック・ジャパン",
    image:
      "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
    tags: ["教育", "Eラーニング", "EdTech", "アクセシビリティ"],
  },
];

const EventList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.titleJa.includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.themeJa.includes(searchTerm) ||
      event.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesLocation =
      locationFilter === "all" || event.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "open":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "ended":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "開催予定";
      case "open":
        return "募集中";
      case "ended":
        return "終了";
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                <Input
                  placeholder="イベント名、テーマ、技術で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10  placeholder-gray-400 focus:bg-white/15"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="upcoming">開催予定</SelectItem>
                    <SelectItem value="open">募集中</SelectItem>
                    <SelectItem value="ended">終了</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="開催形式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="online">オンライン</SelectItem>
                    <SelectItem value="in-person">会場開催</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm sm:text-base">
            {filteredEvents.length}件のイベントが見つかりました
          </p>
        </div>

        {/* Events List - Responsive Ticket Style */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group ${
                event.featured
                  ? "bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-red-900/40 border-pink-500/30"
                  : "bg-white/5 border-white/10"
              } backdrop-blur-sm`}
            >
              {/* Ticket Perforation Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

              {/* Featured Badge */}
              {event.featured && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-2 py-1 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    注目
                  </Badge>
                </div>
              )}

              <CardContent className="p-0">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="p-4">
                    {/* Mobile Header with Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-3">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-300 transition-colors line-clamp-2">
                          {event.titleJa}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {event.title}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge
                          className={`${getStatusColor(event.status)} font-bold px-3 py-1 text-xs whitespace-nowrap`}
                        >
                          {getStatusText(event.status)}
                        </Badge>
                        {event.status === "upcoming" && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-pink-400">
                              {getDaysUntil(event.startDate)}
                            </div>
                            <div className="text-xs text-gray-400">日後</div>
                          </div>
                        )}
                        {event.status === "open" && (
                          <div className="text-right">
                            <div className="text-xs text-green-400 font-medium flex items-center">
                              <Zap className="w-3 h-3 mr-1" />
                              募集中
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Event Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium">
                            {formatDate(event.startDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            〜 {formatDate(event.endDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-300 text-sm">
                        {getLocationIcon(event.location)}
                        <div className="ml-2">
                          <div className="font-medium">
                            {getLocationText(event.location)}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {event.venueJa}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-pink-400" />
                          <span className="font-medium">
                            {event.participants.current}/
                            {event.participants.max}名
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Trophy className="w-4 h-4 mr-2 text-pink-400" />
                          <span className="font-medium">{event.prizes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Theme and Tags */}
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-400">テーマ: </span>
                        <span className="text-white font-medium">
                          {event.themeJa}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-pink-500/10 text-pink-300 border-pink-500/20 px-2 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1"
                          >
                            +{event.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Mobile Action Button */}
                    <div className="flex justify-end">
                      {event.status === "open" && (
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-4 py-2 text-sm">
                          参加申込
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                      {event.status === "upcoming" && (
                        <Button
                          variant="outline"
                          className="border-pink-500/50 text-pink-300 hover:bg-pink-500/10 px-4 py-2 text-sm"
                        >
                          詳細を見る
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                      {event.status === "ended" && (
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-400 cursor-not-allowed px-4 py-2 text-sm"
                          disabled
                        >
                          終了済み
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex">
                  {/* Left Section - Event Image */}
                  <div className="relative w-32 md:w-48 h-24 md:h-32 flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.titleJa}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4 md:p-6 flex justify-between">
                    <div className="flex-1 space-y-2 md:space-y-3">
                      {/* Title Section */}
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
                          {event.titleJa}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-400">
                          {event.title}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 text-sm">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-xs md:text-sm">
                              {formatDate(event.startDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              〜 {formatDate(event.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-300">
                          {getLocationIcon(event.location)}
                          <div className="ml-2">
                            <div className="font-medium text-xs md:text-sm">
                              {getLocationText(event.location)}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {event.venueJa}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-xs md:text-sm">
                              {event.participants.current}/
                              {event.participants.max}名
                            </div>
                            <div className="text-xs text-gray-500">
                              参加者数
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-300">
                          <Trophy className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-xs md:text-sm">
                              {event.prizes}
                            </div>
                            <div className="text-xs text-gray-500">
                              賞金総額
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Theme and Tags */}
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-400">テーマ: </span>
                          <span className="text-white font-medium">
                            {event.themeJa}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 4).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-pink-500/10 text-pink-300 border-pink-500/20 px-2 py-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {event.tags.length > 4 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1"
                            >
                              +{event.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status and Action */}
                    <div className="flex flex-col items-end justify-between ml-4 md:ml-6 min-w-[120px] md:min-w-[140px]">
                      {/* Status Badge */}
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          className={`${getStatusColor(event.status)} font-bold px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm whitespace-nowrap`}
                        >
                          {getStatusText(event.status)}
                        </Badge>

                        {event.status === "upcoming" && (
                          <div className="text-right">
                            <div className="text-xl md:text-2xl font-bold text-pink-400">
                              {getDaysUntil(event.startDate)}
                            </div>
                            <div className="text-xs text-gray-400">
                              日後開催
                            </div>
                          </div>
                        )}

                        {event.status === "open" && (
                          <div className="text-right">
                            <div className="text-sm text-green-400 font-medium flex items-center">
                              <Zap className="w-3 h-3 mr-1" />
                              募集中
                            </div>
                            <div className="text-xs text-gray-400">
                              締切: {formatDate(event.registrationDeadline)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-4">
                        {event.status === "open" && (
                          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-4 md:px-6 py-2 text-sm">
                            参加申込
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        )}
                        {event.status === "upcoming" && (
                          <Button
                            variant="outline"
                            className="border-pink-500/50 text-pink-300 hover:bg-pink-500/10 px-4 md:px-6 py-2 text-sm"
                          >
                            詳細を見る
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </Button>
                        )}
                        {event.status === "ended" && (
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-400 cursor-not-allowed px-4 md:px-6 py-2 text-sm"
                            disabled
                          >
                            終了済み
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              イベントが見つかりませんでした
            </h3>
            <p className="text-gray-500">
              検索条件やフィルターを調整してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
