"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export function ProfileSetupForm() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameKana, setFirstNameKana] = useState("");
  const [lastNameKana, setLastNameKana] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // for preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // for upload
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="text-center py-20">読み込み中…</div>;
  }

  const uploadImageToSupabase = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) cb(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size / 1024 / 1024 > 10) {
        toast.error("画像は10MB以下にしてください。");
        return;
      }
      handleFile(file, setImageUrl);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !username.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !firstNameKana.trim() ||
      !lastNameKana.trim()
    ) {
      setError("すべての必須項目を入力してください。");
      return;
    }
    if (!user?.id) {
      setError("認証エラー。再度ログインしてください。");
      return;
    }

    setIsSaving(true);

    let uploadedImageUrl = null;
    if (selectedFile) {
      try {
        uploadedImageUrl = await uploadImageToSupabase(selectedFile, user.id);
      } catch (err: any) {
        setError(`画像のアップロードに失敗しました: ${err.message}`);
        setIsSaving(false);
        return;
      }
    }

    const { error: upsertError } = await supabase.from("profile").upsert({
      id: user.id,
      auth_id: user.id,
      username: username.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      first_name_kana: firstNameKana.trim(),
      last_name_kana: lastNameKana.trim(),
      image_url: uploadedImageUrl ?? null,
    });

    if (upsertError) {
      setError(upsertError.message);
      setIsSaving(false);
    } else {
      toast.success("プロフィールを登録しました。");
      router.replace(`/me/${username.trim()}`);
    }
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

            <div className="flex flex-col items-center">
              <Avatar
                className="h-24 w-24 mb-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage src={imageUrl} />
                <AvatarFallback>写真</AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImage}
                className="hidden"
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
                3文字以上、英数字とアンダースコア(_)のみ可。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastName">姓</Label>
                <Input
                  id="lastName"
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="太郎"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastNameKana">姓（フリガナ）</Label>
                <Input
                  id="lastNameKana"
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
                  value={firstNameKana}
                  onChange={(e) => setFirstNameKana(e.target.value)}
                  placeholder="タロウ"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isSaving}>
              {isSaving ? "保存中…" : "プロフィールを登録"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
