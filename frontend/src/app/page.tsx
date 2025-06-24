import PageHeader from "@/components/layout/PageHeader";

export default function Page() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Main page", href: "#" },
          { label: "Data Fetching", current: true },
        ]}
      />
      <div className="animate-in fade-in duration-500 lg:mt-6 md:mt-2 max-w-7xl mx-auto w-full pb-3">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
      <div>
        testtesttesttesttesttesttesttesttesttesttesttesttesttest
        testtesttesttesttesttesttesttesttesttesttestte
        sttesttesttesttesttesttest
      </div>
      </div>
    </div>
  );
}
