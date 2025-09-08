import PageHeader from "@/components/layout/PageHeader";
import EventList from "@/components/event/EventList";

export default function EventsPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "イベント一覧", href: "/events", current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2 max-w-7xl mx-auto w-full pb-3">
        参加中のイベント
      </div>
    </div>
  );
}
