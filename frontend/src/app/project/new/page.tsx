import PageHeader from "@/components/layout/PageHeader";

export default async function CreateProject() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "プロジェクト", href: "/project" },
          { label: "作成", href: "/project/create" },
        ]}
      />
    </>
  );
}
