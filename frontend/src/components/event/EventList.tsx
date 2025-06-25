"use client";

import React, { useState } from "react";
import { Search, Filter, SortAsc, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import EventCard from "@/components/event/EventCard";
import { mockEvents } from "@/lib/mockData";

const EventList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.titleJa.includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.themeJa.includes(searchTerm) ||
      event.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    const matchesLocation =
      locationFilter === "all" || event.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Sort filtered events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "title":
        return a.titleJa.localeCompare(b.titleJa);
      case "participants":
        return b.participants.current - a.participants.current;
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    const counts = {
      all: mockEvents.length,
      upcoming: mockEvents.filter(e => e.status === "upcoming").length,
      open: mockEvents.filter(e => e.status === "open").length,
      ended: mockEvents.filter(e => e.status === "ended").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const hasActiveFilters = searchTerm || statusFilter !== "all" || locationFilter !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
  };

  // Filter content component (reused in both desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-4">
      {/* Status Filter with Counts */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          ステータス
        </label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              すべて ({statusCounts.all})
            </SelectItem>
            <SelectItem value="upcoming">
              開催予定 ({statusCounts.upcoming})
            </SelectItem>
            <SelectItem value="open">
              募集中 ({statusCounts.open})
            </SelectItem>
            <SelectItem value="ended">
              受付終了 ({statusCounts.ended})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          開催形式
        </label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="開催形式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="online">オンライン</SelectItem>
            <SelectItem value="in-person">会場開催</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          並び順
        </label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">開催日順</SelectItem>
            <SelectItem value="title">タイトル順</SelectItem>
            <SelectItem value="participants">参加者数順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
        >
          フィルターをクリア
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen md:px-4">
      <div className="py-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            イベント一覧
          </h1>
          <p className="text-muted-foreground">
            技術イベントやハッカソンを探して参加しよう
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Desktop Sidebar Filters - Hidden on mobile */}
          <aside className="hidden lg:block">
            <Card className="sticky top-4 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Filter className="w-4 h-4" />
                  フィルター
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="col-span-1 lg:col-span-3">
            {/* Mobile Filter Section */}
            <div className="lg:hidden">
              {/* Search and Filter Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search Box */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="イベント名、テーマ、技術で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Mobile Filter Toggle Button */}
                <Button 
                  variant="outline" 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  フィルター
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {[statusFilter !== "all", locationFilter !== "all", searchTerm].filter(Boolean).length}
                    </Badge>
                  )}
                  {isFilterOpen ? (
                    <ChevronUp className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              </div>

              {/* Collapsible Filter Content */}
              {isFilterOpen && (
                <Card className="mb-6">
                  <CardContent>
                    <FilterContent />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop Search Box */}
            <div className="hidden lg:block mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="イベント名、テーマ、技術で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {sortedEvents.length}
                  </span>
                  {' '}件のイベントが見つかりました
                </p>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    "{searchTerm}" で検索中
                  </Badge>
                )}
              </div>
            </div>

            {/* Event Grid */}
            {sortedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((event) => (
                  <Link
                    href={`/events/${event.id}`}
                    key={event.id}
                    className="group block"
                  >
                    <EventCard event={event} />
                  </Link>
                ))}
              </div>
            ) : (
              /* Enhanced No Results */
              <Card className="text-center py-16 shadow-lg">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <Filter className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      イベントが見つかりませんでした
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      検索条件やフィルターを調整してみてください。新しいイベントは随時追加されています。
                    </p>
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                    >
                      すべてのフィルターをクリア
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Load More Button (for future pagination) */}
            {sortedEvents.length > 0 && sortedEvents.length >= 12 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  さらに読み込む
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EventList;