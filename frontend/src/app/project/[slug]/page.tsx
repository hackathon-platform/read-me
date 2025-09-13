import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import PageHeader from "@/components/layout/PageHeader";
import { ProjectPreview } from "@/components/project/ProjectPreview";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("project")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return notFound();
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロジェクト", href: "/project" },
          { label: data.title, current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 mt-4 lg:mt-4 px-3 md:px-5 w-full">
        <ProjectPreview
          data={{
            title: data.title,
            summary: data.summary,
            thumbnail_url: data.thumbnail_url,
            content: data.content,
            updated_at: data.updated_at,
          }}
        />
      </div>
    </>
  );
}
