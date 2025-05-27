'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Portfolio, Social, Project } from '@/lib/types';
import { usePortfolioStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Github, Linkedin, Instagram, Facebook, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  firstName: z.string().min(1, { message: '名前を入力してください。' }),
  lastName: z.string().min(1, { message: '姓を入力してください。' }),
  firstNameKana: z.string().min(1, { message: '名前（フリガナ）を入力してください。' }),
  lastNameKana: z.string().min(1, { message: '姓（フリガナ）を入力してください。' }),
  imageUrl: z.string().optional(),
  education: z.string().optional(),
});

export function PortfolioEditForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { portfolio, updatePortfolio, updateSocials, updateExperience } = usePortfolioStore();
  const [experiences, setExperiences] = useState<string[]>(portfolio.experience);
  const [socials, setSocials] = useState<Social[]>(portfolio.socials);
  const [projects, setProjects] = useState<Project[]>(portfolio.projects);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: portfolio.firstName,
      lastName: portfolio.lastName,
      firstNameKana: portfolio.firstNameKana,
      lastNameKana: portfolio.lastNameKana,
      imageUrl: portfolio.imageUrl,
      education: portfolio.education,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updatePortfolio({
      ...values,
      projects
    });
    updateSocials(socials);
    updateExperience(experiences);
    
    toast({
      title: "保存しました",
      description: "ポートフォリオが更新されました。",
    });
    
    router.push('/profile');
  };

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          form.setValue('imageUrl', e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF upload
  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          updatePortfolio({ resumeUrl: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Manage socials
  const addSocial = () => {
    setSocials([...socials, { platform: 'github', url: '' }]);
  };

  const removeSocial = (index: number) => {
    const newSocials = [...socials];
    newSocials.splice(index, 1);
    setSocials(newSocials);
  };

  const updateSocial = (index: number, platform: Social['platform'], url: string) => {
    const newSocials = [...socials];
    newSocials[index] = { platform, url };
    setSocials(newSocials);
  };

  // Manage experiences
  const addExperience = () => {
    setExperiences([...experiences, '']);
  };

  const removeExperience = (index: number) => {
    const newExperiences = [...experiences];
    newExperiences.splice(index, 1);
    setExperiences(newExperiences);
  };

  const updateExperienceItem = (index: number, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = value;
    setExperiences(newExperiences);
  };

  // Manage projects
  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }]);
  };

  const removeProject = (index: number) => {
    const newProjects = [...projects];
    newProjects.splice(index, 1);
    setProjects(newProjects);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  const getSocialIcon = (platform: Social['platform']) => {
    switch (platform) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10 animate-in fade-in duration-500">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center mb-6">
                  <Avatar className="h-24 w-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                    <AvatarImage src={form.watch('imageUrl')} />
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
                        <FormLabel>名（フリガナ）</FormLabel>
                        <FormControl>
                          <Input placeholder="タロウ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">ソーシャルメディア</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocial}
                    >
                      <Plus className="h-4 w-4 mr-1" /> 追加
                    </Button>
                  </div>
                  
                  {socials.map((social, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        defaultValue={social.platform}
                        onValueChange={(value: Social['platform']) => updateSocial(index, value, social.url)}
                      >
                        <SelectTrigger className="w-[140px]">
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
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="URLを入力"
                        value={social.url}
                        onChange={(e) => updateSocial(index, social.platform, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocial(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最終学歴</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="例: ウォータールー大学コンピューターサイエンス学部（2026年卒業）"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">過去の経験</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExperience}
                    >
                      <Plus className="h-4 w-4 mr-1" /> 追加
                    </Button>
                  </div>
                  
                  {experiences.map((experience, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        placeholder="例: 株式会社テクノロジー（2019年4月〜2021年3月）- ソフトウェアエンジニア"
                        value={experience}
                        onChange={(e) => updateExperienceItem(index, e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <Label>履歴書 PDF</Label>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg mt-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => pdfInputRef.current?.click()}>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">PDFをアップロード</p>
                    {portfolio.resumeUrl && (
                      <p className="text-xs text-primary mt-2">PDFがアップロード済み</p>
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
          
          <TabsContent value="projects">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">プロジェクト</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProject}
                    >
                      <Plus className="h-4 w-4 mr-1" /> 追加
                    </Button>
                  </div>
                  
                  {projects.map((project, index) => (
                    <div key={index} className="space-y-4 border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          <Input
                            placeholder="プロジェクト名"
                            value={project.title}
                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="プロジェクトの説明"
                            value={project.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            rows={3}
                          />
                          <Input
                            placeholder="プロジェクト画像URL"
                            value={project.imageUrl}
                            onChange={(e) => updateProject(index, 'imageUrl', e.target.value)}
                          />
                          <Input
                            placeholder="プロジェクトURL（オプション）"
                            value={project.url}
                            onChange={(e) => updateProject(index, 'url', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProject(index)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Form>
  );
}