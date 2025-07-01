"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/components/supabase-provider";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export function useUserData() {
  const { user: supabaseUser, signOut, loading } = useSupabase();
  const [user, setUser] = useState<User | null>(supabaseUser);
  const [isLoading, setIsLoading] = useState(loading);
  const prevUserRef = useRef<User | null>(supabaseUser);

  useEffect(() => {
    // Only update if specific fields have changed
    const hasUserChanged = 
      prevUserRef.current?.id !== supabaseUser?.id ||
      prevUserRef.current?.email !== supabaseUser?.email ||
      prevUserRef.current?.first_name !== supabaseUser?.first_name ||
      prevUserRef.current?.last_name !== supabaseUser?.last_name ||
      prevUserRef.current?.image_url !== supabaseUser?.image_url;

    if (hasUserChanged) {
      setUser(supabaseUser);
      prevUserRef.current = supabaseUser;
    }
  }, [supabaseUser]);

  useEffect(() => {
    // Update loading state only if it changed
    if (loading !== isLoading) {
      setIsLoading(loading);
    }
  }, [loading, isLoading]);

  return { user, signOut, loading: isLoading };
}