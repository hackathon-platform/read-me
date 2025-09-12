import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { ProfileContent } from "@/components/me/ProfileContent";
import { getProfileByUsername } from "@/lib/supabase/get/profile";
import { FollowRail } from "@/components/follow/FollowRail";

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
      <div className="animate-in fade-in duration-500 mt-2 lg:mt-4 px-3 md:px-5 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ProfileContent profile={profile} />
          </div>
          <div className="hidden lg:block">
            <FollowRail />
          </div>
        </div>
      </div>
    </>
  );
}
