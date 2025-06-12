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
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { Education } from "@/lib/types";
import { toast } from "sonner";

// Zod schema for each education entry
const eduSchema = z.object({
  institution: z.string().min(1, "学校名を入力してください"),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "開始月を入力して下さい"),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/, "終了月を入力して下さい"),
  description: z.string().optional(),
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

  console.log('initialData', initialData);
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
        degree: e.degree || null,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <Label>学歴</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startMonth: "",
                endMonth: "",
                description: "",
              })
            }
            disabled={isSaving}
          >
            <Plus className="h-4 w-4" /> 追加
          </Button>
        </div>

        {fields.map((field, idx) => (
          <div key={field.id} className="p-4 border rounded space-y-4">
            <FormField
              control={form.control}
              name={`education.${idx}.institution` as const}
              render={({ field }) => (
                <FormItem>
                  <Label>学校名</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`education.${idx}.startMonth` as const}
                render={({ field }) => (
                  <FormItem>
                    <Label>開始日</Label>
                    <FormControl>
                      <Input {...field} type="month" />
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
                    <Label>終了日</Label>
                    <FormControl>
                      <Input {...field} type="month" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`education.${idx}.degree` as const}
              render={({ field }) => (
                <FormItem>
                  <Label>学位</Label>
                  <FormControl>
                    <Input {...field} />
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
                  <Label>専攻</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`education.${idx}.description` as const}
              render={({ field }) => (
                <FormItem>
                  <Label>説明</Label>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}

        <div className="flex justify-end gap-2">
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
