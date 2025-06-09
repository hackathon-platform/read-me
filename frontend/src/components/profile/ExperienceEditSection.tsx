"use client";

import { useState } from "react";
import { Experience } from "@/lib/types";
import { useUserExperience } from "@/hooks/useUserExperience";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  profileId: string;
}

export function ExperienceEditSection({ profileId }: Props) {
  const { items, setItems, loading } = useUserExperience(profileId);
  const [isSaving, setIsSaving] = useState(false);

  const addNew = () => {
    setItems((prev) => [
      ...prev,
      {
        profileId, // include profileId from props
        id: "", // will fill after insert
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        iconUrl: "",
        url: "",
        skills: [],
      },
    ]);
  };

  const saveOne = async (idx: number) => {
    const exp = items[idx];
    if (!exp.company || !exp.position || !exp.startDate) {
      toast.error("会社名・役職・開始日は必須です。");
      return;
    }
    setIsSaving(true);

    const payload = {
      profile_id: profileId,
      company: exp.company,
      position: exp.position,
      start_date: exp.startDate + "-01",
      end_date: exp.endDate === "present" ? null : exp.endDate + "-01",
      description: exp.description,
      icon_url: exp.iconUrl || null,
      url: exp.url || null,
    };
    let res;
    if (exp.profileId) {
      // existing: update
      res = await supabase
        .from("experience")
        .update(payload)
        .eq("id", exp.profileId);
    } else {
      // new: insert
      res = await supabase
        .from("experience")
        .insert({ ...payload })
        .single();
    }

    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("保存しました");
      // on insert, capture the new id
      if (!exp.profileId && res.data) {
        setItems((prev) => {
          const nxt = [...prev];
          if (res.data) {
            const data = res.data as { profile_id: string }; // Explicitly define the type
            nxt[idx].profileId = data.profile_id;
          }
          return nxt;
        });
      }
    }
    setIsSaving(false);
  };

  const deleteOne = async (idx: number) => {
    const exp = items[idx];
    if (!exp.profileId) {
      // just remove the unsaved one
      setItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setIsSaving(true);
    const { error } = await supabase
      .from("experience")
      .delete()
      .eq("id", exp.profileId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("削除しました");
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
    setIsSaving(false);
  };

  if (loading) return <p>読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">過去の経験</h3>
        <Button size="sm" variant="outline" onClick={addNew}>
          <Plus className="h-4 w-4 mr-1" /> 追加
        </Button>
      </div>

      {items.map((exp, i) => (
        <Card key={i}>
          <CardContent className="space-y-3">
            <div className="flex justify-end gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => saveOne(i)}
                disabled={isSaving}
              >
                保存
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteOne(i)}
                disabled={isSaving}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>会社名</Label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    setItems((prev) => {
                      const nxt = [...prev];
                      nxt[i].company = e.target.value;
                      return nxt;
                    })
                  }
                />
              </div>
              <div>
                <Label>役職</Label>
                <Input
                  value={exp.position}
                  onChange={(e) =>
                    setItems((prev) => {
                      const nxt = [...prev];
                      nxt[i].position = e.target.value;
                      return nxt;
                    })
                  }
                />
              </div>
              <div>
                <Label>開始年月</Label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) =>
                    setItems((prev) => {
                      const nxt = [...prev];
                      nxt[i].startDate = e.target.value;
                      return nxt;
                    })
                  }
                />
              </div>
              <div>
                <Label>終了年月</Label>
                <Input
                  type="month"
                  value={exp.endDate === "present" ? "" : exp.endDate}
                  onChange={(e) =>
                    setItems((prev) => {
                      const nxt = [...prev];
                      nxt[i].endDate = e.target.value;
                      return nxt;
                    })
                  }
                  disabled={exp.endDate === "present"}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() =>
                    setItems((prev) => {
                      const nxt = [...prev];
                      nxt[i].endDate =
                        nxt[i].endDate === "present" ? "" : "present";
                      return nxt;
                    })
                  }
                >
                  {exp.endDate === "present" ? "再設定" : "現在在籍中"}
                </Button>
              </div>
            </div>
            <div>
              <Label>説明</Label>
              <Textarea
                rows={3}
                value={exp.description}
                onChange={(e) =>
                  setItems((prev) => {
                    const nxt = [...prev];
                    nxt[i].description = e.target.value;
                    return nxt;
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
