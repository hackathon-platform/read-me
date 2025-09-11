"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  };

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      disabled={loading}
      type="submit"
      size="lg"
      className="w-full"
    >
      <FcGoogle className="text-xl" />
      {loading ? "処理中..." : "Googleで続ける"}
    </Button>
  );
}
