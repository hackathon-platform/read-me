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
import { Experience } from "@/lib/types";
import { toast } from "sonner";

const expSchema = z.object({
  company: z.string().min(1, "会社名を入力してください"),
  position: z.string().min(1, "役職を入力してください"),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, "開始月を入力して下さい"),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/, "終了月を入力して下さい").optional(),
  description: z.string().optional(),
});

const schema = z.object({
  experiences: z.array(expSchema),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
  initialData: Experience[];
  onCancel: () => void;
  onSave: () => void;
}

export function ExperienceEdit({
  profileId,
  initialData,
  onCancel,
  onSave,
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
    await supabase.from("experience").delete().eq("profile_id", profileId);

    if (values.experiences.length) {
      const payload = values.experiences.map((e) => ({
        profile_id: profileId,
        company: e.company,
        position: e.position,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <Label>職歴</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                company: "",
                position: "",
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
              name={`experiences.${idx}.company` as const}
              render={({ field }) => (
                <FormItem>
                  <Label>会社名</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`experiences.${idx}.position` as const}
              render={({ field }) => (
                <FormItem>
                  <Label>役職</Label>
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
                name={`experiences.${idx}.startMonth` as const}
                render={({ field }) => (
                  <FormItem>
                    <Label>開始月</Label>
                    <FormControl>
                      <Input {...field} type="month" />
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
                    <Label>終了月</Label>
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
              name={`experiences.${idx}.description` as const}
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