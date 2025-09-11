"use client";
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized session refresh function
  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();
      setSession(newSession);
      setUser(newSession?.user ?? null);
    } catch (error) {
      console.error("Error refreshing session:", error);
      setSession(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initialize session with faster initial load
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener with cleanup
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // Optimize state updates based on event type
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
}
