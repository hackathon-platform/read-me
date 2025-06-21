"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";

// Zod schema for validation
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
  onSave: () => void;
}

export function ProfileEdit({ initialData, onCancel, onSave }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl);
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
        initialData.social?.map((social) => ({
          platform: platformEnum.includes(
            social.platform as (typeof platformEnum)[number],
          )
            ? (social.platform as (typeof platformEnum)[number])
            : "other",
          url: social.url,
        })) || [],
    },
  });

  const descriptionValue = form.watch("description") || "";
  const remaining = 100 - descriptionValue.length;

  // Handle image preview
  const handleFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => e.target?.result && cb(e.target.result as string);
    reader.readAsDataURL(file);
  };
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, setImageUrl);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social",
  });

  const getIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "github":
        return "GitHub";
      case "linkedin":
        return "LinkedIn";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      case "other":
        return "その他";
      default:
        return platform;
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const { error: profileError } = await supabase
      .from("profile")
      .update({
        username: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        first_name_kana: values.firstNameKana,
        last_name_kana: values.lastNameKana,
        image_url: imageUrl || null,
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
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
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
          >
            {imageUrl ? "画像を変更" : "プロフィール画像をアップロード"}
          </Button>
        </div>

        {/* Username Field */}
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

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <Label className="pl-0.5">性</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <Label className="pl-0.5">名</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastNameKana"
            render={({ field }) => (
              <FormItem>
                <Label className="pl-0.5">セイ</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstNameKana"
            render={({ field }) => (
              <FormItem>
                <Label className="pl-0.5">メイ</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Field with Counter */}
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
                  maxLength={300}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Social Links */}
        {/* Social Links Section */}
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
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
