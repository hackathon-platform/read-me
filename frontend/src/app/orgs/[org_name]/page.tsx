// src/app/orgs/[slug]/page.tsx
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import MemberPanel from "@/components/common/MemberPanel";
import { getOrganizationBySlug } from "@/lib/api/organization";

export default async function OrganizationPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  let organization = null;
  try {
    organization = await getOrganizationBySlug(slug);
  } catch (e) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "運営", href: "/orgs" },
          { label: organization.name, current: true },
        ]}
      />

      <div className="mt-6">
        {/* <MemberPanel organizationId={organization.id} /> */}
        {organization.banner_url && (
          <img
            src={organization.banner_url}
            alt="Banner"
            className="w-full h-[200px] object-cover rounded-md"
          />
        )}

        <div className="flex items-center space-x-3 mt-4">
          {organization.icon_url && (
            <img
              src={organization.icon_url}
              alt="Icon"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-semibold">{organization.name}</h1>
        </div>
      </div>
    </div>
  );
}
