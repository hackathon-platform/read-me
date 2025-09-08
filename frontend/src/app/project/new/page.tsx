// app/event/page.tsx (一覧)
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
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
    // <ul className="space-y-2">
    //   {events?.map((e) => (
    //     <li key={e.id}>
    //       <Link href={`/event/${e.slug}`} className="hover:underline">
    //         {e.name}
    //       </Link>
    //     </li>
    //   ))}
    // </ul>
  );
}
