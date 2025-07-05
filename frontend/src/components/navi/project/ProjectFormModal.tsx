"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Hash, Loader2, Link2, Video } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { Project, ProjectMedia } from "@/lib/types";
import { ProjectMediaDisplay } from "./ProjectMediaDisplay";

const BUCKET = "media";

interface Props {
  isOpen: boolean;
  profileId: string;
  existingProjects: Project[];
  editingProject: Project | null;
  onClose: () => void;
  onSave: (updatedList: Project[]) => void;
}

export default function ProjectFormModal({
  isOpen,
  profileId,
  existingProjects,
  editingProject,
  onClose,
  onSave,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    skills: [] as string[],
    mediaFiles: [] as File[],
    existingMedia: [] as ProjectMedia[],
    mediaToDelete: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title,
        description: editingProject.description,
        url: editingProject.url || "",
        skills: (editingProject.skills ?? []).map((s) => s.name),
        mediaFiles: [],
        existingMedia: editingProject.media || [],
        mediaToDelete: [],
      });
    } else {
      resetForm();
    }
  }, [editingProject, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      skills: [],
      mediaFiles: [],
      existingMedia: [],
      mediaToDelete: [],
    });
    setSkillInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isImage && !isVideo) {
        toast.error(`${file.name} は画像または動画ファイルではありません`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} のサイズが大きすぎます (最大10MB)`);
        return false;
      }
      return true;
    });
    setFormData((f) => ({
      ...f,
      mediaFiles: [...f.mediaFiles, ...validFiles],
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMediaFile = (index: number) => {
    setFormData((f) => ({
      ...f,
      mediaFiles: f.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const removeExistingMedia = (mediaId: string) => {
    setFormData((f) => ({
      ...f,
      existingMedia: f.existingMedia.filter((m) => m.id !== mediaId),
      mediaToDelete: [...f.mediaToDelete, mediaId],
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (!formData.skills.includes(trimmed)) {
        setFormData((f) => ({ ...f, skills: [...f.skills, trimmed] }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData((f) => ({
      ...f,
      skills: f.skills.filter((_, i) => i !== index),
    }));
  };

  // Upload to Supabase Storage & return array of media metadata
  const uploadMedia = async (
    projectId: string,
    files: File[],
  ): Promise<Array<ProjectMedia & { path: string }>> => {
    const uploaded: Array<ProjectMedia & { path: string }> = [];
    for (const file of files) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const path = `projects/${projectId}/${timestamp}_${randomId}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`${file.name} のアップロードに失敗しました`);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push({
          type: file.type.startsWith("video/") ? "video" : "image",
          url: data.publicUrl,
          caption: "",
          path,
        });
      } catch (err) {
        console.error("Error uploading file:", err);
        toast.error(`${file.name} のアップロードに失敗しました`);
      }
    }
    return uploaded;
  };

  // Delete media both from Storage and DB by media IDs
  const deleteMedia = async (mediaIds: string[]) => {
    if (!mediaIds.length) return;
    // Fetch paths for deletion
    const { data: toDelete, error: fetchErr } = await supabase
      .from("project_media")
      .select("id, path")
      .in("id", mediaIds);
    if (fetchErr) {
      console.error("Error fetching media to delete:", fetchErr);
      return;
    }
    // Remove from Storage
    for (const m of toDelete || []) {
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .remove([m.path]);
      if (storageErr) console.error("Storage deletion error:", storageErr);
    }
    // Remove from DB
    const { error: dbErr } = await supabase
      .from("project_media")
      .delete()
      .in("id", mediaIds);
    if (dbErr) console.error("Database deletion error:", dbErr);
  };

  const handleCreate = async () => {
    const { data: newProj, error: insertErr } = await supabase
      .from("project")
      .insert({
        profile_id: profileId,
        title: formData.title,
        description: formData.description,
        url: formData.url || null,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // Upload files and insert media records
    const mediaData = await uploadMedia(newProj.id, formData.mediaFiles);
    if (mediaData.length) {
      const { error: mediaErr } = await supabase.from("project_media").insert(
        mediaData.map((m) => ({
          project_id: newProj.id,
          type: m.type,
          url: m.url,
          path: m.path,
          caption: m.caption,
        })),
      );
      if (mediaErr) throw mediaErr;
    }

    // Insert skills
    if (formData.skills.length) {
      const { error: skillErr } = await supabase.from("project_skill").insert(
        formData.skills.map((name) => ({
          project_id: newProj.id,
          name,
          type: "other",
        })),
      );
      if (skillErr) throw skillErr;
    }

    // Fetch full project with proper data transformation
    const { data: fullProj, error: fetchErr } = await supabase
      .from("project")
      .select(`*, project_media(*), project_skill(*)`)
      .eq("id", newProj.id)
      .single();
    if (fetchErr) throw fetchErr;

    // Transform the data to match Project type
    const transformedProject: Project = {
      id: fullProj.id,
      profileId: fullProj.profile_id,
      title: fullProj.title,
      description: fullProj.description,
      url: fullProj.url,
      media: fullProj.project_media || [],
      skills: fullProj.project_skill || [],
      createdAt: fullProj.created_at,
      updatedAt: fullProj.updated_at,
    };

    onSave([transformedProject, ...existingProjects]);
  };

  const handleUpdate = async () => {
    if (!editingProject) return;
    const id = editingProject.id;
    // Update project
    const { error: updErr } = await supabase
      .from("project")
      .update({
        title: formData.title,
        description: formData.description,
        url: formData.url || null,
      })
      .eq("id", id);
    if (updErr) throw updErr;

    // Reset skills
    await supabase.from("project_skill").delete().eq("project_id", id);
    if (formData.skills.length) {
      const { error: skillErr } = await supabase.from("project_skill").insert(
        formData.skills.map((name) => ({
          project_id: id,
          name,
          type: "other",
        })),
      );
      if (skillErr) throw skillErr;
    }

    // Delete removed media
    if (formData.mediaToDelete.length) {
      await deleteMedia(formData.mediaToDelete);
    }

    // Upload new media
    if (formData.mediaFiles.length) {
      const newMedia = await uploadMedia(id, formData.mediaFiles);
      if (newMedia.length) {
        const { error: mediaErr } = await supabase.from("project_media").insert(
          newMedia.map((m) => ({
            project_id: id,
            type: m.type,
            url: m.url,
            path: m.path,
            caption: m.caption,
          })),
        );
        if (mediaErr) throw mediaErr;
      }
    }

    // Fetch updated project with proper data transformation
    const { data: updated, error: fetchErr } = await supabase
      .from("project")
      .select(`*, project_media(*), project_skill(*)`)
      .eq("id", id)
      .single();
    if (fetchErr) throw fetchErr;

    // Transform the data to match Project type
    const transformedProject: Project = {
      id: updated.id,
      profileId: updated.profile_id,
      title: updated.title,
      description: updated.description,
      url: updated.url,
      media: updated.project_media || [],
      skills: updated.project_skill || [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    onSave(existingProjects.map((p) => (p.id === id ? transformedProject : p)));
  };

  const handleClose = () => {
    if (isSaving) return; // Prevent closing while saving
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("プロジェクトタイトルを入力してください");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("プロジェクトの説明を入力してください");
      return;
    }
    const totalCount =
      formData.existingMedia.length + formData.mediaFiles.length;
    if (!totalCount) {
      toast.error("プロジェクト画像または動画を1つ以上追加してください");
      return;
    }
    setIsSaving(true);
    try {
      if (editingProject) await handleUpdate();
      else await handleCreate();

      // Reset form immediately
      resetForm();
      setIsSaving(false);

      // Close modal immediately without delay
      onClose();

      toast.success(
        editingProject
          ? "プロジェクトを更新しました"
          : "プロジェクトを作成しました",
      );
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "エラーが発生しました");
      setIsSaving(false);
    }
  };

  const totalMediaCount =
    formData.existingMedia.length + formData.mediaFiles.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isSaving) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isSaving) {
            e.preventDefault();
          }
        }}
        // Force focus management cleanup
        onCloseAutoFocus={(e) => {
          // Prevent auto-focus issues that can cause scroll lock
          e.preventDefault();
          // Restore body scroll
          document.body.style.overflow = "unset";
          document.body.style.pointerEvents = "unset";
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "プロジェクトを編集" : "新しいプロジェクト"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <Input
            placeholder="プロジェクトタイトル"
            value={formData.title}
            onChange={(e) =>
              setFormData((f) => ({ ...f, title: e.target.value }))
            }
            className="font-semibold"
          />

          {/* Description */}
          <Textarea
            placeholder="プロジェクトについて説明してください..."
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            className="resize-none"
          />

          {/* Media Upload */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                メディア ({totalMediaCount})
              </label>
              <span className="text-xs text-muted-foreground">最大10MB</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Media Grid */}
            {totalMediaCount > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {/* Existing Media */}
                {formData.existingMedia.map((media) => (
                  <ProjectMediaDisplay
                    key={media.id}
                    media={media}
                    onRemove={() => removeExistingMedia(media.id!)}
                  />
                ))}

                {/* New Media Preview */}
                {formData.mediaFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square bg-muted rounded-md overflow-hidden"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/50 rounded-full p-2">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeMediaFile(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Media Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              メディアを追加
            </Button>
          </div>

          {/* Skills Input */}
          <div className="space-y-2">
            <Input
              placeholder="スキルを追加 (Enterで確定)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="text-sm"
            />
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {skill}
                    <button
                      onClick={() => removeSkill(i)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="プロジェクトURL (オプション)"
              value={formData.url}
              onChange={(e) =>
                setFormData((f) => ({ ...f, url: e.target.value }))
              }
              className="text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.title.trim() ||
                !formData.description.trim() ||
                totalMediaCount === 0 ||
                isSaving
              }
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProject ? "更新" : "投稿"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
