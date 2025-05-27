"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Filter,
  MapPin,
  Search as SearchIcon,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Event categories
const EVENT_CATEGORIES = [
  "All Categories",
  "Conference",
  "Workshop",
  "Networking",
  "Party",
  "Concert",
  "Exhibition",
  "Sports",
  "Community",
  "Charity",
  "Other",
];

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All Categories",
  );
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date")
      ? new Date(searchParams.get("date") as string)
      : undefined,
  );
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = category !== "All Categories" || location || date;

  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    if (category && category !== "All Categories")
      params.set("category", category);
    if (location) params.set("location", location);
    if (date) params.set("date", date.toISOString());

    router.push(`/events?${params.toString()}`);
  }, [searchQuery, category, location, date, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const clearFilters = () => {
    setCategory("All Categories");
    setLocation("");
    setDate(undefined);

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/events?${params.toString()}`);
  };

  const removeFilter = (filter: "category" | "location" | "date") => {
    if (filter === "category") setCategory("All Categories");
    if (filter === "location") setLocation("");
    if (filter === "date") setDate(undefined);

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filter !== "category" && category !== "All Categories")
      params.set("category", category);
    if (filter !== "location" && location) params.set("location", location);
    if (filter !== "date" && date) params.set("date", date.toISOString());

    router.push(`/events?${params.toString()}`);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== (searchParams.get("q") || "")) {
        updateSearchParams();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchParams, updateSearchParams]);

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col space-y-4">
      <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    >
                      {(category !== "All Categories" ? 1 : 0) +
                        (location ? 1 : 0) +
                        (date ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Category</h4>
                    <Select
                      value={category}
                      onValueChange={(value) => {
                        setCategory(value);
                        // Auto-apply filter when changed
                        setTimeout(() => updateSearchParams(), 100);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Location</h4>
                    <div className="flex">
                      <MapPin className="mr-2 h-4 w-4 mt-2.5 text-muted-foreground" />
                      <Input
                        placeholder="City or venue"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Date</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateSearchParams();
                        setShowFilters(false);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {category !== "All Categories" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {category}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFilter("category")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFilter("location")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {date && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(date, "MMM d, yyyy")}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFilter("date")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
