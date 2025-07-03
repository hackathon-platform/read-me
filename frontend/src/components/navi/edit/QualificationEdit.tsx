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
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  Plus, 
  Award, 
  Calendar,
  Grip
} from "lucide-react";
import { Qualification } from "@/lib/types";
import { toast } from "sonner";

// Zod schema for each qualification entry
const qualificationSchema = z.object({
  name: z.string().min(1, "資格名を入力してください"),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}$/, "取得日を入力してください"),
});

const schema = z.object({
  qualification: z.array(qualificationSchema),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
  initialData: Qualification[];
  onCancel: () => void;
  onSave: () => void;
}

export function QualificationEdit({
  profileId,
  initialData,
  onCancel,
  onSave,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <h3 className="text-lg font-semibold">資格・免許を編集</h3>
          </div>
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
            資格を追加
          </Button>
        </div>

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
              <Card key={field.id} className="relative overflow-hidden">
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Grip className="h-4 w-4" />
                      <span>資格 {idx + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                      disabled={isSaving}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`qualification.${idx}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            資格・免許名
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="例：基本情報技術者試験"
                              className="font-medium"
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
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            取得日
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="month"
                              placeholder="取得年月を選択してください"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <Button 
            type="submit" 
            disabled={isSaving}
            className="gap-2"
          >
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
  );
}