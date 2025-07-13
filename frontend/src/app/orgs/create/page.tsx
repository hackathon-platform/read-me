// src/app/orgs/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createOrganization } from "@/lib/api/organization";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();

  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [bannerUrl, setbannerUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("ログインが必要です");
      return;
    }
    if (!name || !orgName) {
      toast.error("名前とスラッグは必須です");
      return;
    }

    setLoading(true);
    try {
      const org = await createOrganization({
        name,
        orgName,
        description,
        website,
        email,
        banner_url: bannerUrl,
        icon_url: iconUrl,
        created_by: user.id,
      });

      toast.success("組織を作成しました");
      router.push(`/orgs/${org.orgName}`);
    } catch (err: any) {
      toast.error(err.message || "作成に失敗しました");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>新しい組織を作成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="組織名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="スラッグ (英数字のみ)"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Textarea
            placeholder="組織の説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="ウェブサイト (任意)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Input
            placeholder="連絡先メール (任意)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="バナー画像URL (任意)"
            value={bannerUrl}
            onChange={(e) => setbannerUrl(e.target.value)}
          />
          <Input
            placeholder="アイコン画像URL (任意)"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "作成中..." : "作成する"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
