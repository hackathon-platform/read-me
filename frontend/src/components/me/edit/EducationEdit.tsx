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
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  GraduationCap,
  Calendar,
  Building2,
  BookOpen,
  FileText,
  X,
} from "lucide-react";
import { Education } from "@/lib/types";
import { toast } from "sonner";

// Zod schema for each education entry
const eduSchema = z.object({
  institution: z.string().min(1, "学校名を入力してください"),
  fieldOfStudy: z.string().nullable().optional(),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "開始月を入力して下さい"),
  endMonth: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const schema = z.object({
  education: z.array(eduSchema),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
  initialData: Education[];
  onCancel: () => void;
  onSave: () => void;
}

export function EducationEdit({
  profileId,
  initialData,
  onCancel,
  onSave,
}: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { education: initialData },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    // delete old entries
    await supabase.from("education").delete().eq("profile_id", profileId);

    // insert new
    if (values.education.length) {
      const payload = values.education.map((e) => ({
        profile_id: profileId,
        institution: e.institution,
        field_of_study: e.fieldOfStudy || null,
        start_month: `${e.startMonth}-01`,
        end_month: e.endMonth ? `${e.endMonth}-01` : null,
        description: e.description || null,
      }));
      const { error } = await supabase.from("education").insert(payload);
      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }
    }

    toast.success("学歴を更新しました");
    onSave();
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4" />
        <h3 className="font-semibold">学歴を編集</h3>
      </div>
      <Separator className="mt-1 mb-3" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  学歴がまだ登録されていません
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      institution: "",
                      fieldOfStudy: "",
                      startMonth: "",
                      endMonth: "",
                      description: "",
                    })
                  }
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  最初の学歴を追加
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <Card
                  key={field.id}
                  className="group rounded-none relative border border-border/20 hover:border-border transition-all duration-200"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    disabled={isSaving}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border border-border/60  text-muted-foreground hover:text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm transition-all duration-200 z-10"
                    title="この学歴を削除"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`education.${idx}.institution` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm">
                              <Building2 className="h-3.5 w-3.5" />
                              学校名
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="例：東京大学"
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${idx}.fieldOfStudy` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-3.5 w-3.5" />
                              専攻・学位
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="例：コンピューターサイエンス学士"
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
                        name={`education.${idx}.startMonth` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              開始日
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
                        name={`education.${idx}.endMonth` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              終了日
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                type="month"
                                placeholder="在学中の場合は空欄"
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
                      name={`education.${idx}.description` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <FileText className="h-3.5 w-3.5" />
                            詳細説明
                          </FormLabel>
                          <FormDescription className="text-xs">
                            箇条書きの場合は各行の先頭に「•」「-」「*」のいずれかを付けてください
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              rows={3}
                              placeholder="例：&#10;• データ構造とアルゴリズム（C言語）の専門知識を習得&#10;• 優秀な成績により3,000ドルの入学奨学金を授与"
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
                    institution: "",
                    fieldOfStudy: "",
                    startMonth: "",
                    endMonth: "",
                    description: "",
                  })
                }
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                学歴を追加
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  保存中...
                </>
              ) : (
                "変更を保存"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
