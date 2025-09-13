import Link from "next/link";
import { supabase } from "@/lib/supabase/supabaseClient";

export default async function EventIndex() {
  const { data: events } = await supabase
    .from('event')
    .select('id,name,slug, banner_url')
    .order('created_at', { ascending: false });

  return (
    <ul className="space-y-2">
      {events?.map((e) => (
        <>
        
        <li key={e.id}>
          <Link href={`/event/${e.slug}`} className="hover:underline">
            {e.name}
          </Link>
        </li>
        </>
      ))}
    </ul>
  );
}
