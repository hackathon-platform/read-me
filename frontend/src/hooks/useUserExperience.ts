// hooks/useUserExperience.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Experience } from "@/lib/types";

export function useUserExperience(profileId: string) {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("profile_id", profileId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error loading experience:", error);
      } else {
        // cast / map your DB fields to your front-end Experience type
        setItems(
          data.map((d) => ({
            profileId: d.profile_id,
            company: d.company,
            position: d.position,
            startDate: d.start_date.slice(0, 7),
            endDate: d.end_date ? d.end_date.slice(0, 7) : "present",
            description: d.description,
            iconUrl: d.icon_url || "",
            url: d.url || "",
            skills: [], // handle separately…
          })),
        );
      }
      setLoading(false);
    }
    if (profileId) load();
  }, [profileId]);

  return { items, setItems, loading };
}
