// src/components/auth/signup-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleLoginButton from "./GoogleLoginButton";
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return supabase.auth.onAuthStateChange((event, session) => {}).data
      .subscription.unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      setIsLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
        data: { locale: "ja" }, // any metadata you want
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError("ユーザー登録に失敗しました。");
      setIsLoading(false);
      return;
    }

    toast.success(
      "登録完了！確認メールを送りました。メール内リンクをクリックしてからログインしてください。",
    );
    router.push("/auth/login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="signup-email">メールアドレス</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="signup-password">パスワード</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登録中…" : "新規登録"}
            </Button>

            {/* Or sign up with Google */}
            {/* <div className="pt-2">
              <GoogleLoginButton />
            </div> */}

            <p className="mt-4 text-center text-sm">
              <a href="/auth/login" className="underline">
                すでにアカウントをお持ちの方はこちら
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
