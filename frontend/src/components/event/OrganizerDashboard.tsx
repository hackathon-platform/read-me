import { Event, Organization, Organizer } from "@/lib/types";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Calendar, Building2 } from "lucide-react";

// モックデータ
const mockEvents: Event[] = [];

const mockOrganizations: Organization[] = [];

const mockMembers: Organizer[] = [];


export default function OrganizerDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:px-4">
      <Card>
        <CardContent>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
              最近のイベント
            </CardTitle>
          <CardDescription>
            最新のイベントとその状況
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            組織
          </CardTitle>
          <CardDescription>
            所属している組織
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}