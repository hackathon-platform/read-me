"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Image, Video, Trash2 } from "lucide-react";
import { uploadFeedMedia, createFeedPost } from "@/lib/api/feed";
import type { ProjectMedia } from "@/lib/types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedPostForm({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    type: "project" as "project" | "activity",
    title: "",
    description: "",
  });
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        const url = await uploadFeedMedia(file, mediaType);
        return {
          type: mediaType,
          url,
          caption: "",
        } as ProjectMedia;
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...uploadedMedia]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました。もう一度お試しください。');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('タイトルと説明を入力してください。');
      return;
    }

    if (media.length === 0) {
      alert('画像または動画を1つ以上アップロードしてください。');
      return;
    }

    setSubmitting(true);
    try {
      await createFeedPost({
        ...formData,
        media: media.map(m => ({
          type: m.type,
          url: m.url,
          caption: m.caption || ""
        }))
      });
      alert('投稿を作成しました！');
      onSuccess();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          新しい投稿
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">投稿タイプ</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "project" | "activity") => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="投稿タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">プロジェクト</SelectItem>
                <SelectItem value="activity">活動</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="投稿のタイトルを入力"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="投稿の説明を入力"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>メディア (必須)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">
                  画像または動画をアップロード
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="media-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'アップロード中...' : 'ファイルを選択'}
                </Button>
              </div>
            </div>
          </div>

          {media.length > 0 && (
            <div className="space-y-2">
              <Label>アップロードされたメディア</Label>
              <div className="grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeMedia(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="absolute top-1 left-1 bg-black/50 rounded px-1 py-0.5">
                      {item.type === 'image' ? (
                        <Image className="h-3 w-3 text-white" />
                      ) : (
                        <Video className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? '投稿中...' : '投稿する'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}