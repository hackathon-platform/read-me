import PageLayout from "@/components/layout/pageLayout";
import EventSkeleton from "@/components/event-skeleton";
import EventList from "@/components/event-list";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function EventsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    category?: string;
    location?: string;
    date?: string;
  };
}) {
  return (
    <PageLayout>
      <div className="md:flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ← left filter panel */}
        <aside className="w-full md:w-1/4 max-w-52 p-4 space-y-6">
          {/* Location */}
          {/* <SearchFilter/> */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-location-online" />
                <Label htmlFor="filter-location-online">Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-location-inperson" />
                <Label htmlFor="filter-location-inperson">In-person</Label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-status-upcoming" />
                <Label htmlFor="filter-status-upcoming" className="flex items-center">
                  Upcoming
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-orange-600" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-status-open" />
                <Label htmlFor="filter-status-open" className="flex items-center">
                  Open
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-600" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-status-ended" />
                <Label htmlFor="filter-status-ended" className="flex items-center">
                  Ended
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-gray-600" />
                </Label>
              </div>
            </div>
          </div>

          {/* Length */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Length</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-length-short" />
                <Label htmlFor="filter-length-short">1–6 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-length-medium" />
                <Label htmlFor="filter-length-medium">1–4 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-length-long" />
                <Label htmlFor="filter-length-long">1+ month</Label>
              </div>
            </div>
          </div>

        </aside>

        {/* ← divider */}
        <Separator orientation="vertical" className="hidden md:block" />

        {/* → event list */}
        <section className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<EventSkeleton />}>
            <EventList searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </PageLayout>
  );
}
