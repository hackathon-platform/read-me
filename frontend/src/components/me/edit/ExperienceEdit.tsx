"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Briefcase,
  Calendar,
  Building2,
  User,
  FileText,
  X,
} from "lucide-react";
import { Experience } from "@/lib/types";
import { toast } from "sonner";

const expSchema = z.object({
  title: z.string().min(1, "役割を入力してください"),
  organization: z.string().min(1, "会社名を入力してください"),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "開始月を入力して下さい"),
  endMonth: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || ""),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || ""),
});

const schema = z.object({
  experiences: z.array(expSchema),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
  initialData: Experience[];
  onCancel: () => void; // （今回はフッターから呼ぶ想定だがシグネチャは保持）
  onSave: () => void; // 保存成功時にDrawerを閉じる
  formId?: string; // 追加：外部フッターからsubmitするためのID
}

export function ExperienceEdit({
  profileId,
  initialData,
  onSave,
  formId = "experience-edit-form",
}: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { experiences: initialData },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    // delete old entries
    await supabase.from("experience").delete().eq("profile_id", profileId);

    // insert new
    if (values.experiences.length) {
      const payload = values.experiences.map((e) => ({
        profile_id: profileId,
        title: e.title,
        organization: e.organization,
        start_month: `${e.startMonth}-01`,
        end_month: e.endMonth ? `${e.endMonth}-01` : null,
        description: e.description || null,
      }));
      const { error } = await supabase.from("experience").insert(payload);
      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }
    }

    toast.success("職歴を更新しました");
    onSave();
    router.refresh();
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-2"
      >
        {fields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                職歴がまだ登録されていません
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    title: "",
                    organization: "",
                    startMonth: "",
                    endMonth: "",
                    description: "",
                  })
                }
                disabled={isSaving}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                最初の職歴を追加
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <Card
                key={field.id}
                className="group rounded-none relative border border-border/40 hover:border-border/80 transition-all duration-200"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  disabled={isSaving}
                  className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full bg-background border border-border/60 text-muted-foreground hover:text-destructive-foreground hover:border-destructive shadow-sm transition-all duration-200 z-10"
                  title="この職歴を削除"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experiences.${idx}.organization` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Building2 className="h-3.5 w-3.5" />
                            会社・組織名
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="例：株式会社ABC"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${idx}.title` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5" />
                            役職・役割
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="例：ソフトウェアエンジニア"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <FormField
                      control={form.control}
                      name={`experiences.${idx}.startMonth` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            開始月
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="month" className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experiences.${idx}.endMonth` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            終了月
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="month"
                              placeholder="現職の場合は空欄"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experiences.${idx}.description` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">
                          <FileText className="h-3.5 w-3.5" />
                          職務内容・実績
                        </FormLabel>
                        <FormDescription className="text-xs">
                          箇条書きの場合は各行の先頭に「•」「-」「*」のいずれかを付けてください
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            rows={3}
                            placeholder="例：&#10;• Reactを使用したWebアプリケーション開発&#10;• チームリーダーとして5名のメンバーをマネジメント&#10;• 売上20%向上に貢献"
                            className="text-sm resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed border-2 h-12 text-muted-foreground hover:text-foreground hover:border-solid transition-all"
              onClick={() =>
                append({
                  title: "",
                  organization: "",
                  startMonth: "",
                  endMonth: "",
                  description: "",
                })
              }
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              職歴を追加
            </Button>
          </div>
        )}
        {/* 足元ボタンはDrawerFooter側で制御 */}
      </form>
    </Form>
  );
}
