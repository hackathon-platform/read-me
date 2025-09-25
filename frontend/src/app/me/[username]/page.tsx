import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { ProfileContent } from "@/components/me/ProfileContent";
import { getProfileByUsername } from "@/lib/supabase/get/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: profile } = await getProfileByUsername(username);
  if (!profile) return notFound();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロフィール", href: "/me" },
          { label: username, current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 w-full">
        <ProfileContent profile={profile} />
      </div>
    </>
  );
}
