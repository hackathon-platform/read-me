// src/components/profile/ProfileSetupForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function ProfileSetupForm() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  // Local state for the required profile fields:
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameKana, setFirstNameKana] = useState("");
  const [lastNameKana, setLastNameKana] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // optional
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // file input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If user is not logged in, send them back to /auth/login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="text-center py-20">読み込み中…</div>;
  }

  // Handle image uploads (Base64 → state)
  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const MAX_SIZE_MB = 1;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      toast.error(`ファイルサイズは${MAX_SIZE_MB}MB以下にしてください。`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, (url) => setImageUrl(url));
  };

  // On submit, upsert into profiles
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1) validation: required fields must be non-empty
    if (
      !username.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !firstNameKana.trim() ||
      !lastNameKana.trim()
    ) {
      setError(
        "すべての必須項目（ユーザーID、氏名、フリガナ）を入力してください。",
      );
      return;
    }
    if (!user || !user.id) {
      setError("認証エラー。もう一度ログインしなおしてください。");
      return;
    }

    setIsSaving(true);

    // 2) Upsert into profiles. RLS allows only id = auth.uid().
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      first_name_kana: firstNameKana.trim(),
      last_name_kana: lastNameKana.trim(),
      image_url: imageUrl || null,
      // We leave education/socials/experience/qualifications/projects/resume_url as defaults
    });

    if (upsertError) {
      console.error("Error upserting profile:", upsertError.message);
      setError(
        upsertError.message ||
          "プロフィールの保存に失敗しました。もう一度お試しください。",
      );
      setIsSaving(false);
      return;
    }

    toast.success("プロフィールを登録しました。");
    // 3) Redirect to their newly created public page
    router.replace(`/profile/${username.trim()}`);
  };

  return (
    <div className="flex flex-col items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">最初のプロフィール設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">ユーザーID（Username）</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: genichihashi"
                required
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                3文字以上、英数字とアンダースコア(_)のみ可。他の人がこのIDで
                あなたのページ ( /profile/[username] ) を見られます。
              </p>
            </div>

            {/* Last Name / First Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastName">姓</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="山田"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">名</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="太郎"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Last Name Kana / First Name Kana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastNameKana">姓（フリガナ）</Label>
                <Input
                  id="lastNameKana"
                  type="text"
                  value={lastNameKana}
                  onChange={(e) => setLastNameKana(e.target.value)}
                  placeholder="ヤマダ"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstNameKana">名（フリガナ）</Label>
                <Input
                  id="firstNameKana"
                  type="text"
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  placeholder="タロウ"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Profile Image Upload (optional) */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-2">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="プロフィール画像プレビュー"
                    className="w-full h-full object-cover rounded-full border-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full border-2 border-dashed text-muted-foreground">
                    写真
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-input"
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
              >
                {imageUrl ? "画像を変更" : "プロフィール画像をアップロード"}
              </Button>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full mt-4" disabled={isSaving}>
              {isSaving ? "保存中…" : "プロフィールを登録"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
