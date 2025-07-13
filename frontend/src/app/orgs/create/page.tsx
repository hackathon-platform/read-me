'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createOrganization } from "@/lib/api/organization";
import { uploadImage } from "@/lib/api/upload";
import {
  Loader2,
  Upload,
  Globe,
  Mail,
  Building2,
  Hash,
  FileText,
  Image,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreateOrganizationForm() {
  const router = useRouter();
  const { user } = useSupabaseAuth();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    email: "",
    bannerUrl: "",
    iconUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "slug" ? value.toLowerCase().replace(/[^a-z0-9-]/g, "") : value,
    }));
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.slug) return;

    setUploadingBanner(true);
    try {
      const preview = URL.createObjectURL(file);
      setBannerPreview(preview);

      const publicUrl = await uploadImage(file, "banner", formData.slug);
      setFormData((prev) => ({ ...prev, bannerUrl: publicUrl }));
    } catch (err) {
      console.error("Banner upload failed", err);
      toast.error("バナーのアップロードに失敗しました");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.slug) return;

    setUploadingIcon(true);
    try {
      const preview = URL.createObjectURL(file);
      setIconPreview(preview);

      const publicUrl = await uploadImage(file, "icon", formData.slug);
      setFormData((prev) => ({ ...prev, iconUrl: publicUrl }));
    } catch (err) {
      console.error("Icon upload failed", err);
      toast.error("アイコンのアップロードに失敗しました");
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast.error("ログインが必要です");

    setLoading(true);
    try {
      const org = await createOrganization({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        website: formData.website,
        email: formData.email,
        banner_url: formData.bannerUrl,
        icon_url: formData.iconUrl,
        created_by: user.id,
      });
      toast.success("組織を作成しました");
      router.push(`/orgs/${org.slug}`);
    } catch (err) {
      console.error("Organization creation failed", err);
      toast.error("組織の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.slug;

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">新しい組織を作成</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Organization Name */}
            <div>
                <input
                  type="text"
                  placeholder="組織名"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full text-2xl font-bold bg-transparent border-b-2 pb-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL スラッグ <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="例: tokyo-tech-community"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                小文字の英数字とハイフンのみ使用可能
              </p>
              {formData.slug && (
                <p className="text-xs text-primary mt-1">
                  URL: yoursite.com/orgs/{formData.slug}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                組織の説明
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-4 text-muted-foreground w-4 h-4" />
                <textarea
                  placeholder="組織の活動内容や目的を説明してください"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors resize-none bg-background text-foreground"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ウェブサイト
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                連絡先メール
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          {/* Image Upload Section */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2 text-primary" />
                画像設定
              </h2>
              <div className="space-y-4">
                {!formData.slug && (
                  <div className="bg-muted border border-border rounded-lg p-3">
                    <p className="text-muted-foreground text-sm">
                      画像をアップロードするには、まずスラッグを設定してください
                    </p>
                  </div>
                )}
                {/* Banner Upload */}
                {formData.slug && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      バナー画像
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner || !formData.slug}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        uploadingBanner || !formData.slug 
                          ? 'opacity-50 cursor-not-allowed border-border' 
                          : 'border-border hover:border-primary hover:bg-primary/10'
                      }`}
                    >
                    <div className="text-center">
                      {uploadingBanner ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      )}
                      <p className="text-sm text-foreground">
                        {uploadingBanner ? 'アップロード中...' : 'バナー画像をアップロード'}
                      </p>
                      <p className="text-xs text-muted-foreground">推奨: 1600x400px</p>
                    </div>
                  </label>
                </div>
                )}

                {/* Icon Upload */}
                {formData.slug && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    アイコン画像
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    disabled={uploadingIcon || !formData.slug}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      uploadingIcon || !formData.slug 
                        ? 'opacity-50 cursor-not-allowed border-border' 
                        : 'border-border hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    <div className="text-center">
                      {uploadingIcon ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      )}
                      <p className="text-sm text-foreground">
                        {uploadingIcon ? 'アップロード中...' : 'アイコン画像をアップロード'}
                      </p>
                      <p className="text-xs text-muted-foreground">推奨: 256x256px</p>
                    </div>
                  </label>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Preview */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent>
              <h2 className="text-lg font-bold mb-1 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                プレビュー
              </h2>
              <p className="text-sm mb-3 text-muted-foreground">
                左側のフォームを入力すると、このプレビューが更新されます
              </p>
              
              {/* Organization Page Preview */}
              <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
                {/* Banner Section */}
                <div className="relative h-32 bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 to-cyan-400">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white/90">
                        <Image className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">バナー画像</p>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-4 left-8 w-12 h-12 bg-white/20 rounded-full blur-xl"></div>
                      <div className="absolute bottom-6 right-12 w-8 h-8 bg-yellow-300/30 rounded-full blur-lg"></div>
                      <div className="absolute top-8 right-20 w-6 h-6 bg-pink-300/40 rounded-full blur-md"></div>
                      <div className="absolute bottom-4 left-16 w-10 h-10 bg-blue-300/25 rounded-full blur-lg"></div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 bg-background rounded-full border-3 border-background shadow-md flex items-center justify-center">
                      {iconPreview ? (
                        <img
                          src={iconPreview}
                          alt="Icon"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="pt-12 pb-6 px-6">
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {formData.name || "組織名"}
                    </h1>
                    {formData.slug && (
                      <p className="text-sm text-muted-foreground mb-2">
                        @{formData.slug}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {formData.description || "組織の説明がここに表示されます"}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {formData.website && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="w-4 h-4 mr-2" />
                        <a href={formData.website} className="text-blue-600 hover:underline">
                          {formData.website}
                        </a>
                      </div>
                    )}
                    {formData.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href={`mailto:${formData.email}`} className="text-blue-600 hover:underline">
                          {formData.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Sample Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <Button size="sm">
                      フォロー
                    </Button>
                    <Button size="sm" variant="outline">
                      イベントを見る
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingBanner || uploadingIcon || !isFormValid}
            className="w-full py-4 text-lg mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                作成中...
              </>
            ) : (
              "組織を作成"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Eye({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
