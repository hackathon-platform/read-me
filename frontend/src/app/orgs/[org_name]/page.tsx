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
        member panel here
      </div>
    </div>
  );
}
