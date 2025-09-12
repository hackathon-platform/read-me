"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";

export function useMyProfileId() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        if (alive) {
          setProfileId(null);
          setLoading(false);
        }
        return;
      }
      const { data: prof } = await supabase
        .from("profile")
        .select("id")
        .eq("auth_id", uid)
        .single();
      if (alive) {
        setProfileId(prof?.id ?? null);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return { profileId, loading };
}
