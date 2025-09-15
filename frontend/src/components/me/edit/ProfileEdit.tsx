"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const platformEnum = [
  "github",
  "linkedin",
  "instagram",
  "facebook",
  "other",
] as const;

const schema = z.object({
  username: z
    .string()
    .min(3, "3文字以上で入力してください")
    .regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ可"),
  firstName: z.string().min(1, "名を入力してください"),
  lastName: z.string().min(1, "姓を入力してください"),
  firstNameKana: z.string().min(1, "名（フリガナ）を入力してください"),
  lastNameKana: z.string().min(1, "姓（フリガナ）を入力してください"),
  description: z.string().max(100, "１００文字以内で入力して下さい").optional(),
  social: z
    .array(
      z.object({
        platform: z.enum(platformEnum),
        url: z.string().url("URL形式で入力してください"),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initialData: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    firstNameKana: string;
    lastNameKana: string;
    imageUrl: string;
    description?: string;
    social?: { platform: string; url: string }[];
  };
  onCancel: () => void;
  onSave: () => void; // 保存成功時にDrawerを閉じる
  formId?: string; // 追加：外部フッターからsubmitするためのID
}

export function ProfileEdit({
  initialData,
  onCancel,
  onSave,
  formId = "profile-edit-form",
}: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: initialData.username,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      firstNameKana: initialData.firstNameKana,
      lastNameKana: initialData.lastNameKana,
      description: initialData.description ?? "",
      social:
        initialData.social?.map((s) => ({
          platform: platformEnum.includes(s.platform as any)
            ? (s.platform as (typeof platformEnum)[number])
            : "other",
          url: s.url,
        })) || [],
    },
  });

  const descriptionValue = form.watch("description") || "";
  const remaining = 100 - descriptionValue.length;

  const uploadImageToSupabase = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => e.target?.result && cb(e.target.result as string);
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    let uploadedImageUrl = imageUrl;

    if (selectedFile) {
      try {
        uploadedImageUrl = await uploadImageToSupabase(
          selectedFile,
          initialData.id,
        );
      } catch (err: any) {
        toast.error(`画像アップロードに失敗しました: ${err.message}`);
        setIsSaving(false);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profile")
      .update({
        username: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        first_name_kana: values.firstNameKana,
        last_name_kana: values.lastNameKana,
        image_url: uploadedImageUrl || null,
        description: values.description,
      })
      .eq("id", initialData.id);

    if (profileError) {
      toast.error(profileError.message);
      setIsSaving(false);
      return;
    }

    await supabase.from("social").delete().eq("profile_id", initialData.id);

    if (values.social && values.social.length) {
      const payload = values.social.map((s) => ({
        profile_id: initialData.id,
        platform: s.platform,
        url: s.url,
      }));
      const { error: socialsError } = await supabase
        .from("social")
        .insert(payload);
      if (socialsError) {
        toast.error(socialsError.message);
        setIsSaving(false);
        return;
      }
    }

    toast.success("基本情報を更新しました");
    onSave();

    if (values.username !== initialData.username) {
      router.replace(`/profile/${values.username}`);
    } else {
      router.refresh();
    }

    setIsSaving(false);
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pt-2"
      >
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
          {/* 左：画像セクション（ワイド時は固定） */}
          <div className="mb-8 lg:mb-0 lg:sticky lg:top-0 lg:self-start">
            <div className="flex flex-col items-center lg:items-start">
              <Avatar
                className="h-24 w-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
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
                className="w-full lg:w-auto"
              >
                {imageUrl ? "画像を変更" : "プロフィール画像をアップロード"}
              </Button>
            </div>
          </div>

          {/* 右：その他フォーム項目 */}
          <div className="space-y-8">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Label className="pl-0.5">アカウント名</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  "lastName",
                  "firstName",
                  "lastNameKana",
                  "firstNameKana",
                ] as const
              ).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="pl-0.5">
                        {
                          {
                            lastName: "姓",
                            firstName: "名",
                            lastNameKana: "セイ",
                            firstNameKana: "メイ",
                          }[name]
                        }
                      </Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label
                    className={`pl-0.5 ${remaining <= 0 ? "text-red-500" : ""}`}
                  >
                    自己紹介（残り{remaining}文字）
                  </Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      maxLength={100}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div>
              <Label className="pl-0.5 mb-2 block">SNSリンク</Label>
              {fields.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 mb-2">
                  <FormField
                    control={form.control}
                    name={`social.${idx}.platform`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {platformEnum.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`social.${idx}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="URLを入力"
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(idx)}
                    disabled={isSaving}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ platform: "github", url: "" })}
                disabled={isSaving}
              >
                <Plus className="mr-1 w-4 h-4" />
                SNSリンク追加
              </Button>
            </div>
          </div>
        </div>
        {/* 足元ボタンはDrawerFooter側で制御 */}
      </form>
    </Form>
  );
}
