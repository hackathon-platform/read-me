"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/supabaseClient";
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
import TechMultiSelect from "@/components/tech/TechMultiSelect";

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
  techKeys: z.array(z.string()).default([]),
});

const schema = z.object({
  experiences: z.array(expSchema),
});

interface Props {
  profileId: string;
  initialData: Experience[];
  onCancel: () => void;
  onSave: () => void;
}

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ExperienceEdit({ profileId, initialData, onSave }: Props) {
  const formId = "experience-edit-form";
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // 初期 techIds へ変換
  const defaults: FormInput = {
    experiences: initialData.map((e) => ({
      title: e.title ?? "",
      organization: e.organization ?? "",
      startMonth: e.startMonth ?? "",
      endMonth: e.endMonth ?? "",
      description: e.description ?? "",
      techKeys: e.techKeys ?? [],
    })),
  };

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const onSubmit = async (raw: FormInput) => {
    setIsSaving(true);
    try {
      const { experiences }: FormOutput = schema.parse(raw);

      // 1) get existing experience ids BEFORE deleting
      const { data: existingEx, error: exFetchErr } = await supabase
        .from("experience")
        .select("id")
        .eq("profile_id", profileId);
      if (exFetchErr) throw exFetchErr;

      const oldIds = (existingEx ?? []).map((r) => r.id);

      // 2) delete tech mappings first (safe if none)
      if (oldIds.length) {
        const delTech = await supabase
          .from("tech")
          .delete()
          .eq("kind", "experience")
          .in("ref", oldIds);
        if (delTech.error) throw delTech.error;
      }

      // 3) delete experiences
      const { error: delExErr } = await supabase
        .from("experience")
        .delete()
        .eq("profile_id", profileId);
      if (delExErr) throw delExErr;

      // 4) insert new experiences + their tech keys
      for (const e of experiences) {
        const { data: insData, error: insErr } = await supabase
          .from("experience")
          .insert({
            profile_id: profileId,
            title: e.title,
            organization: e.organization,
            start_month: `${e.startMonth}-01`,
            end_month: e.endMonth ? `${e.endMonth}-01` : null,
            description: e.description || null,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;

        if ((e.techKeys ?? []).length) {
          const { error: techInsErr } = await supabase.from("tech").insert(
            e.techKeys.map((key) => ({
              kind: "experience",
              key,
              ref: insData.id,
            })),
          );
          if (techInsErr) throw techInsErr;
        }
      }

      toast.success("職歴を更新しました");
      onSave();
      router.refresh();
    } catch (e: any) {
      toast.error(e.message ?? "保存に失敗しました");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  console.log("fields", fields);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-2"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
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
                    techKeys: [],
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
              <Card key={field.id} className="group relative border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  disabled={isSaving}
                  className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full bg-background border"
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
                          <FormLabel className="text-sm flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" /> 会社・組織名
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="例：株式会社ABC"
                              className="text-base h-9"
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
                          <FormLabel className="text-sm flex items-center gap-2">
                            <User className="h-3.5 w-3.5" /> 役職・役割
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
                          <FormLabel className="text-sm flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" /> 開始月
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="month"
                              className="text-base h-9"
                            />
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
                          <FormLabel className="text-sm flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" /> 終了月
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="month"
                              value={field.value ?? ""}
                              placeholder="現職の場合は空欄"
                              className="text-base h-9"
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
                        <FormLabel className="text-sm flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" /> 職務内容・実績
                        </FormLabel>
                        <FormDescription className="text-xs">
                          箇条書きは各行頭に「•」「-」「*」などを付けてください
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            rows={3}
                            className="text-base resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experiences.${idx}.techKeys` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">使用技術</FormLabel>
                        <FormControl>
                          <TechMultiSelect
                            value={field.value ?? []}
                            onChange={field.onChange}
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
              className="w-full border-dashed border-2 h-12"
              onClick={() =>
                append({
                  title: "",
                  organization: "",
                  startMonth: "",
                  endMonth: "",
                  description: "",
                  techKeys: [],
                })
              }
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              職歴を追加
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
