"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Award, Calendar, X } from "lucide-react";
import { Qualification } from "@/lib/types";
import { toast } from "sonner";

// Zod schema for each qualification entry
const qualificationSchema = z.object({
  name: z.string().min(1, "資格名を入力してください"),
  acquisitionDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "取得日を入力してください"),
});

const schema = z.object({
  qualification: z.array(qualificationSchema),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
  initialData: Qualification[];
  onCancel: () => void;
  onSave: () => void; // 保存成功時にDrawerを閉じる
  formId?: string; // 追加：外部フッターからsubmitするためのID
}

export function QualificationEdit({
  profileId,
  initialData,
  onSave,
  formId = "qualification-edit-form",
}: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { qualification: initialData },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "qualification",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    // delete old entries
    await supabase.from("qualification").delete().eq("profile_id", profileId);

    // insert new
    if (values.qualification.length) {
      const payload = values.qualification.map((q) => ({
        profile_id: profileId,
        name: q.name,
        acquisition_date: `${q.acquisitionDate}-01`,
      }));
      const { error } = await supabase.from("qualification").insert(payload);
      if (error) {
        toast.error(error.message);
        setIsSaving(false);
        return;
      }
    }

    toast.success("資格・免許を更新しました");
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
              <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                資格・免許がまだ登録されていません
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    acquisitionDate: "",
                  })
                }
                disabled={isSaving}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                最初の資格を追加
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
                  title="この資格を削除"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`qualification.${idx}.name` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">
                          <Award className="h-3.5 w-3.5" />
                          資格・免許名
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="例：基本情報技術者試験"
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`qualification.${idx}.acquisitionDate` as const}
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          取得日
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="month"
                            placeholder="取得年月を選択してください"
                            className="h-9"
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
                  name: "",
                  acquisitionDate: "",
                })
              }
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              資格を追加
            </Button>
          </div>
        )}
        {/* 足元ボタンはDrawerFooter側で制御 */}
      </form>
    </Form>
  );
}
