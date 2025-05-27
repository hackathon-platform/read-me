'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Portfolio, Social, Project, Experience, ProjectMedia, Skill, Qualification } from '@/lib/types';
import { usePortfolioStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Github, Linkedin, Instagram, Facebook, Upload, Image as ImageIcon, Building2, Video, Award, ArrowUp, ArrowDown, Link } from 'lucide-react';
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
  const [experiences, setExperiences] = useState<Experience[]>(portfolio.experience);
  const [socials, setSocials] = useState<Social[]>(portfolio.socials);
  const [projects, setProjects] = useState<Project[]>(portfolio.projects);
  const [qualifications, setQualifications] = useState<Qualification[]>(portfolio.qualifications || []);
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

  const moveItem = (array: any[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= array.length) return array;
    const newArray = [...array];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    return newArray;
  };

  const moveQualification = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setQualifications(moveItem(qualifications, index, newIndex));
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setExperiences(moveItem(experiences, index, newIndex));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setProjects(moveItem(projects, index, newIndex));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updatePortfolio({
      ...values,
      projects,
      qualifications
    });
    updateSocials(socials);
    updateExperience(experiences);
    
    toast({ title: "保存しました", description: "ポートフォリオが更新されました。" });
    setTimeout(() => {
      router.push('/profile');
    }, 300);  // 300ms gives the toast time to mount

  };

  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    const MAX_FILE_SIZE_MB = 15;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast({
        title: "ファイルサイズが大きすぎます",
        description: `ファイルサイズは${MAX_FILE_SIZE_MB}MB以下にしてください。`,
        variant: "destructive"
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, (url) => form.setValue('imageUrl', url));
    }
  };

  const handleCompanyIconUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, (url) => updateExperienceField(index, 'iconUrl', url));
    }
  };

  const handleProjectMediaUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = event.target.files;
    if (!files) return;
  
    Array.from(files).forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      handleFileUpload(file, (url) => {
        setProjects(old => {
          const next = [...old];
          const mediaList = next[index].media ?? [];
          if (!mediaList.some(m => m.url === url)) {
            next[index].media = [...mediaList, { type, url }];
          }
          return next;
        });
      });
    });
    event.target.value = '';
  };
  

  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, (url) => updatePortfolio({ resumeUrl: url }));
    }
  };

  const addSocial = () => {
    if (socials.length >= 5) {
      toast({
        title: "上限に達しました",
        description: "ソーシャルメディアは最大5つまでです。",
        variant: "destructive"
      });
      return;
    }
    setSocials([...socials, { platform: 'github', url: '' }]);
  };

  const removeSocial = (index: number) => {
    const newSocials = [...socials];
    newSocials.splice(index, 1);
    setSocials(newSocials);
  };

  const updateSocial = (index: number, platform: Social['platform'], url: string, label?: string) => {
    const platformExists = socials.some((social, i) => i !== index && social.platform === platform);
    if (platformExists) {
      toast({
        title: "既に追加済みです",
        description: "同じプラットフォームは1つまでしか追加できません。",
        variant: "destructive"
      });
      return;
    }
    
    const newSocials = [...socials];
    newSocials[index] = { platform, url, label };
    setSocials(newSocials);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        skills: [],
      }
    ]);
  };

  const removeExperience = (index: number) => {
    const newExperiences = [...experiences];
    newExperiences.splice(index, 1);
    setExperiences(newExperiences);
  };

  const updateExperienceField = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setExperiences(newExperiences);
  };

  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      imageUrl: '',
      media: [],
      skills: [],
    }]);
  };

  const removeProject = (index: number) => {
    const newProjects = [...projects];
    newProjects.splice(index, 1);
    setProjects(newProjects);
  };

  const removeProjectMedia = (projectIndex: number, mediaIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].media.splice(mediaIndex, 1);
    setProjects(newProjects);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  const addSkill = (index: number, type: 'experience' | 'project') => {
    if (type === 'experience') {
      const newExperiences = [...experiences];
      if (!newExperiences[index].skills) {
        newExperiences[index].skills = [];
      }
      newExperiences[index].skills.push({ name: '', type: 'language' });
      setExperiences(newExperiences);
    } else {
      const newProjects = [...projects];
      if (!newProjects[index].skills) {
        newProjects[index].skills = [];
      }
      newProjects[index].skills.push({ name: '', type: 'language' });
      setProjects(newProjects);
    }
  };

  const removeSkill = (parentIndex: number, skillIndex: number, type: 'experience' | 'project') => {
    if (type === 'experience') {
      const newExperiences = [...experiences];
      newExperiences[parentIndex].skills.splice(skillIndex, 1);
      setExperiences(newExperiences);
    } else {
      const newProjects = [...projects];
      newProjects[parentIndex].skills.splice(skillIndex, 1);
      setProjects(newProjects);
    }
  };

  const updateSkill = (
    parentIndex: number,
    skillIndex: number,
    field: keyof Skill,
    value: string,
    type: 'experience' | 'project'
  ) => {
    if (type === 'experience') {
      const newExperiences = [...experiences];
      newExperiences[parentIndex].skills[skillIndex] = {
        ...newExperiences[parentIndex].skills[skillIndex],
        [field]: value,
      };
      setExperiences(newExperiences);
    } else {
      const newProjects = [...projects];
      newProjects[parentIndex].skills[skillIndex] = {
        ...newProjects[parentIndex].skills[skillIndex],
        [field]: value,
      };
      setProjects(newProjects);
    }
  };

  const addQualification = () => {
    setQualifications([...qualifications, {
      name: '',
      acquisitionDate: '',
      description: '',
      score: ''
    }]);
  };

  const removeQualification = (index: number) => {
    const newQualifications = [...qualifications];
    newQualifications.splice(index, 1);
    setQualifications(newQualifications);
  };

  const updateQualification = (index: number, field: keyof Qualification, value: string) => {
    const newQualifications = [...qualifications];
    newQualifications[index] = { ...newQualifications[index], [field]: value };
    setQualifications(newQualifications);
  };

  const getSocialIcon = (platform: Social['platform']) => {
    switch (platform) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
    }
  };

  const renderSkillsEditor = (parentIndex: number, skills: Skill[], type: 'experience' | 'project') => (
    <div className="space-y-2">
      <Label className="block mb-2">スキル</Label>
      <div className="space-y-3">
        {skills?.map((skill, skillIndex) => (
          <div key={skillIndex} className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Select
              value={skill.type}
              onValueChange={(value) => updateSkill(parentIndex, skillIndex, 'type', value, type)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="language">開発言語</SelectItem>
                <SelectItem value="framework">フレームワーク</SelectItem>
                <SelectItem value="tool">ツール</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="スキル名"
              value={skill.name}
              onChange={(e) => updateSkill(parentIndex, skillIndex, 'name', e.target.value, type)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSkill(parentIndex, skillIndex, type)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSkill(parentIndex, type)}
        >
          <Plus className="h-4 w-4 mr-1" /> スキルを追加
        </Button>
      </div>
    </div>
  );

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
              <CardContent className="pt-6 space-y-8">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center justify-center">
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
                    <h3 className="text-lg font-semibold">ソーシャルメディア</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {socials.map((social, index) => (
                      <div key={index} className="flex flex-wrap gap-2 sm:flex-nowrap items-start">
                        <Select
                          defaultValue={social.platform}
                          onValueChange={(value: Social['platform']) => updateSocial(index, value, social.url, social.label)}
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
                          onChange={(e) => updateSocial(index, social.platform, e.target.value, social.label)}
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
                
                {/* Education Section */}
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
                    {experiences.map((experience, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex md:flex-col gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveExperience(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveExperience(index, 'down')}
                              disabled={index === experiences.length - 1}
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
                                  value={experience.company}
                                  onChange={(e) => updateExperienceField(index, 'company', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>役職</Label>
                                <Input
                                  placeholder="例: ソフトウェアエンジニア"
                                  value={experience.position}
                                  onChange={(e) => updateExperienceField(index, 'position', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>開始年月</Label>
                                <Input
                                  type="month"
                                  value={experience.startDate}
                                  onChange={(e) => updateExperienceField(index, 'startDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>終了年月</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    type="month"
                                    value={experience.endDate === 'present' ? '' : experience.endDate}
                                    onChange={(e) => updateExperienceField(index, 'endDate', e.target.value)}
                                    disabled={experience.endDate === 'present'}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="whitespace-nowrap"
                                    onClick={() => updateExperienceField(index, 'endDate', experience.endDate === 'present' ? '' : 'present')}
                                  >
                                    {experience.endDate === 'present' ? '終了日を設定' : '現在も在籍中'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>説明</Label>
                              <Textarea
                                placeholder="職務内容や成果を記入してください"
                                value={experience.description}
                                onChange={(e) => updateExperienceField(index, 'description', e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>会社アイコン</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                                  {experience.iconUrl ? (
                                    <img
                                      src={experience.iconUrl}
                                      alt={experience.company}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Building2 className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`company-icon-${index}`}
                                  onChange={(e) => handleCompanyIconUpload(e, index)}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`company-icon-${index}`)?.click()}
                                >
                                  アイコンをアップロード
                                </Button>
                              </div>
                            </div>
                            {renderSkillsEditor(index, experience.skills || [], 'experience')}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExperience(index)}
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
                    {qualifications.map((qualification, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex md:flex-col gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQualification(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQualification(index, 'down')}
                              disabled={index === qualifications.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                              <Label>資格名</Label>
                              <Input
                                placeholder="例: TOEIC"
                                value={qualification.name}
                                onChange={(e) => updateQualification(index, 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>取得年月</Label>
                              <Input
                                type="month"
                                value={qualification.acquisitionDate}
                                onChange={(e) => updateQualification(index, 'acquisitionDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>スコア・点数（オプション）</Label>
                              <Input
                                placeholder="例: 850点"
                                value={qualification.score}
                                onChange={(e) => updateQualification(index, 'score', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>説明（オプション）</Label>
                              <Textarea
                                placeholder="補足説明があれば入力してください"
                                value={qualification.description}
                                onChange={(e) => updateQualification(index, 'description', e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQualification(index)}
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
          
          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">プロジェクト</h3>
                </div>
                
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex md:flex-col gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(index, 'down')}
                            disabled={index === projects.length - 1}
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
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>説明</Label>
                            <Textarea
                              placeholder="プロジェクトの説明"
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>プロジェクトURL（オプション）</Label>
                            <Input
                              placeholder="https://..."
                              value={project.url}
                              onChange={(e) => updateProject(index, 'url', e.target.value)}
                            />
                          </div>
                          {renderSkillsEditor(index, project.skills || [], 'project')}
                          <div className="space-y-2">
                            <Label>メディア</Label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {project.media?.map((media, mediaIndex) => (
                                <div key={mediaIndex} className="relative group">
                                  {media.type === 'image' ? (
                                    <img
                                      src={media.url}
                                      alt={`${project.title} - メディア ${mediaIndex + 1}`}
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
                                    onClick={() => removeProjectMedia(index, mediaIndex)}
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
                                id={`project-media-${index}`}
                                onChange={(e) => handleProjectMediaUpload(e, index)}
                                className="hidden"
                                multiple
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById(`project-media-${index}`)?.click()}
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
                          onClick={() => removeProject(index)}
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
                    onClick={addProject}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
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