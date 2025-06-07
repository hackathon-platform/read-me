// components/profile/PortfolioEdit.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import {
  Portfolio,
  Social,
  Project,
  Experience,
  ProjectMedia,
  Skill,
  Qualification,
} from "@/lib/types";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Upload,
  Building2,
  ArrowUp,
  ArrowDown,
  Link,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

//
// 1) Define a Zod schema for the “static” fields in the form (names + username + education).
//    We’ll handle the JSON arrays (socials, experience, etc.) with local useState.
//
//
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Usernameは3文字以上必要です。" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Usernameは英数字とアンダースコア(_ )のみ使用できます。",
    }),
  firstName: z.string().min(1, { message: "名前を入力してください。" }),
  lastName: z.string().min(1, { message: "姓を入力してください。" }),
  firstNameKana: z
    .string()
    .min(1, { message: "名前（フリガナ）を入力してください。" }),
  lastNameKana: z
    .string()
    .min(1, { message: "姓（フリガナ）を入力してください。" }),
  imageUrl: z.string().optional(),
  education: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PortfolioEditFormProps {
  initialPortfolio: Portfolio | null;
  initialUsername: string;
  userId: string; // Supabase-authenticated user UID
}

export function PortfolioEditForm({
  initialPortfolio,
  initialUsername,
  userId,
}: PortfolioEditFormProps) {
  const router = useRouter();

  // Local state for the “array” fields (socials, experience, qualifications, projects).
  // Initialize with the data from initialPortfolio (or empty arrays if null).
  const [socials, setSocials] = useState<Social[]>(
    initialPortfolio?.socials || [],
  );
  const [experience, setExperience] = useState<Experience[]>(
    initialPortfolio?.experience || [],
  );
  const [qualifications, setQualifications] = useState<Qualification[]>(
    initialPortfolio?.qualifications || [],
  );
  const [projects, setProjects] = useState<Project[]>(
    initialPortfolio?.projects || [],
  );

  // File input refs for image + PDF
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // 2) Create the RHF form, seeded with initialPortfolio & initialUsername
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialUsername || "",
      firstName: initialPortfolio?.firstName || "",
      lastName: initialPortfolio?.lastName || "",
      firstNameKana: initialPortfolio?.firstNameKana || "",
      lastNameKana: initialPortfolio?.lastNameKana || "",
      imageUrl: initialPortfolio?.imageUrl || "",
      education: initialPortfolio?.education || "",
    },
  });

  // Helper: reorder array items (for experience/qualifications/projects)
  const moveItem = <T,>(array: T[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= array.length) return array;
    const newArr = [...array];
    const [moved] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, moved);
    return newArr;
  };

  const moveExperience = (index: number, dir: "up" | "down") => {
    setExperience((prev) =>
      moveItem(prev, index, dir === "up" ? index - 1 : index + 1),
    );
  };
  const moveQualification = (index: number, dir: "up" | "down") => {
    setQualifications((prev) =>
      moveItem(prev, index, dir === "up" ? index - 1 : index + 1),
    );
  };
  const moveProject = (index: number, dir: "up" | "down") => {
    setProjects((prev) =>
      moveItem(prev, index, dir === "up" ? index - 1 : index + 1),
    );
  };

  // 3) Handle file uploads (profile image + PDF resume)
  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const MAX_SIZE_MB = 15;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      toast("ファイルサイズが大きすぎます", {
        description: `ファイルは${MAX_SIZE_MB}MB以下にしてください。`,
        duration: 3000,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) {
      handleFileUpload(file, (url) => form.setValue("imageUrl", url));
    }
  };

  const handleCompanyIconUpload = (
    ev: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, (url) => {
      setExperience((prev) => {
        const newArr = [...prev];
        newArr[idx] = { ...newArr[idx], iconUrl: url };
        return newArr;
      });
    });
  };

  const handleProjectMediaUpload = (
    ev: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const files = ev.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith("image/") ? "image" : "video";
      handleFileUpload(file, (url) => {
        setProjects((prev) => {
          const newArr = [...prev];
          const mediaList = newArr[idx].media || [];
          if (!mediaList.some((m) => m.url === url)) {
            newArr[idx].media = [...mediaList, { type, url }];
          }
          return newArr;
        });
      });
    });
    ev.target.value = "";
  };

  const handlePDFUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, (url) => {
      // We’ll store resumeUrl in “Portfolio” object – but we don’t include it in formSchema,
      // so store it later in a local variable. Easiest is to hold resumeUrl in React state.
      setResumeUrl(url);
    });
  };

  // Keep resumeUrl in a local state, initialized from initialPortfolio
  const [resumeUrl, setResumeUrl] = useState<string>(
    initialPortfolio?.resumeUrl || "",
  );

  //
  // 4) Functions to add/remove Socials / Experience / Qualifications / Projects / Skills:
  //
  const addSocial = () => {
    if (socials.length >= 5) {
      toast("上限に達しました", {
        description: "ソーシャルリンクは最大5つまでです。",
        duration: 3000,
      });
      return;
    }
    setSocials([...socials, { platform: "github", url: "" }]);
  };
  const removeSocial = (idx: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateSocial = (
    idx: number,
    platform: Social["platform"],
    url: string,
    label?: string,
  ) => {
    // Prevent duplicate platforms
    if (
      socials.some(
        (s, i) => i !== idx && s.platform === platform && platform !== "other",
      )
    ) {
      toast("同じプラットフォームは一度しか追加できません。", {
        duration: 3000,
      });
      return;
    }
    setSocials((prev) => {
      const newArr = [...prev];
      newArr[idx] = { platform, url, label };
      return newArr;
    });
  };

  const addExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        skills: [],
      },
    ]);
  };
  const removeExperience = (idx: number) => {
    setExperience((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateExperienceField = (
    idx: number,
    field: keyof Experience,
    value: any,
  ) => {
    setExperience((prev) => {
      const newArr = [...prev];
      newArr[idx] = { ...newArr[idx], [field]: value };
      return newArr;
    });
  };

  const addQualification = () => {
    setQualifications((prev) => [
      ...prev,
      { name: "", acquisitionDate: "", description: "", score: "" },
    ]);
  };
  const removeQualification = (idx: number) => {
    setQualifications((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateQualificationField = (
    idx: number,
    field: keyof Qualification,
    value: any,
  ) => {
    setQualifications((prev) => {
      const newArr = [...prev];
      newArr[idx] = { ...newArr[idx], [field]: value };
      return newArr;
    });
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        imageUrl: "",
        url: "",
        media: [],
        skills: [],
      },
    ]);
  };
  const removeProject = (idx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateProjectField = (
    idx: number,
    field: keyof Project,
    value: any,
  ) => {
    setProjects((prev) => {
      const newArr = [...prev];
      newArr[idx] = { ...newArr[idx], [field]: value };
      return newArr;
    });
  };
  const removeProjectMedia = (projectIdx: number, mediaIdx: number) => {
    setProjects((prev) => {
      const newArr = [...prev];
      newArr[projectIdx].media = newArr[projectIdx].media!.filter(
        (_, i) => i !== mediaIdx,
      );
      return newArr;
    });
  };

  // Helper for editing “skills” inside experience or project
  const addSkill = (parentIdx: number, type: "experience" | "project") => {
    if (type === "experience") {
      setExperience((prev) => {
        const newArr = [...prev];
        const skillsArr = newArr[parentIdx].skills || [];
        newArr[parentIdx].skills = [
          ...skillsArr,
          { name: "", type: "language" },
        ];
        return newArr;
      });
    } else {
      setProjects((prev) => {
        const newArr = [...prev];
        const skillsArr = newArr[parentIdx].skills || [];
        newArr[parentIdx].skills = [
          ...skillsArr,
          { name: "", type: "language" },
        ];
        return newArr;
      });
    }
  };
  const removeSkill = (
    parentIdx: number,
    skillIdx: number,
    type: "experience" | "project",
  ) => {
    if (type === "experience") {
      setExperience((prev) => {
        const newArr = [...prev];
        newArr[parentIdx].skills = newArr[parentIdx].skills!.filter(
          (_, i) => i !== skillIdx,
        );
        return newArr;
      });
    } else {
      setProjects((prev) => {
        const newArr = [...prev];
        newArr[parentIdx].skills = newArr[parentIdx].skills!.filter(
          (_, i) => i !== skillIdx,
        );
        return newArr;
      });
    }
  };
  const updateSkill = (
    parentIdx: number,
    skillIdx: number,
    field: keyof Skill,
    value: string,
    type: "experience" | "project",
  ) => {
    if (type === "experience") {
      setExperience((prev) => {
        const newArr = [...prev];
        newArr[parentIdx].skills![skillIdx] = {
          ...newArr[parentIdx].skills![skillIdx],
          [field]: value,
        };
        return newArr;
      });
    } else {
      setProjects((prev) => {
        const newArr = [...prev];
        newArr[parentIdx].skills![skillIdx] = {
          ...newArr[parentIdx].skills![skillIdx],
          [field]: value,
        };
        return newArr;
      });
    }
  };

  // 5) The “submit” handler: gather everything + upsert into Supabase
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);

    // 1) Check if the chosen “username” is already taken by someone else (and not this user).
    if (values.username !== initialUsername) {
      // If they changed their username, verify uniqueness
      const { data: existing, error: usernameErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", values.username)
        .single();

      if (existing && existing.id !== userId) {
        setIsSaving(false);
        toast("Usernameが既に使われています。", {
          duration: 3000,
        });
        return;
      }
    }

    // 2) Build the object to upsert
    const rowToUpsert = {
      id: userId,
      username: values.username,
      first_name: values.firstName,
      last_name: values.lastName,
      first_name_kana: values.firstNameKana,
      last_name_kana: values.lastNameKana,
      image_url: values.imageUrl,
      education: values.education,
      socials: socials,
      experience: experience,
      qualifications: qualifications,
      projects: projects,
      resume_url: resumeUrl,
    };

    // 3) Call upsert (insert if no row exists, update if exists)
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(rowToUpsert);

    if (upsertError) {
      console.error("Failed to save profile:", upsertError);
      toast("保存に失敗しました。", {
        description: upsertError.message,
      });
      setIsSaving(false);
      return;
    }

    toast("保存しました！", {
      description: "あなたのプロフィールが更新されました。",
    });

    // 4) Redirect to the new “view” page for this username
    setTimeout(() => {
      router.push(`/profile/${values.username}`);
    }, 500);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pb-10 animate-in fade-in duration-500"
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          </TabsList>

          {/* ============================= */}
          {/* Tab: Profile (name, image, socials, education, experience, qualifications, resume) */}
          {/* ============================= */}
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6 space-y-8">
                {/* Profile Photo & Username */}
                <div className="flex flex-col items-center justify-center">
                  <Avatar
                    className="h-24 w-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AvatarImage src={form.watch("imageUrl")} />
                    <AvatarFallback>写真</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    プロフィール写真をアップロード
                  </Button>
                  <div className="mt-4 w-full max-w-xs">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>表示用ユーザーID（Username）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: genichihashi" {...field} />
                          </FormControl>
                          <FormDescription>
                            ※3文字以上、英数字・アンダースコアのみ可。他の人がこのIDで
                            あなたのページ ( /profile/[username] ) を見れます。
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>姓</FormLabel>
                        <FormControl>
                          <Input placeholder="山田" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>名</FormLabel>
                        <FormControl>
                          <Input placeholder="太郎" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastNameKana"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>姓（フリガナ）</FormLabel>
                        <FormControl>
                          <Input placeholder="ヤマダ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstNameKana"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>名（フリガナ）</FormLabel>
                        <FormControl>
                          <Input placeholder="タロウ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Social Media Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      ソーシャルメディア
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {socials.map((social, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap gap-2 sm:flex-nowrap items-start"
                      >
                        <Select
                          defaultValue={social.platform}
                          onValueChange={(val: Social["platform"]) =>
                            updateSocial(idx, val, social.url, social.label)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="github">
                              <div className="flex items-center">
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                              </div>
                            </SelectItem>
                            <SelectItem value="linkedin">
                              <div className="flex items-center">
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                              </div>
                            </SelectItem>
                            <SelectItem value="instagram">
                              <div className="flex items-center">
                                <Instagram className="h-4 w-4 mr-2" />
                                Instagram
                              </div>
                            </SelectItem>
                            <SelectItem value="facebook">
                              <div className="flex items-center">
                                <Facebook className="h-4 w-4 mr-2" />
                                Facebook
                              </div>
                            </SelectItem>
                            <SelectItem value="other">
                              <div className="flex items-center">
                                <Link className="h-4 w-4 mr-2" />
                                その他
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="URLを入力"
                          value={social.url}
                          onChange={(e) =>
                            updateSocial(
                              idx,
                              social.platform,
                              e.target.value,
                              social.label,
                            )
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocial(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocial}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
                </div>

                <Separator />

                {/* Education */}
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>最終学歴</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 東京大学工学部（2019年卒業）"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Experience Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">過去の経験</h3>
                  </div>
                  <div className="space-y-6">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="border rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Move Up / Down */}
                          <div className="flex md:flex-col gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveExperience(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveExperience(idx, "down")}
                              disabled={idx === experience.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>会社名</Label>
                                <Input
                                  placeholder="例: 株式会社テクノロジー"
                                  value={exp.company}
                                  onChange={(e) =>
                                    updateExperienceField(
                                      idx,
                                      "company",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>役職</Label>
                                <Input
                                  placeholder="例: ソフトウェアエンジニア"
                                  value={exp.position}
                                  onChange={(e) =>
                                    updateExperienceField(
                                      idx,
                                      "position",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>開始年月</Label>
                                <Input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) =>
                                    updateExperienceField(
                                      idx,
                                      "startDate",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>終了年月</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    type="month"
                                    value={
                                      exp.endDate === "present"
                                        ? ""
                                        : exp.endDate
                                    }
                                    onChange={(e) =>
                                      updateExperienceField(
                                        idx,
                                        "endDate",
                                        e.target.value,
                                      )
                                    }
                                    disabled={exp.endDate === "present"}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateExperienceField(
                                        idx,
                                        "endDate",
                                        exp.endDate === "present"
                                          ? ""
                                          : "present",
                                      )
                                    }
                                  >
                                    {exp.endDate === "present"
                                      ? "終了日を設定"
                                      : "現在も在籍中"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>説明</Label>
                              <Textarea
                                placeholder="職務内容や成果を入力"
                                value={exp.description}
                                onChange={(e) =>
                                  updateExperienceField(
                                    idx,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>会社アイコン</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                  {exp.iconUrl ? (
                                    <img
                                      src={exp.iconUrl}
                                      alt={exp.company}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Building2 className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`company-icon-${idx}`}
                                  onChange={(e) =>
                                    handleCompanyIconUpload(e, idx)
                                  }
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById(`company-icon-${idx}`)
                                      ?.click()
                                  }
                                >
                                  アイコンをアップロード
                                </Button>
                              </div>
                            </div>

                            {/* Skills Editor for this experience */}
                            <div className="space-y-2">
                              <Label className="block mb-2">スキル</Label>
                              <div className="space-y-3">
                                {exp.skills?.map((skill, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="flex flex-wrap gap-2 sm:flex-nowrap"
                                  >
                                    <Select
                                      value={skill.type}
                                      onValueChange={(val) =>
                                        updateSkill(
                                          idx,
                                          sIdx,
                                          "type",
                                          val,
                                          "experience",
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="language">
                                          開発言語
                                        </SelectItem>
                                        <SelectItem value="framework">
                                          フレームワーク
                                        </SelectItem>
                                        <SelectItem value="tool">
                                          ツール
                                        </SelectItem>
                                        <SelectItem value="other">
                                          その他
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="スキル名"
                                      value={skill.name}
                                      onChange={(e) =>
                                        updateSkill(
                                          idx,
                                          sIdx,
                                          "name",
                                          e.target.value,
                                          "experience",
                                        )
                                      }
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        removeSkill(idx, sIdx, "experience")
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSkill(idx, "experience")}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> スキルを追加
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExperience(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
                </div>

                <Separator />

                {/* Qualifications Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">資格・スキル</h3>
                  </div>

                  <div className="space-y-6">
                    {qualifications.map((qual, idx) => (
                      <div key={idx} className="border rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex md:flex-col gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQualification(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQualification(idx, "down")}
                              disabled={idx === qualifications.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                              <Label>資格名</Label>
                              <Input
                                placeholder="例: TOEIC"
                                value={qual.name}
                                onChange={(e) =>
                                  updateQualificationField(
                                    idx,
                                    "name",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>取得年月</Label>
                              <Input
                                type="month"
                                value={qual.acquisitionDate}
                                onChange={(e) =>
                                  updateQualificationField(
                                    idx,
                                    "acquisitionDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>スコア・点数（オプション）</Label>
                              <Input
                                placeholder="例: 850点"
                                value={qual.score}
                                onChange={(e) =>
                                  updateQualificationField(
                                    idx,
                                    "score",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>説明（オプション）</Label>
                              <Textarea
                                placeholder="補足説明があれば入力"
                                value={qual.description}
                                onChange={(e) =>
                                  updateQualificationField(
                                    idx,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQualification(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQualification}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
                </div>

                <Separator />

                {/* Resume Upload Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">履歴書 PDF</h3>
                  <div
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg mt-2 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      PDFをアップロード
                    </p>
                    {resumeUrl && (
                      <p className="text-xs text-primary mt-2">
                        PDFがアップロード済み
                      </p>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      ref={pdfInputRef}
                      onChange={handlePDFUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================= */}
          {/* Tab: Projects */}
          {/* ============================= */}
          <TabsContent value="projects">
            <Card>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">プロジェクト</h3>
                </div>

                <div className="space-y-6">
                  {projects.map((project, idx) => (
                    <div key={idx} className="border rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Move Up / Down */}
                        <div className="flex md:flex-col gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(idx, "up")}
                            disabled={idx === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(idx, "down")}
                            disabled={idx === projects.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>プロジェクト名</Label>
                            <Input
                              placeholder="プロジェクト名"
                              value={project.title}
                              onChange={(e) =>
                                updateProjectField(idx, "title", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>説明</Label>
                            <Textarea
                              placeholder="プロジェクトの説明"
                              value={project.description}
                              onChange={(e) =>
                                updateProjectField(
                                  idx,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>プロジェクトURL（オプション）</Label>
                            <Input
                              placeholder="https://..."
                              value={project.url}
                              onChange={(e) =>
                                updateProjectField(idx, "url", e.target.value)
                              }
                            />
                          </div>

                          {/* Skills inside project */}
                          <div className="space-y-2">
                            <Label className="block mb-2">スキル</Label>
                            <div className="space-y-3">
                              {project.skills?.map((skill, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex flex-wrap gap-2 sm:flex-nowrap"
                                >
                                  <Select
                                    value={skill.type}
                                    onValueChange={(val) =>
                                      updateSkill(
                                        idx,
                                        sIdx,
                                        "type",
                                        val,
                                        "project",
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="language">
                                        開発言語
                                      </SelectItem>
                                      <SelectItem value="framework">
                                        フレームワーク
                                      </SelectItem>
                                      <SelectItem value="tool">
                                        ツール
                                      </SelectItem>
                                      <SelectItem value="other">
                                        その他
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="スキル名"
                                    value={skill.name}
                                    onChange={(e) =>
                                      updateSkill(
                                        idx,
                                        sIdx,
                                        "name",
                                        e.target.value,
                                        "project",
                                      )
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeSkill(idx, sIdx, "project")
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSkill(idx, "project")}
                              >
                                <Plus className="h-4 w-4 mr-1" /> スキルを追加
                              </Button>
                            </div>
                          </div>

                          {/* Project media (images/videos) */}
                          <div className="space-y-2">
                            <Label>メディア</Label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {project.media?.map((media, mIdx) => (
                                <div key={mIdx} className="relative group">
                                  {media.type === "image" ? (
                                    <img
                                      src={media.url}
                                      alt={`${project.title} - メディア ${mIdx + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  )}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      removeProjectMedia(idx, mIdx)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                id={`project-media-${idx}`}
                                onChange={(e) =>
                                  handleProjectMediaUpload(e, idx)
                                }
                                className="hidden"
                                multiple
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById(`project-media-${idx}`)
                                    ?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                画像・動画をアップロード
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProject(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save / Cancel Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/profile/${initialUsername || ""}`)}
          >
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
