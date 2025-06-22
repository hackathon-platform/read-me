import { Event, Organization, Organizer } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

// モックデータ
const mockEvents: Event[] = [];

const mockOrganizations: Organization[] = [];

const mockMembers: Organizer[] = [];


export default function OrganizerDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent>

        </CardContent>
      </Card>
    </div>
  );
}