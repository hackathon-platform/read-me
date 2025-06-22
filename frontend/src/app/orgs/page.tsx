import PageHeader from "@/components/layout/PageHeader";

import OrganizerDashboard from "@/components/event/OrganizerDashboard";

export default function EventsPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "運営", current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 md:mt-2 max-w-7xl mx-auto w-full pb-3">
      <OrganizerDashboard />
      </div>
    </div>
  );
}
