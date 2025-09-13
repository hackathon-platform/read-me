// src/hooks/useCanEdit.ts
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";

export function useCanEditProfile(targetProfileId: string | undefined) {
  const [can, setCan] = useState(false);
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCan(!!user?.id && !!targetProfileId && user.id === targetProfileId);
    })();
  }, [targetProfileId]);
  return can;
}

export function useCanEditProject(ownerProfileId: string | undefined) {
  // プロジェクトのownerは project.profile_id
  return useCanEditProfile(ownerProfileId);
}

export function useCanEditEvent(eventId: string | undefined) {
  const [can, setCan] = useState(false);
  useEffect(() => {
    (async () => {
      if (!eventId) return setCan(false);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return setCan(false);
      const { data } = await supabase
        .from("participant")
        .select("id")
        .eq("event_id", eventId)
        .eq("profile_id", user.id)
        .in("role", ["owner", "admin"])
        .limit(1)
        .maybeSingle();
      setCan(!!data);
    })();
  }, [eventId]);
  return can;
}
