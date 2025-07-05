// app/orgs/[id]/page.tsx
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import MemberPanel from "@/components/common/MemberPanel";

interface OrganizationPageProps {
  params: {
    id: string;
  };
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { id } = await params;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "運営", href: "/orgs" },
          { label: "組織管理", current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-4 mt-2  mx-auto w-full">
        <MemberPanel />
      </div>
    </div>
  );
}
