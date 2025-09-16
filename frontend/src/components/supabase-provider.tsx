"use client";
import { useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Database } from "@/lib/database.types";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = useMemo(getSupabaseBrowserClient, []);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("profile")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser(data || session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast("ログインに成功しました", {
        description: "おかえりなさい!👋",
      });
    } catch (error: any) {
      toast("Sign in failed", {
        description: error.message,
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await supabase.from("profile").upsert({
          id: data.user.id,
          full_name: name,
          email: email,
          updated_at: new Date().toISOString(),
        });
      }

      toast("Account created", {
        description: "Welcome to EventMaker!",
      });
    } catch (error: any) {
      toast("Sign up failed", {
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast("Signed out", {
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast("Sign out failed", {
        description: error.message,
      });
    }
  };

  const value = {
    supabase,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
